# Formalin v1.0 Roadmap & Concept Specification

Formalin is an automatic design preference learning engine for AI coding agents. It infers a developer's visual design preferences directly from Git commit history—without browser rendering, screenshots, or vision models—and compiles those preferences into compact, token-efficient context blocks.

---

## Product Promise v1.0

> Formalin infers how a developer actually designs by analyzing text-level diffs on frontend code in Git commits, updating a lightweight preference profile, and compiling it into concrete pre-generation briefs and post-generation verification checklists for AI coding agents.

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
- **No Mandatory MCP Server:** v1.0 is a standalone CLI tool that generates Markdown context blocks. (MCP server can be an optional layer later).
- **No Manually-Written Manifestos:** Profile is built exclusively from implicit Git commit edits.

---

## Development Roadmap

### Phase 1: Signal Extraction Engine (v0.1 Goal)
- [ ] Implement Git diff parser for `.tsx`, `.jsx`, `.css`, and `tailwind.config.*`.
- [ ] Extract deltas for Tailwind spacing, color classes, border radius, and shadow tokens.

### Phase 2: Preference Aggregation & Scoring Profile (v0.1 Goal)
- [ ] Implement `.formalin/profile.json` initializer (`formalin init`).
- [ ] Implement incremental scoring updates with confidence weighting (`formalin record`).

### Phase 3: Context Compiler (v0.1 Goal)
- [ ] Implement pre-generation brief compiler (`formalin brief`).
- [ ] Implement post-generation checklist compiler (`formalin check`).

### Phase 4: Micro-Calibration Onboarding (v0.2 Goal)
- [ ] Implement 4-8 pairwise component questions for cold-start initialization (`formalin calibrate`).

### Phase 5: Optional MCP Adapter Layer (v0.3 Goal)
- [ ] Provide optional Model Context Protocol (MCP) wrapper for seamless agent integration.
