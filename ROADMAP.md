# Formalin Roadmap

This document defines the development roadmap for Formalin. Use the checkboxes to track progress.

## Roadmap Overview

- [x] Phase: Working Syscall Tracer
- [x] Phase: Canonical Build Observation
- [x] Phase: Sandbox and Ecosystem Adapter
- [x] Phase: Rebuildability Risk Engine
- [x] Phase: Verification and CI Integration
- [ ] Phase: Adapter SDK and Cargo Ecosystem
- [ ] Phase: Supply-Chain Integration
- [ ] Phase: Performance and Portability
- [ ] Phase: Public Beta Hardening
- [ ] Phase: Stable Release v1.0

---

## Phase: Working Syscall Tracer (Completed)

Goal: Execute build command, trace system calls, and record files, processes, and network requests accessed.

- [x] Execute arbitrary command under strace
- [x] Follow child processes with multi-process output flag (-ff)
- [x] Intercept process starts (execve), file reads (open/openat), and network connections (connect)
- [x] Parse trace logs into intermediate events

---

## Phase: Canonical Build Observation (Completed)

Goal: Convert raw system calls into a structured database of input and output files.

- [x] Standardize event structures
- [x] Implement file classification (source, host-toolchain, temporary, output)
- [x] Implement content hashing for read input files
- [x] Detect generated output files using a post-build filesystem difference
- [x] Write canonical JSON representation

---

## Phase: Sandbox and Ecosystem Adapter (Completed)

Goal: Isolate build execution to prevent contamination and correlate requests with lockfiles.

- [x] Implement isolated execution container using Bubblewrap (bwrap)
- [x] Clean environment variables and mask host Home directory ($HOME)
- [x] Parse package-lock.json (supporting v1, v2, v3)
- [x] Correlate network socket destinations with lockfile resolved registries

---

## Phase: Rebuildability Risk Engine (Completed)

Goal: Evaluate observed files and connections against risk rules.

- [x] Build rules analysis engine
- [x] Detect DG001: Mutable remote URL
- [x] Detect DG002: Floating Git reference
- [x] Detect DG003: Unresolved network dependency
- [x] Detect DG004: Ambient host toolchain dependency
- [x] Detect DG005: Input outside project
- [x] Detect DG007: Missing integrity metadata
- [x] Generate human-readable Markdown summary report

---

## Phase: Verification and CI Integration (Completed)

Goal: Compare current builds against baselines and provide CI integration tooling.

- [x] Implement baseline recording subcommand
- [x] Implement verify command to compare current build with baseline database
- [x] Detect drift: changed compiler version, modified file checksums, new network requests
- [x] Support offline verification (blocking network namespace in sandbox)
- [ ] Provide pre-built GitHub Action and GitLab CI integration configuration examples

---

## Phase: Adapter SDK and Cargo Ecosystem

Goal: Add support for rust/Cargo ecosystem.

- [ ] Abstract EcosystemAdapter interface in adapters module
- [ ] Parse Cargo.toml, Cargo.lock, and cargo configs
- [ ] Trace build.rs executions and pin crates registry network dependencies

---

## Phase: Supply-Chain Integration

Goal: Export and import standard supply chain and software bills of materials (SBOM) formats.

- [ ] Support exporting observation databases to in-toto statements
- [ ] Support exporting results to SARIF format for static analysis tools
- [ ] Support importing Docker BuildKit provenance metadata

---

## Phase: Performance and Portability

Goal: Optimize performance and memory limits on large monorepos.

- [ ] Support parallel builds and large volumes of events
- [ ] Evaluate alternative low-overhead tracing collectors (e.g. eBPF or fanotify)

---

## Phase: Public Beta Hardening

Goal: Prepare the codebase for public usage and integration.

- [ ] Finalize and freeze JSON schemas and CLI interfaces
- [ ] Validate secret redaction rules to prevent credentials leakage
- [ ] Complete user guides, deployment reference, and system support guides
- [ ] Provide official packages (e.g. Homebrew, deb/rpm packages)

---

## Phase: Stable Release v1.0

Goal: Launch production release with defined support matrices and regression protection.

- [ ] Final stable SemVer release
- [ ] Automated binary builds with cryptographic signatures
