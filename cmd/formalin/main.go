package main

import (
	"flag"
	"fmt"
	"io"
	"math/rand"
	"os"
	"path/filepath"
	"strings"
	"time"

	"formalin/internal/adapters/npm"
	"formalin/internal/analyzer"
	"formalin/internal/report"
	"formalin/internal/sandbox"
	"formalin/internal/tracer"
)

func main() {
	// Custom flag parsing for subcommand
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	subcmd := os.Args[1]
	if subcmd != "record" {
		fmt.Printf("Error: unknown command '%s'\n\n", subcmd)
		printUsage()
		os.Exit(1)
	}

	recordFlags := flag.NewFlagSet("record", flag.ExitOnError)
	outputDirFlag := recordFlags.String("output-dir", ".", "Directory to write results to")
	verboseFlag := recordFlags.Bool("verbose", false, "Enable verbose debug logs")

	// Parse flags following 'record'
	// We need to parse everything until '--'
	doubleDashIndex := -1
	for i, arg := range os.Args {
		if arg == "--" {
			doubleDashIndex = i
			break
		}
	}

	var err error
	if doubleDashIndex != -1 {
		err = recordFlags.Parse(os.Args[2:doubleDashIndex])
	} else {
		err = recordFlags.Parse(os.Args[2:])
	}
	if err != nil {
		fmt.Printf("Error parsing flags: %v\n", err)
		os.Exit(1)
	}

	var buildCmd []string
	if doubleDashIndex != -1 && doubleDashIndex+1 < len(os.Args) {
		buildCmd = os.Args[doubleDashIndex+1:]
	}

	if len(buildCmd) == 0 {
		fmt.Println("Error: no build command specified. Use '-- <build-command>' to specify one.")
		os.Exit(1)
	}

	// 1. Resolve workspace path (current working directory)
	workspaceDir, err := os.Getwd()
	if err != nil {
		fmt.Printf("Error resolving current directory: %v\n", err)
		os.Exit(1)
	}

	if *verboseFlag {
		fmt.Printf("Auditing workspace: %s\n", workspaceDir)
		fmt.Printf("Target build command: %s\n", strings.Join(buildCmd, " "))
	}

	// 2. Setup temporary observation sandbox workspace
	rand.Seed(time.Now().UnixNano())
	randStr := fmt.Sprintf("%06d", rand.Intn(1000000))
	tmpRoot := filepath.Join("/tmp", fmt.Sprintf("formalin-%s", randStr))
	snapshotDir := filepath.Join(tmpRoot, "build")
	logDir := filepath.Join(tmpRoot, "logs")

	if err := os.MkdirAll(snapshotDir, 0755); err != nil {
		fmt.Printf("Error creating snapshot directory: %v\n", err)
		os.Exit(1)
	}
	if err := os.MkdirAll(logDir, 0755); err != nil {
		fmt.Printf("Error creating logs directory: %v\n", err)
		os.Exit(1)
	}

	// Clean up temporary workspace at end
	defer os.RemoveAll(tmpRoot)

	fmt.Println("Creating sandbox environment...")
	if err := copyDir(workspaceDir, snapshotDir); err != nil {
		fmt.Printf("Error snapshotting source repository: %v\n", err)
		os.Exit(1)
	}

	// 3. Initialize Sandbox & Tracer
	sb, err := sandbox.NewSandbox(snapshotDir)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	tr, err := tracer.NewTracer(logDir)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	// Construct the bubblewrap command wrapped by strace
	bwrapArgs := sb.BuildArgs(buildCmd)
	bwrapCmd := sb.BwrapPath

	fmt.Println("Executing build command under sandbox recording...")
	rawEvents, err := tr.Run(bwrapCmd, bwrapArgs)
	if err != nil {
		fmt.Printf("Tracer execution error: %v\n", err)
		os.Exit(1)
	}

	// 4. Load package locks / adapter metadata
	fmt.Println("Correlating build events with project manifests...")
	materials, err := npm.LoadMaterials(workspaceDir)
	if err != nil {
		fmt.Printf("Warning: failed to read npm package-lock.json: %v\n", err)
	}

	// 5. Analyze results
	az := analyzer.NewAnalyzer(workspaceDir, snapshotDir, buildCmd)
	obs, err := az.Analyze(rawEvents, materials)
	if err != nil {
		fmt.Printf("Error running analysis rules engine: %v\n", err)
		os.Exit(1)
	}

	// 6. Generate reports
	absOutputDir, err := filepath.Abs(*outputDirFlag)
	if err != nil {
		absOutputDir = *outputDirFlag
	}

	jsonPath := filepath.Join(absOutputDir, "formalin.build.json")
	mdPath := filepath.Join(absOutputDir, "formalin-report.md")

	fmt.Printf("Writing reports to %s...\n", absOutputDir)
	if err := report.WriteJSON(obs, jsonPath); err != nil {
		fmt.Printf("Error writing JSON build database: %v\n", err)
		os.Exit(1)
	}

	if err := report.WriteMarkdown(obs, mdPath); err != nil {
		fmt.Printf("Error writing Markdown report: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Audit complete! Verification reports generated:")
	fmt.Printf("  - Database: %s\n", jsonPath)
	fmt.Printf("  - Risk Report: %s\n", mdPath)
}

func printUsage() {
	fmt.Println("Formalin - A temporal rebuildability auditor for software projects")
	fmt.Println("Usage:")
	fmt.Println("  formalin record [options] -- <build-command> [args...]")
	fmt.Println()
	fmt.Println("Options:")
	fmt.Println("  --output-dir <path>   Directory where audit results are written (default: \".\")")
	fmt.Println("  --verbose             Enable verbose logging output")
}

func copyDir(src, dst string) error {
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		rel, err := filepath.Rel(src, path)
		if err != nil {
			return err
		}

		// Do not copy git database and workflow metadata
		if rel == ".git" || strings.HasPrefix(rel, ".git/") || rel == "workflow-gate.json" {
			if info.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}

		targetPath := filepath.Join(dst, rel)
		if info.IsDir() {
			return os.MkdirAll(targetPath, info.Mode())
		}

		srcFile, err := os.Open(path)
		if err != nil {
			return err
		}
		defer srcFile.Close()

		dstFile, err := os.OpenFile(targetPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, info.Mode())
		if err != nil {
			return err
		}
		defer dstFile.Close()

		_, err = io.Copy(dstFile, srcFile)
		return err
	})
}
