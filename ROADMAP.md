# Formalin v1.0 Roadmap and Phase Specifications

Formalin is a perception and design runtime for AI coding agents. It turns passive code generators into autonomous frontend designers that can render, observe, critique, and refine web interfaces based on structural truth, design intent, and visual telemetry.

---

## Product Promise v1.0

> Given a design brief without Figma files or target screenshots, Formalin enables AI coding agents to inspect rendered web interfaces, identify visual hierarchy and responsive flaws, trace causes directly to source code, and iterate until the UI communicates a distinct, high-quality visual concept.

---

## Phase Breakdown to v1.0

### Phase 1: Browser Telemetry & Render Scene Graph (Completed)
- [x] Connect directly to browser via Chrome DevTools Protocol (CDP) using `puppeteer-core`.
- [x] Extract visible element bounding boxes, visual weights, computed styles, and font metrics.
- [x] Build unified Render Scene Graph hierarchy.

### Phase 2: Responsive Continuum Sweep (Completed in v0.1)
- [x] Multi-viewport inspection across 375px, 768px, 1024px, and 1440px breakpoints.
- [x] Detect horizontal content overflow (`RESP_OVERFLOW`).
- [x] Detect primary call-to-action buttons pushed below the mobile viewport fold (`RESP_PUSHED_CTA`).

### Phase 3: Pixel-to-Source Attribution (Completed in v0.1)
- [x] Map rendered DOM elements with visual discrepancies back to component source code files and line numbers (`Component.tsx:line`).
- [x] Fallback selector resolution matching CSS classes to workspace source files.

### Phase 4: Structured Design Intent & Consistency (Current Focus)
- [ ] Parse `intent.yaml` design briefs into verifiable composition contracts (personality, density, hierarchy, color accent usage).
- [ ] Detect design grammar divergences (e.g. uncoordinated button variants, heading hierarchy collisions).
- [ ] Calculate health scores for Visual Hierarchy, Spacing Rhythm, Responsive Health, and Design Consistency.

### Phase 5: Content Robustness & Stress Engine (v1.0 Goal)
- [ ] Automated stress testing with long text (40%-80% longer titles), missing images, empty states, 200% zoom, and font fallbacks.
- [ ] Flag layout shifts and element clipping under real-world data anomalies.

### Phase 6: Multi-Turn Agent Perception Loop (v1.0 Release Candidate)
- [ ] Export structured `.formalin/critique.json` and human-readable Markdown summaries.
- [ ] Enable multi-turn refinement loops: `inspect -> critique -> AI patch -> re-inspect -> verify`.

---

## Diagnostic Categories (v1.0 Rulebook)

### 1. Responsiveness Rules
- `DS-R001` Horizontal Content Overflow
- `DS-R002` Text Wrapping Discontinuity
- `DS-R003` Mobile CTA Fold Displacement
- `DS-R004` Navigation Collision
- `DS-R005` Hidden Interactive Content

### 2. Design Consistency Rules
- `DS-C001` Unexplained Button Variant Proliferation
- `DS-C002` Typography Hierarchy Collision (H2 >= H1)
- `DS-C003` Spacing Rhythm Divergence
- `DS-C004` Inconsistent Card Border & Radius Treatment

### 3. Content Robustness Rules
- `DS-S001` Long-Text Content Overflow
- `DS-S002` Missing-Image Layout Collapse
- `DS-S003` Empty-State Spacing Imbalance

### 4. Design Intent Rules
- `DS-I001` Density Contract Mismatch
- `DS-I002` Accent Color Overuse
- `DS-I003` Generic Pattern Convergence

---

## Support Matrix v1.0

| Domain | Support Level | Notes |
| :--- | :--- | :--- |
| Browser | Chromium / Chrome / Edge | CDP protocol native |
| Operating System | Linux, macOS, Windows | Headless browser execution |
| Frameworks | React, Next.js, Vue, Svelte, Vite, HTML/CSS | Supported via computed styles and source maps |
| Styling Systems | TailwindCSS, CSS Modules, Vanilla CSS | Computed styles resolution |

---

## Definition of Done (v1.0 Benchmark)

Formalin v1.0 is considered stable when:
1. **Precision:** Technical layout issue detection achieves at least 85% precision with less than 10% false positives.
2. **Source Attribution:** Correctly maps visual symptoms to source code files in at least 80% of detected issues.
3. **Agent Independence:** Claude Code, Cursor, Codex, or Gemini CLI can consume `.formalin/critique.json` without custom plugins or MCP servers.
