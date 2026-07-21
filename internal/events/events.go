package events

import (
	"time"
)

type EventType string

const (
	EventProcessStart EventType = "process.start"
	EventProcessExit  EventType = "process.exit"
	EventFileRead     EventType = "file.read"
	EventFileWrite    EventType = "file.write"
	EventNetworkOpen  EventType = "network.connect"
)

// Event represents a normalized trace event.
type Event struct {
	Timestamp  time.Time `json:"timestamp"`
	ProcessID  int       `json:"pid"`
	ParentPID  int       `json:"ppid,omitempty"`
	Type       EventType `json:"type"`
	Operation  string    `json:"operation"`
	Path       string    `json:"path,omitempty"`
	Endpoint   string    `json:"endpoint,omitempty"` // host:port for network events
	Arguments  []string  `json:"arguments,omitempty"`
	Result     string    `json:"result"`
}

// ProcessInfo represents a tracked process in the build run.
type ProcessInfo struct {
	PID        int      `json:"pid"`
	PPID       int      `json:"ppid"`
	Executable string   `json:"executable"`
	Arguments  []string `json:"arguments"`
	SHA256     string   `json:"sha256,omitempty"`
	Origin     string   `json:"origin"` // "host" or "workspace"
}

// FileAccess represents file read/write access.
type FileAccess struct {
	Path   string `json:"path"`
	SHA256 string `json:"sha256,omitempty"`
	Origin string `json:"origin"` // "source", "host-toolchain", "cache", "temporary", "external-user"
}

// NetworkAccess represents a network connection attempt.
type NetworkAccess struct {
	Process          string `json:"process"`
	Host             string `json:"host"`
	Port             int    `json:"port"`
	ResolvedMaterial bool   `json:"resolved_material"`
}

// Finding represents a risk identified during the build.
type Finding struct {
	Rule     string `json:"rule"`
	Severity string `json:"severity"` // "critical", "high", "medium", "low"
	Message  string `json:"message"`
}

// BuildObservation holds the accumulated results of the tracing run.
type BuildObservation struct {
	SchemaVersion   string          `json:"schema_version"`
	Command         []string        `json:"command"`
	Platform        PlatformInfo    `json:"platform"`
	Processes       []ProcessInfo   `json:"processes"`
	Inputs          []FileAccess    `json:"inputs"`
	Outputs         []FileAccess    `json:"outputs"`
	RemoteMaterials []MaterialInfo  `json:"remote_materials,omitempty"`
	Network         []NetworkAccess `json:"network"`
	Findings        []Finding       `json:"findings"`
}

type PlatformInfo struct {
	OS           string `json:"os"`
	Architecture string `json:"architecture"`
	Kernel       string `json:"kernel"`
}

type MaterialInfo struct {
	URI          string `json:"uri"`
	SHA512       string `json:"sha512,omitempty"`
	Verification string `json:"verification"` // e.g. "npm-integrity"
}
