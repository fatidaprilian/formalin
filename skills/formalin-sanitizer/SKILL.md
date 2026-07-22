---
name: formalin-sanitizer
description: Automatically sanitizes AI Slop centroids in TSX/JSX and CSS class strings deterministically.
---

# Formalin Deterministic UI Sanitizer Skill

Use this skill when generating or refactoring React/TSX/JSX components or CSS stylesheets.

## Core Rules
1. Avoid generic AI slop signatures: floating drop shadows (`shadow-lg`), rounded corners (`rounded-xl`), and saturated purple gradients (`bg-purple-600`).
2. Use crisp border tokens (`border border-slate-200 dark:border-slate-800`) instead of heavy shadows.
3. Normalize spacing to strict modular scale steps (`gap-6`, `p-8`).
