---
description: Sweep the current diff against architecture, design system, and code-style docs. Reports violations grouped by severity. No auto-fix.
---

# /audit

Verify that recent changes still align with the project's architecture, design system, and code-style contracts. Read-only — produces a report; never edits files.

## Procedure

1. Read the three contracts:
   - `docs/ARCHITECTURE.md`
   - `docs/DESIGN_SYSTEM.md`
   - `docs/CODE_STYLE.md`
   - Plus `AGENTS.md` for the universal rules.

2. Determine the diff scope:
   - Default: `git diff main...HEAD` plus the working tree (`git diff` and `git diff --staged`).
   - If the user passes a ref or path argument, use that instead.

3. Inspect the changed files for violations across these axes:

   **Architecture**
   - `domain/` importing React, `localStorage`, `fetch`, or any I/O.
   - `ref-data/` containing functions, classes, or React.
   - `features/<x>` importing from `features/<y>` (cross-feature reuse).
   - `persistence/` importing from `features/` or `app/`.
   - Direct `localStorage` access from `features/` (must go through `persistence/` hooks).
   - New routes not registered in `src/app/router.ts`.
   - New persisted fields that are derived (must not persist).

   **Design system**
   - Hard-coded colour values (`#abc`, `rgb(...)`, `hsl(...)`) instead of CSS tokens.
   - Ad-hoc font stacks instead of `--font-display` / `--font-body` / `--font-label` / `--font-hand`.
   - Custom Tailwind values like `gap-[7px]` (token bypass).
   - Print-only styles outside the `@media print` block in `src/styles.css`.
   - Missing `:focus-visible` on new interactive elements.

   **Code style**
   - `any` (explicit or implicit), `as any`, suppressed `@ts-ignore`.
   - `console.log` / `console.warn` / `console.info` (only `console.error` is allowed).
   - Hard-coded user-visible strings (anything inside JSX text or `aria-*` attributes that is not `t(...)`).
   - New components not in PascalCase, hooks not prefixed `use`, modules not in kebab-case.
   - Imports from `@/*` mixed in with relative imports for the same depth (style drift).
   - Snapshot tests, E2E tests, or new test conventions outside of `__tests__/`.
   - JSDoc on internal/private functions.

   **Out-of-scope creep**
   - References to Supabase, auth, OAuth, JWT, real-time, WebSocket, service worker, PWA manifest, Biome, TanStack Query that are not gated behind v1/v2.
   - New runtime LLM calls (forbidden in v0/v1/v2).

4. Produce a report in this exact format:

```markdown
# /audit — <date> — <commit short>

## Summary
- Files changed: <N>
- Violations: <total> (critical: <C>, major: <M>, minor: <m>)

## Critical
- [ ] <file>:<line> — <rule violated> — <why it matters>

## Major
- [ ] <file>:<line> — <rule violated> — <why it matters>

## Minor / style drift
- [ ] <file>:<line> — <rule violated>

## Out-of-scope creep
- [ ] <file>:<line> — <what is out of scope> — <which version owns it>

## All clear
<List axes that found nothing.>
```

5. Severity guidance:
   - **Critical**: layer-purity violations, derived-persistence, runtime LLM calls, hardcoded secrets.
   - **Major**: missing i18n, `any`, `console.*` (non-error), style-token bypass, out-of-scope features without confirmation.
   - **Minor**: naming drift, JSDoc on private functions, import-order quirks.

## Hard rules

- **Never edit files** during `/audit`. The command produces text only.
- **Never commit or push.** Those are separate commands.
- **Never silence a violation** by adding it to a config exception. Surface it.
- If the diff is empty, say so and stop.
