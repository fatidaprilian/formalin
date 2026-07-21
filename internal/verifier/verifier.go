package verifier

import (
	"fmt"

	"formalin/internal/events"
)

type DriftReport struct {
	PlatformChanged  bool
	PlatformOld      events.PlatformInfo
	PlatformNew      events.PlatformInfo
	ChangedProcesses []string
	MissingInputs    []string
	NewInputs        []string
	ChangedInputs    []string // path and hash changes
	NewNetworkHosts  []string
	NewFindings      []string
}

// HasDrift returns true if any build drifts were detected.
func (d *DriftReport) HasDrift() bool {
	return d.PlatformChanged ||
		len(d.ChangedProcesses) > 0 ||
		len(d.MissingInputs) > 0 ||
		len(d.NewInputs) > 0 ||
		len(d.ChangedInputs) > 0 ||
		len(d.NewNetworkHosts) > 0 ||
		len(d.NewFindings) > 0
}

// Verify compares the baseline build observation with a fresh current observation.
func Verify(baseline, current *events.BuildObservation) *DriftReport {
	report := &DriftReport{}

	// 1. Platform validation
	if baseline.Platform.OS != current.Platform.OS || baseline.Platform.Architecture != current.Platform.Architecture {
		report.PlatformChanged = true
		report.PlatformOld = baseline.Platform
		report.PlatformNew = current.Platform
	}

	// 2. Processes validation
	baselineProc := make(map[string]string) // executable path -> SHA-256
	for _, proc := range baseline.Processes {
		baselineProc[proc.Executable] = proc.SHA256
	}

	for _, proc := range current.Processes {
		oldHash, exists := baselineProc[proc.Executable]
		if !exists {
			report.ChangedProcesses = append(report.ChangedProcesses, fmt.Sprintf("New process spawned: %s", proc.Executable))
		} else if oldHash != proc.SHA256 && proc.SHA256 != "" && oldHash != "" {
			report.ChangedProcesses = append(report.ChangedProcesses, fmt.Sprintf("Process executable modified: %s (SHA changed from %s to %s)", proc.Executable, oldHash, proc.SHA256))
		}
	}

	// 3. Inputs validation
	baselineInputs := make(map[string]string) // file path -> SHA-256
	for _, input := range baseline.Inputs {
		baselineInputs[input.Path] = input.SHA256
	}

	currentInputs := make(map[string]string)
	for _, input := range current.Inputs {
		currentInputs[input.Path] = input.SHA256
	}

	// Find missing and changed input files
	for path, oldHash := range baselineInputs {
		newHash, exists := currentInputs[path]
		if !exists {
			report.MissingInputs = append(report.MissingInputs, path)
		} else if oldHash != newHash && oldHash != "" && newHash != "" {
			report.ChangedInputs = append(report.ChangedInputs, fmt.Sprintf("%s (SHA changed from %s to %s)", path, oldHash, newHash))
		}
	}

	// Find new input files
	for path := range currentInputs {
		if _, exists := baselineInputs[path]; !exists {
			report.NewInputs = append(report.NewInputs, path)
		}
	}

	// 4. Network validation
	baselineNet := make(map[string]bool)
	for _, n := range baseline.Network {
		baselineNet[n.Host] = true
	}

	for _, n := range current.Network {
		if !baselineNet[n.Host] {
			report.NewNetworkHosts = append(report.NewNetworkHosts, fmt.Sprintf("New connection to %s:%d initiated by %s", n.Host, n.Port, n.Process))
		}
	}

	// 5. Findings validation
	baselineFindings := make(map[string]bool)
	for _, f := range baseline.Findings {
		baselineFindings[f.Rule+":"+f.Message] = true
	}

	for _, f := range current.Findings {
		if !baselineFindings[f.Rule+":"+f.Message] {
			report.NewFindings = append(report.NewFindings, fmt.Sprintf("[%s] %s", f.Rule, f.Message))
		}
	}

	return report
}
