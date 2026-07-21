package analyzer

import (
	"os"
	"path/filepath"
	"testing"

	"formalin/internal/events"
)

func TestAnalyzer(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "analyzer-test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	workspaceDir := filepath.Join(tmpDir, "workspace")
	snapshotDir := filepath.Join(tmpDir, "snapshot")
	os.MkdirAll(workspaceDir, 0755)
	os.MkdirAll(snapshotDir, 0755)

	// Create a dummy output file in snapshot dir to test output file detection
	dummyOutputFile := filepath.Join(snapshotDir, "dist-app.js")
	if err := os.WriteFile(dummyOutputFile, []byte("built code"), 0644); err != nil {
		t.Fatalf("failed to write dummy output file: %v", err)
	}

	// Simulated raw events
	rawEvents := []events.Event{
		{
			ProcessID: 101,
			ParentPID: 100,
			Type:      events.EventProcessStart,
			Operation: "execve",
			Path:      "/usr/bin/curl",
			Arguments: []string{"curl", "-L", "http://example.com/latest.tar.gz"},
		},
		{
			ProcessID: 102,
			ParentPID: 100,
			Type:      events.EventProcessStart,
			Operation: "execve",
			Path:      "/usr/bin/git",
			Arguments: []string{"git", "clone", "-b", "main", "https://github.com/org/repo.git"},
		},
		{
			ProcessID: 103,
			Type:      events.EventFileRead,
			Operation: "openat",
			Path:      "/workspace/package.json",
		},
		{
			ProcessID: 103,
			Type:      events.EventFileRead,
			Operation: "openat",
			Path:      "/usr/include/stdio.h",
		},
		{
			ProcessID: 103,
			Type:      events.EventFileRead,
			Operation: "openat",
			Path:      "/home/user/.config/some-tool.conf",
		},
		{
			ProcessID: 101,
			Type:      events.EventNetworkOpen,
			Operation: "connect",
			Endpoint:  "93.184.216.34:80",
		},
	}

	materials := []events.MaterialInfo{
		{
			URI:          "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
			SHA512:       "sha512-v2kDEeSG9QD4s",
			Verification: "npm-integrity",
		},
	}

	analyzer := NewAnalyzer(workspaceDir, snapshotDir, []string{"npm", "run", "build"})
	obs, err := analyzer.Analyze(rawEvents, materials)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Verify Outputs
	if len(obs.Outputs) != 1 || obs.Outputs[0].Path != "/workspace/dist-app.js" {
		t.Errorf("output file detection failed: %+v", obs.Outputs)
	}

	// Verify Findings
	findings := make(map[string]bool)
	for _, f := range obs.Findings {
		findings[f.Rule] = true
	}

	expectedRules := []string{"DG001", "DG002", "DG003", "DG005"}
	for _, rule := range expectedRules {
		if !findings[rule] {
			t.Errorf("expected finding rule %s, but not found. Total findings: %+v", rule, obs.Findings)
		}
	}
}
