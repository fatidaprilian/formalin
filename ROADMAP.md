# Formalin v1.0 Roadmap & Hook Specifications

Formalin is a 100% automatic, layered anti-genericness engine for AI coding agents. It pairs Layer 0 (Narrative Genericness Gate) with Layer 1 (Learned Preference Engine) via automatic agent lifecycle hooks (`SessionStart`, `PreToolUse`, `PostToolUse`, `Stop`, and Git `post-commit`).

---

## Lifecycle Automation Matrix

| Phase | Event | Automated Action |
| :--- | :--- | :--- |
| **Session Start** | `SessionStart` Hook | Automatically injects pre-generation brief into AI agent memory |
| **Pre-Write** | `PreToolUse` Hook | Automatically runs Layer 0 Narrative Gate on creative brief |
| **Write/Edit** | `PostToolUse` Hook | Automatically captures write-time shadow snapshot into `.formalin/shadow/` |
| **Task Stop** | `Stop` Hook | Automatically verifies post-generation checklist |
| **Developer Commit** | Git `post-commit` | Automatically extracts deltas and updates `.formalin/profile.json` |

---

## Non-Goals (v1.0 Scope Boundaries)

- **No Manual Command Execution:** All operations run automatically via lifecycle hooks.
- **No Static Rule Manifestos:** Avoids shared fixed substitutions (`shadow-lg` -> `border`) that manufacture new clichés.
- **No CDP / Playwright / Vision Models:** All processing runs on text/AST parsing in <5ms.
- **No Git Commit Trailer Dependency:** Uses write-time agent hooks instead of `Co-Authored-By` headers.

---

## Roadmap

### Phase 1: Layer 0 Narrative Genericness Gate (v0.1)
- [x] Implement buzzword blacklist analyzer (`src/layer0/detector.ts`).
- [x] Implement structural rigidity and personal signal checks.

### Phase 2: Layer 1 Write-Time Shadow Snapshots (v0.1)
- [x] Implement shadow snapshot store (`src/layer1/snapshot.ts`).
- [x] Implement AST & Tailwind class semantic delta extractor (`src/layer1/extractor.ts`).
- [x] Implement profile aggregator (`src/layer1/aggregator.ts`).

### Phase 3: Automated Hook Configuration (v0.1)
- [x] Implement hook config generator (`src/hooks/generator.ts`).
- [x] Generate agent settings (`.claude/settings.json`).
