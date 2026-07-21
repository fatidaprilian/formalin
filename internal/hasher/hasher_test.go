package hasher

import (
	"os"
	"path/filepath"
	"testing"
)

func TestFileSHA256(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "hasher-test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	filePath := filepath.Join(tmpDir, "test.txt")
	content := "hello world"
	if err := os.WriteFile(filePath, []byte(content), 0644); err != nil {
		t.Fatalf("failed to write test file: %v", err)
	}

	hash, err := FileSHA256(filePath)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// SHA-256 for "hello world"
	expected := "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
	if hash != expected {
		t.Errorf("expected hash %q, got %q", expected, hash)
	}

	// Test non-regular file (directory should return empty string, no error)
	dirHash, err := FileSHA256(tmpDir)
	if err != nil {
		t.Fatalf("unexpected error for directory: %v", err)
	}
	if dirHash != "" {
		t.Errorf("expected empty hash for directory, got %q", dirHash)
	}
}
