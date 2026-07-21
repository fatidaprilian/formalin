package analyzer

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"formalin/internal/events"
	"formalin/internal/hasher"
)

var (
	gitSHA1Regex = regexp.MustCompile(`^[0-9a-f]{40}$`)
	urlRegex     = regexp.MustCompile(`https?://[^\s]+`)
)

type Analyzer struct {
	WorkspaceDir string
	SnapshotDir  string
	BuildCmd     []string
}

func NewAnalyzer(workspaceDir, snapshotDir string, buildCmd []string) *Analyzer {
	return &Analyzer{
		WorkspaceDir: workspaceDir,
		SnapshotDir:  snapshotDir,
		BuildCmd:     buildCmd,
	}
}

// Analyze processes the raw trace events and builds the final BuildObservation structure.
func (a *Analyzer) Analyze(rawEvents []events.Event, materials []events.MaterialInfo) (*events.BuildObservation, error) {
	obs := &events.BuildObservation{
		SchemaVersion: "1",
		Command:       a.BuildCmd,
		Platform: events.PlatformInfo{
			OS:           "linux",
			Architecture: "amd64", // Standard, can be runtime detected if needed
			Kernel:       "6.x",
		},
		RemoteMaterials: materials,
	}

	// 1. Process mapping
	processMap := make(map[int]events.ProcessInfo)
	for _, ev := range rawEvents {
		if ev.Type == events.EventProcessStart {
			procPath := ev.Path
			// Resolve process path to host if it was in workspace
			hostProcPath := a.resolveToHost(procPath)

			origin := "host"
			if strings.HasPrefix(procPath, "/workspace") {
				origin = "workspace"
			}

			hash, _ := hasher.FileSHA256(hostProcPath)

			procInfo := events.ProcessInfo{
				PID:        ev.ProcessID,
				PPID:       ev.ParentPID,
				Executable: procPath,
				Arguments:  ev.Arguments,
				SHA256:     hash,
				Origin:     origin,
			}
			processMap[ev.ProcessID] = procInfo
		}
	}

	// Flatten processes slice
	for _, proc := range processMap {
		obs.Processes = append(obs.Processes, proc)
	}

	// 2. Input file reads
	inputMap := make(map[string]events.FileAccess)
	for _, ev := range rawEvents {
		if ev.Type == events.EventFileRead {
			// Skip temporary logs or standard noisy loader library lookups
			if a.isNoisySystemFile(ev.Path) {
				continue
			}

			hostPath := a.resolveToHost(ev.Path)
			hash, _ := hasher.FileSHA256(hostPath)

			origin := a.classifyPathOrigin(ev.Path)
			inputMap[ev.Path] = events.FileAccess{
				Path:   ev.Path,
				SHA256: hash,
				Origin: origin,
			}
		}
	}

	for _, input := range inputMap {
		obs.Inputs = append(obs.Inputs, input)
	}

	// 3. Output files detection (via post-build snapshot diff)
	outputs, err := a.detectFilesystemDiff()
	if err != nil {
		fmt.Printf("Warning: failed to detect filesystem diff for outputs: %v\n", err)
	} else {
		obs.Outputs = outputs
	}

	// 4. Network calls
	networkMap := make(map[string]events.NetworkAccess)
	for _, ev := range rawEvents {
		if ev.Type == events.EventNetworkOpen {
			endpoint := ev.Endpoint
			host, portStr, err := net.SplitHostPort(endpoint)
			if err != nil {
				host = endpoint
				portStr = "0"
			}
			port := 0
			fmt.Sscanf(portStr, "%d", &port)

			// Determine which process triggered the network call
			procName := "unknown"
			if proc, exists := processMap[ev.ProcessID]; exists {
				procName = proc.Executable
			}

			// Correlate if it belongs to registered materials (e.g. registry.npmjs.org)
			resolved := false
			for _, m := range materials {
				if strings.Contains(m.URI, host) {
					resolved = true
					break
				}
			}

			networkMap[endpoint] = events.NetworkAccess{
				Process:          procName,
				Host:             host,
				Port:             port,
				ResolvedMaterial: resolved,
			}
		}
	}

	for _, netCall := range networkMap {
		obs.Network = append(obs.Network, netCall)
	}

	// 5. Findings (Rules Engine)
	a.runRulesEngine(obs)

	return obs, nil
}

func (a *Analyzer) resolveToHost(sandboxPath string) string {
	if strings.HasPrefix(sandboxPath, "/workspace") {
		rel := strings.TrimPrefix(sandboxPath, "/workspace")
		return filepath.Join(a.SnapshotDir, rel)
	}
	return sandboxPath
}

func (a *Analyzer) classifyPathOrigin(sandboxPath string) string {
	if strings.HasPrefix(sandboxPath, "/workspace") {
		return "source"
	}
	if strings.HasPrefix(sandboxPath, "/usr/include") || strings.HasPrefix(sandboxPath, "/usr/lib/gcc") || strings.HasPrefix(sandboxPath, "/usr/bin") {
		return "host-toolchain"
	}
	if strings.HasPrefix(sandboxPath, "/tmp") {
		return "temporary"
	}
	return "external-user"
}

func (a *Analyzer) isNoisySystemFile(path string) bool {
	noisePrefixes := []string{
		"/proc/", "/sys/", "/dev/",
		"/etc/ld.so.cache", "/etc/ld.so.preload",
		"/lib/ld-linux", "/lib64/ld-linux",
	}
	for _, pref := range noisePrefixes {
		if strings.HasPrefix(path, pref) {
			return true
		}
	}
	// Avoid scanning standard shared libraries unless we are auditing them
	if strings.HasPrefix(path, "/lib/") || strings.HasPrefix(path, "/lib64/") || strings.HasPrefix(path, "/usr/lib/") {
		if !strings.Contains(path, "gcc") && !strings.Contains(path, "clang") {
			return true
		}
	}
	return false
}

// detectFilesystemDiff compares SnapshotDir with WorkspaceDir to identify generated files.
func (a *Analyzer) detectFilesystemDiff() ([]events.FileAccess, error) {
	var outputs []events.FileAccess

	err := filepath.Walk(a.SnapshotDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}

		rel, err := filepath.Rel(a.SnapshotDir, path)
		if err != nil {
			return nil
		}

		// Skip tracking workflow gate and temporary build logs
		if rel == "workflow-gate.json" || strings.HasPrefix(rel, ".git") {
			return nil
		}

		origPath := filepath.Join(a.WorkspaceDir, rel)
		origInfo, err := os.Stat(origPath)

		isNewOrModified := false
		if os.IsNotExist(err) {
			isNewOrModified = true
		} else if err == nil {
			// Compare size or hash
			if origInfo.Size() != info.Size() {
				isNewOrModified = true
			} else {
				h1, _ := hasher.FileSHA256(path)
				h2, _ := hasher.FileSHA256(origPath)
				if h1 != h2 && h1 != "" {
					isNewOrModified = true
				}
			}
		}

		if isNewOrModified {
			hash, _ := hasher.FileSHA256(path)
			outputs = append(outputs, events.FileAccess{
				Path:   filepath.Join("/workspace", rel),
				SHA256: hash,
				Origin: "output",
			})
		}
		return nil
	})

	return outputs, err
}

func (a *Analyzer) runRulesEngine(obs *events.BuildObservation) {
	// Rule DG001: Mutable Remote URL
	// Rule DG002: Floating Git reference
	for _, proc := range obs.Processes {
		procName := filepath.Base(proc.Executable)

		// DG001: curl/wget with mutable URLs
		if procName == "curl" || procName == "wget" {
			for _, arg := range proc.Arguments {
				if urlRegex.MatchString(arg) {
					if strings.Contains(arg, "latest") || strings.Contains(arg, "master") || strings.Contains(arg, "main") || !strings.Contains(arg, "-v") {
						obs.Findings = append(obs.Findings, events.Finding{
							Rule:     "DG001",
							Severity: "critical",
							Message:  fmt.Sprintf("Process '%s' downloaded from a mutable URL: %s", procName, arg),
						})
					}
				}
			}
		}

		// DG002: Floating Git reference
		if procName == "git" {
			isCloneOrCheckout := false
			hasSHA := false
			var targetRef string
			for i, arg := range proc.Arguments {
				if arg == "clone" || arg == "checkout" {
					isCloneOrCheckout = true
				}
				if isCloneOrCheckout && i > 1 {
					if gitSHA1Regex.MatchString(arg) {
						hasSHA = true
					} else if strings.HasPrefix(arg, "-b") || strings.Contains(arg, "origin/") {
						targetRef = arg
					}
				}
			}
			if isCloneOrCheckout && !hasSHA {
				msg := "Git reference is floating (e.g. branch or tag instead of a specific commit SHA)"
				if targetRef != "" {
					msg = fmt.Sprintf("Git reference is floating: branch/tag '%s' was specified instead of a specific commit SHA", targetRef)
				}
				obs.Findings = append(obs.Findings, events.Finding{
					Rule:     "DG002",
					Severity: "high",
					Message:  msg,
				})
			}
		}
	}

	// Rule DG003: Unresolved Network Dependency
	for _, netCall := range obs.Network {
		if !netCall.ResolvedMaterial && netCall.Host != "127.0.0.1" && netCall.Host != "localhost" {
			obs.Findings = append(obs.Findings, events.Finding{
				Rule:     "DG003",
				Severity: "high",
				Message:  fmt.Sprintf("Unresolved network connection to '%s:%d' initiated by '%s'. Connection could not be correlated with verified lockfile integrity metadata.", netCall.Host, netCall.Port, netCall.Process),
			})
		}
	}

	// Rule DG004: Ambient Host Toolchain
	hasHostToolchain := false
	for _, input := range obs.Inputs {
		if input.Origin == "host-toolchain" {
			if strings.Contains(input.Path, "/usr/bin/gcc") || strings.Contains(input.Path, "/usr/bin/g++") || strings.Contains(input.Path, "/usr/bin/make") {
				hasHostToolchain = true
				break
			}
		}
	}
	if hasHostToolchain {
		obs.Findings = append(obs.Findings, events.Finding{
			Rule:     "DG004",
			Severity: "medium",
			Message:  "Build depends on ambient host compiler/toolchain files (e.g. gcc, make). These may drift or disappear across different host platforms.",
		})
	}

	// Rule DG005: Input Outside Project
	for _, input := range obs.Inputs {
		if input.Origin == "external-user" {
			obs.Findings = append(obs.Findings, events.Finding{
				Rule:     "DG005",
				Severity: "high",
				Message:  fmt.Sprintf("External file accessed outside of the workspace directory: %s", input.Path),
			})
		}
	}

	// Rule DG007: Missing Integrity Metadata
	if len(obs.RemoteMaterials) > 0 {
		for _, mat := range obs.RemoteMaterials {
			if mat.SHA512 == "" {
				obs.Findings = append(obs.Findings, events.Finding{
					Rule:     "DG007",
					Severity: "high",
					Message:  fmt.Sprintf("Dependency resolved without content integrity metadata: %s", mat.URI),
				})
			}
		}
	}
}

// SHA256 helper for comparing file contents
func fileSHA256(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	h := sha256.New()
	if _, err := io.Copy(h, file); err != nil {
		return "", err
	}

	return hex.EncodeToString(h.Sum(nil)), nil
}
