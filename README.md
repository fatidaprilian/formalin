# Formalin

Formalin is a temporal rebuildability auditor for software projects. It executes an arbitrary build command inside an isolated bubblewrap sandbox, records all real input files, network connections, and system toolchains accessed during the build using strace, and generates a detailed rebuildability risk report.

## How it Works

1. **Isolation:** Formalin snapshots your source repository to a temporary workspace and runs the build command inside a Bubblewrap container. This isolates the build from ambient host configurations (such as user-level SSH/AWS credentials or system configs) that could cause "works on my machine" issues.
2. **System Call Tracing:** During execution, it runs the sandbox under `strace`, capturing file accesses (`open`, `openat`), process spawns (`execve`), and network attempts (`connect`).
3. **Ecosystem Correlation:** It correlates network destinations with your project's lockfiles (e.g. `package-lock.json` for npm) to determine if a dependency is resolved and verified by content integrity hashes.
4. **Temporal Risk Analysis:** It evaluates rules (DG001 - DG008) to detect mutable resources, floating git references, and host toolchain drift that could break builds in the future.

## Risk Rules

- **DG001 (Mutable Remote URL):** Using commands like curl or wget to fetch files from mutable URLs (e.g. containing latest, master, or missing version tags).
- **DG002 (Floating Git Reference):** Checking out branches or tags instead of pinning specific 40-character commit hashes.
- **DG003 (Unresolved Network Dependency):** Connections made during the build that cannot be correlated to a verified package integrity hash.
- **DG004 (Ambient Host Toolchain):** Reading compilers or headers directly from the host system (e.g., /usr/bin/gcc).
- **DG005 (Input Outside Project):** File accesses pointing outside of the workspace directory.
- **DG007 (Missing Integrity Metadata):** Dependencies resolved without content integrity metadata.

## Prerequisites

Formalin requires the following tools to be installed on the host system:
- **Go** (version 1.18 or later)
- **bubblewrap** (bwrap)
- **strace**

On Debian/Ubuntu systems, install dependencies using:
```bash
sudo apt-get update && sudo apt-get install -y bubblewrap strace
```

## Installation

Clone the repository and build the binary:
```bash
go build ./cmd/formalin
```

## Usage

Audit your build command:
```bash
./formalin record -- <build-command>
```

Example:
```bash
./formalin record -- npm run build
```

This will generate two report files in your output directory:
1. `formalin.build.json` - Complete machine-readable observation database.
2. `formalin-report.md` - Human-readable Markdown summary of findings.
