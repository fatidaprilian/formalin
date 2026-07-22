# Formalin

> **A Learned Design Preference Engine for AI Coding Agents.**
> Stop feeding static design manifestos or running slow browser screenshot loops. Formalin infers your visual preferences automatically by comparing write-time AI proposals against your final edits, and compiles them into compact context blocks for AI agents.

---

## Why Formalin?

AI coding agents (Claude Code, Cursor, Codex, Gemini CLI) tend to generate generic "AI slop" (default purple gradients, identical shadcn cards, Inter font everywhere) because LLMs revert to the safest statistical average in their training data.

Existing solutions have major drawbacks:
1. **Post-hoc Screenshot Loops (CDP/Playwright):** Slow, expensive in time and tokens, and reliant on approximate vision models.
2. **Static Design Manifestos (`DESIGN.md`):** Require manual writing, go stale, and waste tokens on static prose.
3. **Git Commit Trailers (`Co-Authored-By`):** Disliked by developers for privacy reasons, non-standard, and easy to disable.

**Formalin takes a privacy-first path:** It captures AI-written code at write-time into a local `.formalin/shadow/` store via agent hooks, diffs it against your final committed code, and compiles your visual preferences into compact, actionable context blocks.

---

## Core Architecture

```text
┌─────────────────────────┐
│ Agent Write/Edit Event  │
│ (PostToolUse Hook)      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  formalin snapshot      │ ──▶ Saves raw AI proposal into .formalin/shadow/
└────────────┬────────────┘
             │ (Developer edits & commits naturally)
             ▼
┌─────────────────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  formalin record        │ ──▶ │  Preference       │ ──▶ │  Context            │
│  (Shadow vs Commit Diff)│     │  Aggregation     │     │  Compiler           │
└─────────────────────────┘     │  (profile.json)  │     │  (brief & check)    │
                                └──────────────────┘     └────────────────────┘
```

1. **Write-Time Shadow Snapshots:** Automatically captures raw AI code proposals into `.formalin/shadow/` via agent hooks without polluting Git history or requiring co-author headers.
2. **Delta Signal Extraction:** Diffs committed file content against shadow snapshots, extracting deltas on color tokens, spacing scale, border radius, depth/shadows, and typography.
3. **Preference Aggregation:** Updates a lightweight profile in `.formalin/profile.json` storing scored preference dimensions (-1.0 to +1.0) with confidence bounds.
4. **Context Compiler:** Generates two token-efficient Markdown context blocks:
   - **Pre-generation Brief (`formalin brief`):** Copy-pasted at the start of an AI coding session.
   - **Post-generation Checklist (`formalin check`):** Copy-pasted before declaring work done for self-verification.

---

## Quickstart CLI Commands

Initialize local preference profile & generate agent hook snippets:
```bash
npx formalin init
```

Capture write-time snapshot (called automatically by agent hooks):
```bash
npx formalin snapshot src/components/Hero.tsx
```

Record preferences from shadow vs committed diffs:
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
Design defaults for this developer (derived from 12 prior edits, updated 2026-07-22):
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
