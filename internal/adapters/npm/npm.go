package npm

import (
	"encoding/json"
	"os"
	"path/filepath"

	"formalin/internal/events"
)

type PackageLock struct {
	LockfileVersion int                    `json:"lockfileVersion"`
	Packages        map[string]LockPackage `json:"packages"`
	Dependencies    map[string]LockDep     `json:"dependencies"`
}

type LockPackage struct {
	Resolved  string `json:"resolved"`
	Integrity string `json:"integrity"`
}

type LockDep struct {
	Resolved     string             `json:"resolved"`
	Integrity    string             `json:"integrity"`
	Dependencies map[string]LockDep `json:"dependencies"`
}

// LoadMaterials parses package-lock.json in the given workspace directory
// and returns all resolved NPM package materials and their integrity metadata.
func LoadMaterials(workspaceDir string) ([]events.MaterialInfo, error) {
	lockfile := filepath.Join(workspaceDir, "package-lock.json")
	if _, err := os.Stat(lockfile); os.IsNotExist(err) {
		return nil, nil // If package-lock.json does not exist, return gracefully with no materials
	}

	data, err := os.ReadFile(lockfile)
	if err != nil {
		return nil, err
	}

	var pl PackageLock
	if err := json.Unmarshal(data, &pl); err != nil {
		return nil, err
	}

	var materials []events.MaterialInfo

	// Process packages (used in lockfile v2 & v3)
	for _, pkg := range pl.Packages {
		if pkg.Resolved != "" {
			materials = append(materials, events.MaterialInfo{
				URI:          pkg.Resolved,
				SHA512:       pkg.Integrity, // Keeps the integrity value (e.g. "sha512-...")
				Verification: "npm-integrity",
			})
		}
	}

	// Process dependencies (used in lockfile v1 / fallback)
	var walkDeps func(map[string]LockDep)
	walkDeps = func(deps map[string]LockDep) {
		for _, dep := range deps {
			if dep.Resolved != "" {
				materials = append(materials, events.MaterialInfo{
					URI:          dep.Resolved,
					SHA512:       dep.Integrity,
					Verification: "npm-integrity",
				})
			}
			if len(dep.Dependencies) > 0 {
				walkDeps(dep.Dependencies)
			}
		}
	}
	walkDeps(pl.Dependencies)

	return deduplicate(materials), nil
}

func deduplicate(materials []events.MaterialInfo) []events.MaterialInfo {
	seen := make(map[string]bool)
	var result []events.MaterialInfo
	for _, m := range materials {
		if !seen[m.URI] {
			seen[m.URI] = true
			result = append(result, m)
		}
	}
	return result
}
