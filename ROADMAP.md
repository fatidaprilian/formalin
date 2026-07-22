# Formalin v1.0 Product Roadmap & Release Specifications

Formalin is a 100% automatic, layered anti-genericness engine for AI coding agents. It pairs Layer 0 (Narrative Genericness Gate) with Layer 1 (Learned Preference Engine) via automatic agent lifecycle hooks (`SessionStart`, `PreToolUse`, `PostToolUse`, `Stop`, and Git `post-commit`).

---

## v1.0 Production Release Matrix

| Phase | Event | Automated Action | Status |
| :--- | :--- | :--- | :--- |
| **Session Start** | `SessionStart` Hook | Automatically injects pre-generation brief into AI agent memory | **RELEASED (v1.0)** |
| **Pre-Write** | `PreToolUse` Hook | Automatically runs Layer 0 Narrative Gate on creative brief | **RELEASED (v1.0)** |
| **Write/Edit** | `PostToolUse` Hook | Automatically captures write-time shadow snapshot into `.formalin/shadow/` | **RELEASED (v1.0)** |
| **Task Stop** | `Stop` Hook | Automatically verifies post-generation checklist | **RELEASED (v1.0)** |
| **Developer Commit** | Git `post-commit` | Automatically extracts deltas and updates `.formalin/profile.json` | **RELEASED (v1.0)** |

---

## v1.0 Features Released

- **Layer 0 Narrative Genericness Gate:** Detects buzzword density (`innovative`, `seamless`, `cutting-edge`, `disruptive`, `frictionless`), structural template rigidity, and personal constraint signals.
- **Layer 1 Learned Preference Engine:** Captures write-time shadow snapshots, extracts semantic deltas (spacing, radius, shadow/depth, saturation, temperature, typography), and updates confidence-weighted scores.
- **Automated Lifecycle Hook Installation:** Generates `.claude/settings.json` and `.git/hooks/post-commit` automatically during `npx formalin init`.
- **Global Plugin Installer:** Enables one-command global installation via `npx formalin install-plugin`.
