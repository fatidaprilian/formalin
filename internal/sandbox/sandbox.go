package sandbox

import (
	"fmt"
	"os/exec"
)

type Sandbox struct {
	BwrapPath      string
	SnapshotDir    string
	DisableNetwork bool
}

// NewSandbox initializes the sandbox check and stores the snapshot directory.
func NewSandbox(snapshotDir string) (*Sandbox, error) {
	bwrapPath, err := exec.LookPath("bwrap")
	if err != nil {
		return nil, fmt.Errorf("bubblewrap (bwrap) is required but not installed. Please install 'bubblewrap' using your package manager: %w", err)
	}
	return &Sandbox{
		BwrapPath:      bwrapPath,
		SnapshotDir:    snapshotDir,
		DisableNetwork: false,
	}, nil
}

// BuildArgs constructs the full arguments for the bubblewrap command.
func (s *Sandbox) BuildArgs(cmd []string) []string {
	args := []string{
		"--unshare-all",
	}
	if !s.DisableNetwork {
		args = append(args, "--share-net")
	}
	args = append(args,
		"--dir", "/tmp",
		"--proc", "/proc",
		"--dev", "/dev",
		"--bind", s.SnapshotDir, "/workspace",
		"--dir", "/home/build",
		"--setenv", "HOME", "/home/build",
		"--setenv", "PATH", "/usr/bin:/bin:/usr/local/bin",
		"--chdir", "/workspace",
		"--",
	)
	return append(args, cmd...)
}
