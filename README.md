# Formalin

> **A Learned Design Preference Engine for AI Coding Agents.**
> Stop feeding static design manifestos or running slow browser screenshot loops. Formalin infers your visual preferences automatically from your Git commit history and compiles them into compact context blocks for AI agents.

---

## Why Formalin?

AI coding agents (Claude Code, Cursor, Codex, Gemini CLI) tend to generate generic "AI slop" (default purple gradients, identical shadcn cards, Inter font everywhere) because LLMs revert to the safest statistical average in their training data.

Existing solutions have major drawbacks:
1. **Post-hoc Screenshot Loops (CDP/Playwright):** Slow, expensive in time and tokens, and reliant on approximate vision models.
2. **Static Design Manifestos (`DESIGN.md`):** Require manual writing, go stale, and waste tokens on walls of static prose that don't reflect what you actually keep.

**Formalin takes a third path:** It infers your design preferences **automatically from your Git commit edits**—with zero browser rendering—and compiles those preferences into compact, actionable context blocks.

---

## Core Architecture

```text
┌─────────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  Signal          │     │  Preference       │     │  Context            │
│  Extraction      │ ──▶ │  Aggregation      │ ──▶ │  Compiler           │
│  (git diff)      │     │  (scored profile) │     │  (brief & check)    │
└─────────────────┘     └──────────────────┘     └────────────────────┘
```

1. **Signal Extraction:** Diffs Git commit history on frontend files (`.tsx`, `.jsx`, `.css`, `tailwind.config.*`), extracting deltas on color tokens, spacing scale, border radius, depth/shadows, and typography.
2. **Preference Aggregation:** Updates a lightweight profile in `.formalin/profile.json` storing scored preference dimensions (-1.0 to +1.0) with confidence bounds.
3. **Context Compiler:** Generates two token-efficient Markdown context blocks:
   - **Pre-generation Brief (`formalin brief`):** Copy-pasted at the start of an AI coding session.
   - **Post-generation Checklist (`formalin check`):** Copy-pasted before declaring work done for self-verification.

---

## Quickstart CLI Commands

Initialize local preference profile:
```bash
npx formalin init
```

Record preferences from recent Git commits:
```bash
npx formalin record
```

Generate pre-generation brief for AI session initiation:
```bash
npx formalin brief
```

Generate post-generation verification checklist:
```bash
npx formalin check
```

---

## Example Outputs

### Pre-Generation Brief (`npx formalin brief`)

```text
Design defaults for this developer (derived from prior edits, updated 2026-07-22):
- Palette: cool-neutral base, single restrained warm accent. Avoid saturated hues.
- Spacing: generous — default to gap-6/p-8 over tighter scales.
- Corners: sharp / low-radius; reserve rounding for primary CTAs only.
- Depth: avoid drop shadows; use borders and contrast instead.
- Typography: distinctive display face paired with neutral body font.
```

### Post-Generation Checklist (`npx formalin check`)

```text
Before finishing, check the generated component against this developer's history:
- Does spacing match the generous density this developer consistently keeps?
- Are corners consistent with their historical low-radius pattern?
- Does the palette avoid saturated accents this developer repeatedly reverts?
- Is there an unnecessary drop-shadow this developer tends to remove?
```

---

## License

MIT
