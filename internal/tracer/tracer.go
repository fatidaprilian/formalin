package tracer

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"formalin/internal/events"
)

var (
	execveRegex  = regexp.MustCompile(`execve\(\s*"([^"]+)",\s*\[([^\]]*)\],?.*\)\s*=\s*(-?\d+)`)
	openatRegex  = regexp.MustCompile(`openat\(\s*(?:AT_FDCWD|[^,]+),\s*"([^"]+)",\s*([^)]+)\)\s*=\s*(-?\d+|0x[0-9a-f]+)`)
	openRegex    = regexp.MustCompile(`open\(\s*"([^"]+)",\s*([^)]+)\)\s*=\s*(-?\d+|0x[0-9a-f]+)`)
	connectRegex = regexp.MustCompile(`connect\([^,]+,\s*\{sa_family=AF_INET6?,\s*(?:sin_port|sin6_port)=htons\((\d+)\),\s*(?:sin_addr=inet_addr\("([^"]+)"\)|sin6_addr=inet_pton\("([^"]+)"\))\}`)
)

type Tracer struct {
	StracePath string
	LogDir     string
}

// NewTracer checks for the strace binary and initializes the tracer.
func NewTracer(logDir string) (*Tracer, error) {
	stracePath, err := exec.LookPath("strace")
	if err != nil {
		return nil, fmt.Errorf("strace is required but not installed. Please install 'strace' using your package manager: %w", err)
	}
	return &Tracer{
		StracePath: stracePath,
		LogDir:     logDir,
	}, nil
}

// Run executes the sandbox target command wrapped inside strace and parses the logs.
func (t *Tracer) Run(bwrapCmd string, bwrapArgs []string) ([]events.Event, error) {
	outputPath := filepath.Join(t.LogDir, "strace.log")

	// Construct the strace wrapper arguments
	args := []string{
		"-ff",
		"-yy",
		"-s", "4096",
		"-e", "trace=%file,%process,%network",
		"-o", outputPath,
		"--",
		bwrapCmd,
	}
	args = append(args, bwrapArgs...)

	cmd := exec.Command(t.StracePath, args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	// Run the build process
	err := cmd.Run()
	if err != nil {
		fmt.Printf("Build run completed with exit error (or build itself failed): %v\n", err)
	}

	// Collect and parse all generated log files (strace.log.<pid>)
	files, err := filepath.Glob(outputPath + ".*")
	if err != nil {
		return nil, fmt.Errorf("failed to list trace output files: %w", err)
	}

	var allEvents []events.Event
	for _, file := range files {
		evs, err := t.parseTraceFile(file)
		if err != nil {
			fmt.Printf("Warning: failed to parse trace file %s: %v\n", file, err)
			continue
		}
		allEvents = append(allEvents, evs...)
	}

	return allEvents, nil
}

// parseTraceFile reads a single strace log file line-by-line.
func (t *Tracer) parseTraceFile(filePath string) ([]events.Event, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	// Extract PID from the file name suffix
	fileName := filepath.Base(filePath)
	parts := strings.Split(fileName, ".")
	pidStr := parts[len(parts)-1]
	pid, _ := strconv.Atoi(pidStr)

	var fileEvents []events.Event
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()

		// 1. Process Start (execve)
		if m := execveRegex.FindStringSubmatch(line); m != nil {
			execPath := m[1]
			argsStr := m[2]
			res := m[3]

			args := parseArgs(argsStr)
			fileEvents = append(fileEvents, events.Event{
				Timestamp: time.Now(),
				ProcessID: pid,
				Type:      events.EventProcessStart,
				Operation: "execve",
				Path:      execPath,
				Arguments: args,
				Result:    res,
			})
			continue
		}

		// 2. File Reads (open/openat)
		var pathVal string
		var operation string
		var res string
		var matched bool

		if m := openatRegex.FindStringSubmatch(line); m != nil {
			pathVal = m[1]
			res = m[3]
			operation = "openat"
			matched = true
		} else if m := openRegex.FindStringSubmatch(line); m != nil {
			pathVal = m[1]
			res = m[3]
			operation = "open"
			matched = true
		}

		if matched {
			fd, err := strconv.Atoi(res)
			// A valid file descriptor is non-negative
			if err == nil && fd >= 0 {
				fileEvents = append(fileEvents, events.Event{
					Timestamp: time.Now(),
					ProcessID: pid,
					Type:      events.EventFileRead,
					Operation: operation,
					Path:      pathVal,
					Result:    res,
				})
			}
			continue
		}

		// 3. Network socket connects
		if m := connectRegex.FindStringSubmatch(line); m != nil {
			portStr := m[1]
			ipStr := m[2]
			if ipStr == "" {
				ipStr = m[3] // IPv6 match group
			}
			port, _ := strconv.Atoi(portStr)

			fileEvents = append(fileEvents, events.Event{
				Timestamp: time.Now(),
				ProcessID: pid,
				Type:      events.EventNetworkOpen,
				Operation: "connect",
				Endpoint:  fmt.Sprintf("%s:%d", ipStr, port),
				Result:    "success",
			})
		}
	}

	return fileEvents, scanner.Err()
}

// parseArgs parses strace argv array string format, handling nested commas/escaped quotes.
func parseArgs(argsStr string) []string {
	var args []string
	var current strings.Builder
	inQuote := false
	escaped := false

	for i := 0; i < len(argsStr); i++ {
		char := argsStr[i]
		if escaped {
			current.WriteByte(char)
			escaped = false
			continue
		}
		if char == '\\' {
			escaped = true
			continue
		}
		if char == '"' {
			inQuote = !inQuote
			continue
		}
		if char == ',' && !inQuote {
			args = append(args, strings.TrimSpace(current.String()))
			current.Reset()
			continue
		}
		current.WriteByte(char)
	}
	if current.Len() > 0 {
		args = append(args, strings.TrimSpace(current.String()))
	}
	return args
}
