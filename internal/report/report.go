package report

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"formalin/internal/events"
)

// WriteJSON writes the build observation data structures as formatted JSON.
func WriteJSON(obs *events.BuildObservation, outputPath string) error {
	data, err := json.MarshalIndent(obs, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(outputPath, data, 0644)
}

// WriteMarkdown compiles and writes a human-readable temporal audit report.
func WriteMarkdown(obs *events.BuildObservation, outputPath string) error {
	var buf bytes.Buffer

	buf.WriteString("# Formalin Build Audit Report\n\n")

	buf.WriteString("## Executive Summary\n")
	if len(obs.Findings) == 0 {
		buf.WriteString("**Secure & Deterministic!** No rebuildability risks were detected during the build audit.\n\n")
	} else {
		criticalCount := 0
		highCount := 0
		mediumCount := 0
		for _, f := range obs.Findings {
			switch strings.ToLower(f.Severity) {
			case "critical":
				criticalCount++
			case "high":
				highCount++
			case "medium":
				mediumCount++
			}
		}
		buf.WriteString(fmt.Sprintf("**Rebuildability Risks Detected!** The build completed, but the following temporal risks were found:\n"))
		buf.WriteString(fmt.Sprintf("- **Critical**: %d\n", criticalCount))
		buf.WriteString(fmt.Sprintf("- **High**: %d\n", highCount))
		buf.WriteString(fmt.Sprintf("- **Medium**: %d\n\n", mediumCount))
	}

	buf.WriteString("### Build Command\n")
	buf.WriteString(fmt.Sprintf("`%s`\n\n", strings.Join(obs.Command, " ")))

	buf.WriteString("## Findings\n\n")
	if len(obs.Findings) == 0 {
		buf.WriteString("No findings reported.\n\n")
	} else {
		for _, f := range obs.Findings {
			badge := ""
			switch strings.ToLower(f.Severity) {
			case "critical":
				badge = "**CRITICAL**"
			case "high":
				badge = "**HIGH**"
			case "medium":
				badge = "**MEDIUM**"
			default:
				badge = "**INFO**"
			}
			buf.WriteString(fmt.Sprintf("### %s: %s\n", badge, f.Rule))
			buf.WriteString(fmt.Sprintf("%s\n\n", f.Message))
		}
	}

	buf.WriteString("## Observed Build Environment\n\n")
	buf.WriteString("| Metric | Count |\n")
	buf.WriteString("| :--- | :--- |\n")
	buf.WriteString(fmt.Sprintf("| Total Input Files Accessed | %d |\n", len(obs.Inputs)))
	buf.WriteString(fmt.Sprintf("| Total Output Files Generated | %d |\n", len(obs.Outputs)))
	buf.WriteString(fmt.Sprintf("| Total Network Connections | %d |\n", len(obs.Network)))
	buf.WriteString(fmt.Sprintf("| Processes Spawned | %d |\n\n", len(obs.Processes)))

	if len(obs.Network) > 0 {
		buf.WriteString("### Network Connection Targets\n")
		buf.WriteString("| Host | Port | Process | Correlated Lockfile |\n")
		buf.WriteString("| :--- | :--- | :--- | :--- |\n")
		for _, netCall := range obs.Network {
			corr := "No"
			if netCall.ResolvedMaterial {
				corr = "Yes (npm-integrity)"
			}
			buf.WriteString(fmt.Sprintf("| %s | %d | `%s` | %s |\n", netCall.Host, netCall.Port, netCall.Process, corr))
		}
		buf.WriteString("\n")
	}

	return os.WriteFile(outputPath, buf.Bytes(), 0644)
}
