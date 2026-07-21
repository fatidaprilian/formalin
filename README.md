# Formalin

> **The Frontend Perception & Design Runtime for AI Coding Agents.**
> Stop generating UI blindly. Give your coding agents the eyes and design runtime they are missing.

---

## What is Formalin?

Most AI coding agents (Claude Code, Cursor, Codex, Gemini CLI) generate frontend code by predicting tokens in the dark. Vision LLMs can look at static screenshots, but they cannot tell **why** a layout broke, **which** CSS rule caused it, **how** the design behaves across continuous responsive breakpoints, or **which** line of code in `Hero.tsx` created the visual flaw.

**Formalin** connects directly to the browser via Chrome DevTools Protocol (CDP) to construct a **Render Scene Graph**. It bridges rendered browser telemetry, responsive viewport sweeps, design intent contracts, and pixel-to-source code attribution into a clean local runtime for AI agents.

---

## Core Capabilities

- **Render Scene Graph:** Extracts bounding boxes, visual weights, typography metrics, and computed styles into a structural visual hierarchy tree.
- **Responsive Continuum Sweep:** Inspects UI behavior across viewport breakpoints (375px, 768px, 1024px, 1440px) to detect content overflow, broken headings, and displaced call-to-action buttons.
- **Pixel-to-Source Attribution:** Maps visual layout flaws directly back to component source code files and line numbers (`Component.tsx:line`).
- **Design Intent Verification:** Evaluates rendered interfaces against structured design briefs (`intent.yaml`) to detect generic AI pattern convergence, typography collisions, and button variant proliferation.
- **Agent Agnostic:** Outputs lightweight `.formalin/critique.json` reports that any LLM or coding agent can read via terminal without requiring complex custom MCP servers.

---

## Quick Start

Inspect a local development server using npx:

```bash
npx formalin inspect http://localhost:3000
```

Or install globally:

```bash
npm install -g formalin
```

### CLI Options

```bash
formalin inspect <url> [options]
```

- `<url>`: Target web application URL (e.g. `http://localhost:3000`).
- `--output-dir <path>`: Directory to write audit reports to (default: `.formalin`).
- `--viewports <list>`: Comma-separated list of viewports (default: `375,768,1024,1440`).
- `--remote-debugging-port <port>`: Connect to an existing Chrome remote debugging port.
- `--verbose`: Enable detailed log output.

---

## Output Architecture

Formalin generates two artifacts in the `.formalin/` directory:

1. **`.formalin/critique.json`**: Machine-readable database for AI coding agents containing scores, findings, selectors, source locations, and suggested fixes.
2. **`.formalin/formalin-summary.md`**: Human-readable Markdown summary.

### Critique JSON Example

```json
{
  "schemaVersion": "1",
  "targetUrl": "http://localhost:3000",
  "timestamp": "2026-07-21T23:04:00.000Z",
  "metrics": {
    "visualHierarchyScore": 85,
    "spacingRhythmScore": 90,
    "responsiveHealthScore": 78,
    "designConsistencyScore": 92
  },
  "findings": [
    {
      "code": "RESP_OVERFLOW",
      "severity": "HIGH",
      "category": "Responsive",
      "message": "Hero heading extends beyond the horizontal viewport boundary at 375px.",
      "selector": "section.hero > h1",
      "sourceLocation": {
        "file": "src/components/Hero.tsx",
        "line": 42
      },
      "viewport": "375x812",
      "suggestedFix": "Apply max-width: 100% or overflow-wrap: break-word."
    }
  ]
}
```

---

## License

MIT
