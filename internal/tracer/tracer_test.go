package tracer

import (
	"os"
	"path/filepath"
	"testing"

	"formalin/internal/events"
)

func TestParseTraceFile(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "tracer-test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	logFilePath := filepath.Join(tmpDir, "strace.log.12345")
	content := `execve("/usr/bin/node", ["node", "build.js"], 0x7ffeb2957bd8 /* 23 vars */) = 0
openat(AT_FDCWD, "/workspace/package.json", O_RDONLY|O_CLOEXEC) = 3
open("/workspace/package-lock.json", O_RDONLY) = 4
connect(4, {sa_family=AF_INET, sin_port=htons(443), sin_addr=inet_addr("104.16.24.34")}, 16) = -1 EINPROGRESS
connect(5, {sa_family=AF_INET6, sin6_port=htons(80), sin6_addr=inet_pton("2606:4700::6810:1822")}, 28) = 0
`
	if err := os.WriteFile(logFilePath, []byte(content), 0644); err != nil {
		t.Fatalf("failed to write test log file: %v", err)
	}

	tracer := &Tracer{LogDir: tmpDir}
	evs, err := tracer.parseTraceFile(logFilePath)
	if err != nil {
		t.Fatalf("failed to parse trace file: %v", err)
	}

	if len(evs) != 5 {
		t.Fatalf("expected 5 events, got %d", len(evs))
	}

	// Verify Execve
	if evs[0].Type != events.EventProcessStart || evs[0].Path != "/usr/bin/node" || len(evs[0].Arguments) != 2 || evs[0].Arguments[1] != "build.js" {
		t.Errorf("execve event mismatch: %+v", evs[0])
	}

	// Verify Openat
	if evs[1].Type != events.EventFileRead || evs[1].Path != "/workspace/package.json" || evs[1].Operation != "openat" {
		t.Errorf("openat event mismatch: %+v", evs[1])
	}

	// Verify Open
	if evs[2].Type != events.EventFileRead || evs[2].Path != "/workspace/package-lock.json" || evs[2].Operation != "open" {
		t.Errorf("open event mismatch: %+v", evs[2])
	}

	// Verify IPv4 connect
	if evs[3].Type != events.EventNetworkOpen || evs[3].Endpoint != "104.16.24.34:443" {
		t.Errorf("ipv4 connect event mismatch: %+v", evs[3])
	}

	// Verify IPv6 connect
	if evs[4].Type != events.EventNetworkOpen || evs[4].Endpoint != "2606:4700::6810:1822:80" {
		t.Errorf("ipv6 connect event mismatch: %+v", evs[4])
	}
}
