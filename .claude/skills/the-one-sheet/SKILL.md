---
name: the-one-sheet
description: Project context for The One Sheet — a local-first character-sheet web app for The One Ring 2e (TOR) TTRPG. Use this skill at the very start of every session in this repository, and whenever the user mentions The One Sheet, TOR, The One Ring, character sheet, ficha, hero, Loremaster, or asks you to edit any file under /Users/filipefernandes/Code/theonesheet. The skill loads architecture, design system, code style, and TOR-content conventions so edits respect the project's contracts. Invoke even if the user does not name the skill — "let's add a feature here" or "fix the printed sheet" should trigger it. Prefer this skill over generic React/TypeScript guidance whenever working in this repo.
---

# The One Sheet — Session Skill

You are working in **The One Sheet** repository: a local-first web app for managing player-character sheets for the TTRPG *The One Ring 2e* (Free League). It is for internal use by the maintainer's RPG group; not commercial.

## Boot sequence — run before non-trivial edits

Read these files in order. If you have already read them earlier in the same session, do not re-read them.

1. **`AGENTS.md`** (repo root) — universal contract: conventions, do-not-touch zones, commands, handoff rules. Read every session.
2. **`PRODUCT.md`** (repo root) — register, users, brand personality, anti-references, strategic design principles. Read before any UI work or product decision.
3. **`DESIGN.md`** (repo root) — visual tokens, themes (parchment + tor-dark), typography, elevation, component conventions, do's and don'ts. The `DESIGN.json` sidecar carries tonal ramps, motion, and component snippets. Read before any UI work.
4. **`docs/ARCHITECTURE.md`** — layers, dependency rules, persistence model, routing, dice subsystem, shared UI primitives, reference-data conventions. Read before any architectural or cross-feature change.
5. **`docs/CODE_STYLE.md`** — TypeScript and React conventions, naming, imports, tests, i18n, comments. Read before writing more than a handful of lines.

## Read on demand

- **`docs/DOMAIN_SPEC.md`** — canonical TOR 2e domain specification: glossary, data model, formulas, validation invariants, reference tables, content scope and licensing. Required when touching `src/domain/`, `src/ref-data/`, adding a Culture/Calling/Skill, or changing TOR 2e mechanics. Edits are allowed when TOR errata or missing rules surface; treat the document as authoritative, not as a frozen artefact.
- **`docs/PLAN_MVP.md`** — current implementation plan. Consult when deciding whether work is in scope.
- **`docs/PLAN_v0.md` / `PLAN_v1.md` / `PLAN_v2.md`** — version-scoped plans. Use to decide whether something is v0, v1, or v2. Read-only.
- **`docs/ROADMAP.md`** — one-page index of all the above.

## Hard rules (the ones that hurt the most when broken)

- **`derived` never persists.** Storage holds source fields only; recompute on every read/import/edit. Persisting `endurance`, `parry`, `load`, `hope`, TNs, or conditions is a regression.
- **`domain/` is a pure leaf.** No React, no `localStorage`, no fetch, no `import.meta.env`. The compiler will not catch every violation; the architecture rule is stricter than the type system.
- **`ref-data/` is a pure leaf.** Data only, no behaviour. Cross-references between content files are by ID, never by reference.
- **Zero hardcoded UI strings.** Always `t('namespace.key')`. Even in a single-bundle pt-BR app, hardcoding now means a painful retrofit later.
- **No `console.*` except `console.error`.** ESLint warns; treat it as a hard rule.
- **No `any`.** Use `unknown` and narrow.

## Out of scope without explicit confirmation

If a request seems to require any of these, **stop and confirm with the user before proceeding**. They are deferred by design:

- Supabase, auth, sync, multi-device → v1.
- Campaigns, GM controls, join links, rich text → v2.
- Mobile polish → v1.
- PWA / service worker → not scheduled.
- LLM at app runtime → never.
- Migration from ESLint to Biome → only when ESLint becomes friction.

## Do not touch without explicit user request

- `docs/PLAN_v0.md`, `PLAN_v1.md`, `PLAN_v2.md` — plan snapshots. Append new versions; never edit.
- `docs/PLAN_TECHSTACK.md` — generic blueprint reference.
- `pnpm-lock.yaml` — only via `pnpm` commands.
- `dist/`, `node_modules/`, `.git/`.

`docs/DOMAIN_SPEC.md` and `PRODUCT.md` are authoritative but no longer immutable: edit when TOR errata or scope decisions justify it, never on a whim.

## Common tasks — orientation

| Task | Where it lives |
| --- | --- |
| Change a TOR rule formula | `src/domain/derived.ts` |
| Add a validation invariant | `src/domain/validate.ts` |
| Add or edit a Culture / Calling / Skill | `src/ref-data/<area>.ts` (and update i18n + tests) |
| Change how Characters are stored | `src/persistence/local-storage.ts` |
| Add a route | `src/app/router.ts` |
| Add a creation wizard step | `src/features/creation/` |
| Tune the printed sheet layout | `src/features/sheet/PrintedCharacterSheet.tsx` (always preview print after) |
| Add or change a colour/theme token | `src/styles.css` (`@theme` block) |

## Commands available in this repo

- `/commit` — signed commit (`-S`), with confirmation, no co-author trailer, no `--amend`.
- `/push` — push to `main` with explicit confirmation; verifies clean working tree first.
- `/audit` — sweep current diff against architecture/design/style docs and report violations.

Use these. Do not commit, push, or audit by hand.

## Models per task (Claude Code)

| Task | Model |
| --- | --- |
| Planning, architecture, large refactors, TOR rule logic | Claude Opus 4.7 |
| Day-to-day implementation, feature edits, UI | Claude Sonnet 4.6 |
| Mechanical tasks (renames, formatting, sweeps) | Claude Haiku 4.5 |

## Why this skill exists

The repo's contracts are not all enforceable by the compiler. Layer purity, derived-never-persisted, theme tokens instead of ad-hoc values, i18n discipline, and version-scoped scope (v0 vs v1 vs v2) are conventions that surface in code review, not in `tsc`. Loading this context up front turns a class of recurring mistakes into non-events.
