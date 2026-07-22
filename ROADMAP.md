# Formalin v1.0 Roadmap & Plugin Specifications

Formalin is a standalone global plugin for AI coding agents. Operating as an autonomous AST & class-string sanitizer, Formalin intercepts frontend code writes (`.tsx`, `.jsx`, `.css`, `tailwind.config.*`) and deterministically strips "AI Slop Centroid" patterns without requiring manual `DESIGN.md` manifestos, browser rendering (CDP/Playwright), or root project file clutter.

---

## Product Promise v1.0

> Formalin operates as a silent, global plugin that intercept AI-generated frontend code, stripping generic AI slop signatures (purple gradients, floating shadows, chaotic spacing) and normalizing tokens into crisp, production-grade design system standards deterministically.

---

## Technical Pillars

- **100% Global Plugin:** Installs in `~/.gemini/config/plugins/formalin`. Zero files created in project root directories.
- **Deterministic Token Transformation:** Pure AST/Regex class string transformation in <5ms.
- **Zero Token Cost:** 0 additional LLM token overhead and 0 browser rendering.

---

## Development Roadmap

### Phase 1: Core AST & Tailwind Class Sanitizer Engine (v0.1 Goal)
- [x] Implement Tailwind class string parser and transformer (`src/sanitizer/sanitizer.ts`).
- [x] Implement AI Slop Centroid stripping (shadows, rounded corners, saturated gradients).
- [x] Implement modular spacing scale normalizer.

### Phase 2: Global Plugin Integration & Manifest (v0.1 Goal)
- [x] Create `plugin.json` manifest and `skills/formalin-sanitizer/SKILL.md`.
- [x] Implement CLI entrypoint for file sanitization (`npx formalin sanitize <filepath>`).

### Phase 3: Advanced React/JSX AST Node Parser (v0.2 Goal)
- [ ] Add `@babel/parser` / `@swc/core` deep AST traversal for React JSX elements.
