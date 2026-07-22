# Formalin (v1.0.0)

> **A 100% Automatic Layered Anti-Genericness Engine for AI Coding Agents.**
> Stop feeding static design manifestos or typing manual CLI commands. Formalin operates 100% automatically in the background via agent lifecycle hooks—gating generic narrative briefs, learning visual preferences from real edits, and injecting custom design defaults into your AI coding sessions.

---

## Why Formalin?

AI coding agents (Claude Code, Cursor, Codex, Gemini CLI) generate generic "AI slop" because LLMs revert to the safest statistical average in their training data.

Hardcoded rule substitution tools (e.g. "always replace Inter with Geist" or "always replace shadow-lg with borders") fail because **a shared static rulebook manufactures a new cliché within months**.

Formalin solves this via a **two-layer architecture**:
1. **Layer 0 (Narrative Genericness Gate):** Rejects lazy, generic creative briefs before a single line of code is written.
2. **Layer 1 (Learned Preference Engine):** Learns what *this specific developer* keeps vs reverts from write-time shadow snapshots without polluting Git history.

---

## 100% Automatic Lifecycle Hook Architecture

Formalin runs completely in the background via agent lifecycle hooks:

```text
Lifecycle Event             Trigger Hook              Formalin Action
------------------          ------------              ---------------
Session Start               SessionStart              Injects pre-generation brief into agent context
Pre-First Write             PreToolUse (Write|Edit)   Runs Layer 0 Narrative Genericness Gate
Write/Edit Executed         PostToolUse (Write|Edit)  Captures write-time snapshot into .formalin/shadow/
Session Task Completion     Stop                      Verifies post-generation checklist
Developer Commit            Git post-commit           Extracts deltas and updates .formalin/profile.json
```

---

## Quickstart

Initialize local profile, agent hooks, and Git post-commit hook:

```bash
npx formalin init
```

To install Formalin as a global plugin across all projects:

```bash
npx formalin install-plugin
```

That's it! Once initialized, open your AI coding agent as usual. Formalin runs 100% automatically in the background.

---

## License

MIT
