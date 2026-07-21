package npm

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadMaterials(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "npm-test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	lockfileContent := `{
  "name": "test-project",
  "lockfileVersion": 3,
  "packages": {
    "node_modules/lodash": {
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "integrity": "sha512-v2kDEeSG9QD4s"
    }
  }
}`
	lockfilePath := filepath.Join(tmpDir, "package-lock.json")
	if err := os.WriteFile(lockfilePath, []byte(lockfileContent), 0644); err != nil {
		t.Fatalf("failed to write package-lock.json: %v", err)
	}

	materials, err := LoadMaterials(tmpDir)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(materials) != 1 {
		t.Fatalf("expected 1 material, got %d", len(materials))
	}

	if materials[0].URI != "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz" || materials[0].SHA512 != "sha512-v2kDEeSG9QD4s" {
		t.Errorf("material mismatch: %+v", materials[0])
	}
}
