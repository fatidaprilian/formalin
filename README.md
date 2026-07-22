# Formalin

> **Global Deterministic UI Sanitizer Plugin for AI Coding Agents.**
> Eliminate AI Slop centroids automatically. Formalin intercepts generated frontend code and transforms generic Tailwind/CSS class strings into crisp, production-grade design system tokens deterministically—with zero project root file clutter, zero token overhead, and zero browser rendering.

---

## Why Formalin?

AI coding agents (Claude Code, Cursor, Codex, Gemini CLI) generate generic "AI slop" (default purple gradients, identical floating shadows, chaotic spacing scales) because LLMs default to the safest statistical average in their training data.

Existing solutions have major drawbacks:
1. **Post-hoc Screenshot Loops (CDP/Playwright):** Slow, expensive in time and tokens, and reliant on approximate vision models.
2. **Static Design Manifestos (`DESIGN.md`):** Require manual writing, clutter project root directories, and waste prompt tokens.
3. **Prompt Anti-Slop Rules:** LLMs frequently ignore or distort prompt instructions under long context windows.

**Formalin takes a deterministic, global path:** It operates as a global agent plugin (`~/.gemini/config/plugins/formalin`) that intercepts generated frontend code and sanitizes AI slop class strings deterministically in less than 5ms.

---

## Core Capabilities

- **Zero Root Clutter:** Installed 100% globally. Zero files added to your workspace project root directories.
- **AI Slop Centroid Stripping:** Replaces generic drop shadows (`shadow-lg`), rounded corners (`rounded-xl`), and saturated purple gradients with crisp border tokens and neutral palettes.
- **Modular Spacing Normalization:** Aligns chaotic spacing classes (`p-3`, `gap-5`) to strict modular scale tokens (`p-4`, `gap-6`).
- **Zero Token Cost & Latency:** Runs as a pure AST & class string transformer in <5ms without additional LLM token calls or browser execution.

---

## Plugin Manifest & Installation

Formalin is packaged as a global AI agent plugin:

```json
{
  "name": "formalin",
  "version": "0.1.0",
  "description": "Global Deterministic UI Sanitizer Plugin for AI Coding Agents",
  "skills": [
    {
      "name": "formalin-sanitizer",
      "path": "skills/formalin-sanitizer/SKILL.md",
      "description": "Automatically sanitizes AI Slop centroids in TSX/JSX and CSS class strings."
    }
  ]
}
```

---

## Quickstart CLI Commands

Sanitize a TSX/JSX component file in place:
```bash
npx formalin sanitize src/components/Hero.tsx
```

Inspect and sanitize a raw Tailwind class string:
```bash
npx formalin inspect-class "p-3 bg-purple-600 rounded-xl shadow-lg"
```

---

## License

MIT
