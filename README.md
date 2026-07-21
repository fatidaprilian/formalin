# Formalin

Formalin is a visual perception runtime for AI coding agents. It connects directly to your web application via Chrome DevTools Protocol (CDP), extracts rendered scene graphs, performs responsive viewport continuum sweeps, evaluates design intent consistency, and maps visual layout issues directly back to source code locations (`Component.tsx:line`).

## How it Works

1. **Browser Telemetry:** Formalin opens your web application in headless Chrome via CDP and extracts the DOM tree, computed CSS styles, font metrics, and bounding boxes.
2. **Render Scene Graph:** It constructs a visual hierarchy tree, calculating visual weight, typography roles, and spacing intervals.
3. **Responsive Inspection:** It evaluates the UI across multiple viewport breakpoints (375px, 768px, 1024px, 1440px) to detect content overflow and layout breaks.
4. **Source Attribution:** It maps visual findings back to source code lines in your workspace.
5. **Agent Critique:** It outputs a lightweight `.formalin/critique.json` file for AI coding agents (Claude Code, Cursor, Codex, Gemini CLI) and `formalin-summary.md` for human review.

## Installation

Run directly using npx:
```bash
npx formalin inspect http://localhost:3000
```

Or install globally:
```bash
npm install -g formalin
```

## Usage

Inspect a running development server:
```bash
formalin inspect http://localhost:3000
```

### Options
- `--output-dir <path>`: Directory to write critique reports to (default: `.formalin`).
- `--viewports <list>`: Comma-separated list of viewports (default: `375,768,1024,1440`).
- `--remote-debugging-port <port>`: Connect to an existing Chrome remote debugging port.
- `--verbose`: Enable detailed log output.

## Outputs

Formalin generates two report files in `.formalin/`:
1. `.formalin/critique.json`: Machine-readable visual audit database for AI agents.
2. `.formalin/formalin-summary.md`: Human-readable Markdown summary.
