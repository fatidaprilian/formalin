package verifier

import (
	"testing"

	"formalin/internal/events"
)

func TestVerifyNoDrift(t *testing.T) {
	baseline := &events.BuildObservation{
		Platform: events.PlatformInfo{OS: "linux", Architecture: "amd64"},
		Inputs:   []events.FileAccess{{Path: "/workspace/a.json", SHA256: "hash1"}},
		Network:  []events.NetworkAccess{{Host: "example.com", Port: 80}},
	}
	current := &events.BuildObservation{
		Platform: events.PlatformInfo{OS: "linux", Architecture: "amd64"},
		Inputs:   []events.FileAccess{{Path: "/workspace/a.json", SHA256: "hash1"}},
		Network:  []events.NetworkAccess{{Host: "example.com", Port: 80}},
	}

	report := Verify(baseline, current)
	if report.HasDrift() {
		t.Errorf("expected no drift, got: %+v", report)
	}
}

func TestVerifyWithDrift(t *testing.T) {
	baseline := &events.BuildObservation{
		Platform: events.PlatformInfo{OS: "linux", Architecture: "amd64"},
		Inputs:   []events.FileAccess{{Path: "/workspace/a.json", SHA256: "hash1"}},
		Network:  []events.NetworkAccess{{Host: "example.com", Port: 80}},
	}
	current := &events.BuildObservation{
		Platform: events.PlatformInfo{OS: "linux", Architecture: "amd64"},
		Inputs:   []events.FileAccess{{Path: "/workspace/a.json", SHA256: "hash2"}}, // changed hash
		Network:  []events.NetworkAccess{{Host: "example.com", Port: 80}, {Host: "malicious.com", Port: 443}}, // new network host
	}

	report := Verify(baseline, current)
	if !report.HasDrift() {
		t.Errorf("expected drift to be detected")
	}

	if len(report.ChangedInputs) != 1 {
		t.Errorf("expected 1 changed input, got %d", len(report.ChangedInputs))
	}

	if len(report.NewNetworkHosts) != 1 {
		t.Errorf("expected 1 new network connection target, got %d", len(report.NewNetworkHosts))
	}
}
