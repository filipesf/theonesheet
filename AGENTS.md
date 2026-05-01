# AGENTS.md — The One Sheet

> Context contract for any LLM coding agent (Claude Code, Cursor, Aider, Codex, etc.) working in this repository.

## 1. Boot

**Every session in this repository must, before non-trivial edits, read in order:**

1. This file (`AGENTS.md`).
2. The local skill `the-one-sheet` (at `.claude/skills/the-one-sheet/SKILL.md` for Claude Code; non-Claude agents read the referenced docs directly).
3. The five reference docs:
   - `PRODUCT.md` (root) — register, users, brand personality, anti-references, design principles.
   - `DESIGN.md` (root) — visual tokens, themes, typography, components, do's and don'ts. Carries `DESIGN.json` as a sidecar for tonal ramps, shadows, motion, and component snippets.
   - `docs/DOMAIN_SPEC.md` — canonical TOR 2e domain specification: glossary, data model, formulas, validation invariants, reference tables. Authoritative for `src/domain/` and `src/ref-data/`.
   - `docs/ARCHITECTURE.md` — layers, dependency rules, persistence model, routing, dice subsystem, shared UI primitives, reference-data conventions.
   - `docs/CODE_STYLE.md` — TypeScript and React conventions.
4. The current plan in `docs/PLAN_MVP.md` and the index at `docs/ROADMAP.md`.

If you are Claude Code, invoke the `the-one-sheet` skill at the start of every session in this repository. The skill exists precisely to make step (3) one tool call instead of four.

## 2. Project

The One Sheet is a local-first web app for players to manage character sheets for the TTRPG **The One Ring 2e** (Free League). Inspirations: D&D Beyond (organisation) and Shadowdarklings (scope). Internal use (the maintainer's RPG group) — no commercial intent at present.

- **v0 (current)** — local-first, single-user, `localStorage`, no auth.
- **v1** — hosted, accounts, multi-device, mobile.
- **v2** — campaigns and GM controls.

Canonical TOR 2e domain spec: `docs/DOMAIN_SPEC.md`. Strategic / brand context: `PRODUCT.md` (root).

## 3. Mandatory conventions

- TypeScript **strict**. No `any`. zod only at boundaries (import/export, forms).
- UI language: **pt-BR only** in v0. Zero hardcoded strings — always via `t()`.
- Comment and doc language: **en-GB** (matches existing project precedent).
- Communication with the human user: **pt-BR**.
- `derived` never persists. Recompute on load/import/edit.
- `domain/` is a pure leaf — no I/O, no React.
- `ref-data/` is a pure leaf — data only, no behaviour.
- Absolute imports via `@/*` for cross-layer; relative within the same folder.
- Comments only where the **why** is non-obvious.
- `console.*` forbidden except `console.error`.

## 4. Folder structure

```
src/
├── app/            # shell, providers, hash router, top nav
├── features/       # UI by domain (library, creation, sheet, dice, ...)
├── domain/         # pure: types, schema, derived, validate, normalise, migrations
├── persistence/    # localStorage adapters, exporter, importer
├── ref-data/       # TOR 2e: cultures, callings, skills, equipment, virtues, rewards
├── test/           # global test setup
├── main.tsx
└── styles.css
```

Dependencies: `app → features → domain ← ref-data`; `features → persistence → domain`. Violations are architecture bugs.

## 5. Do-not-touch zones

- `docs/PLAN_v0.md`, `PLAN_v1.md`, `PLAN_v2.md` — versioned plan snapshots, immutable. Create a new version if scope shifts.
- `dist/` — build artefact, never commit.
- `pnpm-lock.yaml` — only edit via `pnpm` commands; never hand-edit.
- `.git/`, `node_modules/` — never edit.

## 5a. Treat as authoritative (edits welcome but require justification)

- `docs/DOMAIN_SPEC.md` — canonical TOR 2e domain spec. Edits are allowed when TOR errata, missing rules, or misalignments with the source book surface. Never rewrite scope sections without confirmation; prefer adding clarifications inline (e.g. "as of v2 errata, …") to amending older statements.
- `PRODUCT.md` (root) — strategic / brand context. Update when the user's brand or scope decisions evolve, not on a whim. When `PRODUCT.md` and `DOMAIN_SPEC.md` disagree on facts about the system, `DOMAIN_SPEC.md` wins.

## 6. Commands

```bash
pnpm install
pnpm dev            # dev server
pnpm build          # tsc -b && vite build
pnpm test           # vitest run
pnpm test:watch
pnpm lint           # eslint .
pnpm tsc            # typecheck only
```

CI runs: lint → typecheck → test → build → deploy (GitHub Pages).

## 7. Repo slash commands (Claude Code)

- `/commit` — signed commit (`-S`), with confirmation, no co-author trailer, no `--amend`.
- `/push` — push to `main` with explicit confirmation; verifies clean working tree first.
- `/audit` — sweep current diff against `docs/ARCHITECTURE.md`, `DESIGN.md`, `docs/CODE_STYLE.md`. Reports violations grouped by severity. No auto-fix.

## 8. Models per task (Claude Code)

| Task | Model |
| --- | --- |
| Planning, architecture, large refactors, TOR rule logic | Claude Opus 4.7 |
| Day-to-day implementation, feature edits, UI | Claude Sonnet 4.6 |
| Mechanical tasks (renames, formatting, sweeps) | Claude Haiku 4.5 |

## 9. Handoff

- The agent **writes** code; the human **reviews**.
- The agent **proposes** architectural decisions; the human **decides**.
- Commits happen **only when the human asks**, via `/commit`.
- Push happens **only when the human asks**, via `/push`.
- The agent **does not run** destructive actions without confirmation: `rm -rf`, `git reset --hard`, `git push --force`, drop table, delete file ranges, etc.

## 10. Out-of-scope flags

If a task seems to require Supabase, auth, sync, campaigns, GM, mobile polish, PWA, runtime LLM, or Biome migration — **stop and confirm with the human**. These items are deferred by design (see §2.4 of `docs/PLAN_MVP.md`).

## 11. Quick orientation

| You want to… | Where to look |
| --- | --- |
| Change a TOR rule formula | `src/domain/derived.ts` |
| Add a validation invariant | `src/domain/validate.ts` |
| Add a Culture / Calling / Skill | `src/ref-data/<area>.ts` |
| Change how Characters are stored | `src/persistence/local-storage.ts` |
| Add a route | `src/app/router.ts` |
| Add a creation wizard step | `src/features/creation/` |
| Tune the printed sheet layout | `src/features/sheet/PrintedCharacterSheet.tsx` |

## 12. Design Context

The strategic and visual contracts that used to live inline here have moved to two top-level files at the repo root:

- **`PRODUCT.md`** — register, users, product purpose, brand personality, anti-references, design principles, accessibility & inclusion.
- **`DESIGN.md`** (+ `DESIGN.json` sidecar) — visual tokens, themes, typography, elevation, components, do's and don'ts.

Both follow the [Google Stitch](https://stitch.withgoogle.com/docs/design-md/format/) PRODUCT.md / DESIGN.md format and are read by the impeccable skill (`$impeccable craft`, `polish`, `audit`, etc.) at the start of every UI task. When `PRODUCT.md` and `docs/DOMAIN_SPEC.md` disagree on facts about the system (mechanics, data model, derived formulas), `DOMAIN_SPEC.md` wins; `PRODUCT.md` is updated, never the other way around.
