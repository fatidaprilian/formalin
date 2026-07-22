# Formalin v1.0 Roadmap & Concept Specification

Formalin is an automatic design preference learning engine for AI coding agents. It captures AI-written code at write-time into a local shadow store via agent hooks, diffs the shadow snapshots against final committed code, and compiles learned visual design preferences into compact context blocks.

---

## Product Promise v1.0

> Formalin infers how a developer actually designs by analyzing write-time AI code proposals against final committed edits, updating a lightweight preference profile, and compiling it into concrete pre-generation briefs and post-generation verification checklists for AI coding agents.

---

## Core Scored Dimensions

Formalin maintains a small, fixed profile in `.formalin/profile.json` storing scored preference dimensions (-1.0 to +1.0) with confidence bounds:

| Dimension | -1.0 Extreme | +1.0 Extreme | What's tracked |
| :--- | :--- | :--- | :--- |
| `color_temperature` | Cool / Slate | Warm / Amber | Hue shift deltas in color tokens |
| `saturation_restraint` | Desaturated / Muted | Saturated / Vibrant | Color saturation deltas |
| `spacing_density` | Tight / Compact (`gap-2`) | Generous / Spaced (`gap-6`) | Padding, margin, and gap scale steps |
| `radius_preference` | Sharp / Square (`rounded-none`) | Soft / Rounded (`rounded-full`) | Border radius token modifications |
| `depth_style` | Flat / Border-led | Elevated / Shadow-led | Drop shadow additions or removals |
| `typography_character` | System / Neutral | Editorial / Distinctive | Font family and weight selections |

---

## Non-Goals (v1.0 Scope Boundaries)

To prevent scope creep, Formalin v1.0 explicitly excludes:
- **No CDP / Playwright / Browser Rendering:** All analysis is static text and AST diffing.
- **No Vision LLM Calls:** No screenshot captures or image processing.
- **No Git Commit Trailers (`Co-Authored-By`):** Uses write-time agent hook shadow snapshots instead of git commit conventions.
- **No Mandatory MCP Server:** v1.0 is a standalone CLI tool that generates Markdown context blocks.
- **No Manually-Written Manifestos:** Profile is built exclusively from implicit edits.

---

## Development Roadmap

### Phase 1: Write-Time Shadow Snapshot Store (`formalin snapshot`)
- [ ] Implement write-time file shadow capturing into `.formalin/shadow/`.
- [ ] Generate agent hook configuration snippets (`.claude/settings.json`).

### Phase 2: Delta Extraction Engine (`formalin record`)
- [ ] Implement AST / Tailwind class diffing comparing committed code against shadow snapshots.
- [ ] Extract deltas for spacing, color tokens, border radius, and shadow tokens.

### Phase 3: Preference Aggregation & Profile (`formalin init`)
- [ ] Implement `.formalin/profile.json` initializer and scoring update algorithm.

### Phase 4: Context Compiler (`formalin brief` & `formalin check`)
- [ ] Implement pre-generation brief compiler (`formalin brief`).
- [ ] Implement post-generation checklist compiler (`formalin check`).
