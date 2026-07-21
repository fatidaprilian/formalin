package report

import (
	"os"
	"path/filepath"
	"testing"

	"formalin/internal/events"
)

func TestReportGeneration(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "report-test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	obs := &events.BuildObservation{
		SchemaVersion: "1",
		Command:       []string{"npm", "run", "build"},
		Platform: events.PlatformInfo{
			OS:           "linux",
			Architecture: "amd64",
			Kernel:       "6.x",
		},
		Inputs: []events.FileAccess{
			{Path: "/workspace/package.json", SHA256: "abc", Origin: "source"},
		},
		Network: []events.NetworkAccess{
			{Process: "node", Host: "example.com", Port: 80, ResolvedMaterial: false},
		},
		Findings: []events.Finding{
			{Rule: "DG003", Severity: "high", Message: "Unresolved network connection"},
		},
	}

	jsonPath := filepath.Join(tmpDir, "formalin.build.json")
	mdPath := filepath.Join(tmpDir, "formalin-report.md")

	if err := WriteJSON(obs, jsonPath); err != nil {
		t.Fatalf("failed to write JSON: %v", err)
	}

	if err := WriteMarkdown(obs, mdPath); err != nil {
		t.Fatalf("failed to write MD: %v", err)
	}

	if _, err := os.Stat(jsonPath); os.IsNotExist(err) {
		t.Errorf("formalin.build.json was not created")
	}

	if _, err := os.Stat(mdPath); os.IsNotExist(err) {
		t.Errorf("formalin-report.md was not created")
	}
}
