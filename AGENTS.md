# AGENTS.md — The One Sheet

> Context contract for any LLM coding agent (Claude Code, Cursor, Aider, Codex, etc.) working in this repository.

## 1. Boot

**Every session in this repository must, before non-trivial edits, read in order:**

1. This file (`AGENTS.md`).
2. The local skill `the-one-sheet` (at `.claude/skills/the-one-sheet/SKILL.md` for Claude Code; non-Claude agents read the referenced docs directly).
3. The four reference docs:
   - `docs/ARCHITECTURE.md`
   - `docs/DESIGN_SYSTEM.md`
   - `docs/CONTENT_TOR2E.md`
   - `docs/CODE_STYLE.md`
4. The current plan in `docs/PLAN_MVP.md` and the index at `docs/ROADMAP.md`.

If you are Claude Code, invoke the `the-one-sheet` skill at the start of every session in this repository. The skill exists precisely to make step (3) one tool call instead of four.

## 2. Project

The One Sheet is a local-first web app for players to manage character sheets for the TTRPG **The One Ring 2e** (Free League). Inspirations: D&D Beyond (organisation) and Shadowdarklings (scope). Internal use (the maintainer's RPG group) — no commercial intent at present.

- **v0 (current)** — local-first, single-user, `localStorage`, no auth.
- **v1** — hosted, accounts, multi-device, mobile.
- **v2** — campaigns and GM controls.

Canonical product source: `docs/PRD_TheOneSheet.md`.

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

- `docs/PRD_TheOneSheet.md` — read-only. PRD changes are product decisions, not agent decisions.
- `docs/PLAN_v0.md`, `PLAN_v1.md`, `PLAN_v2.md` — versioned plan snapshots, immutable. Create a new version if scope shifts.
- `dist/` — build artefact, never commit.
- `pnpm-lock.yaml` — only edit via `pnpm` commands; never hand-edit.
- `.git/`, `node_modules/` — never edit.

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
- `/audit` — sweep current diff against `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/CODE_STYLE.md`. Reports violations grouped by severity. No auto-fix.

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

> Persistent design brief for any agent working on UI/UX in this repository. Read alongside `docs/DESIGN_SYSTEM.md` (which carries the tokens). This section answers the *why* behind the tokens.

### Users

- **Primary audience.** Players in the maintainer's tabletop RPG group running *The One Ring 2e* (Free League / Devir). Adults, table-experienced, comfortable with sheet-driven RPGs (D&D Beyond level of fluency).
- **Context of use.** A second screen on a laptop or tablet during a session, alongside dice and the printed rulebook. Outside sessions, occasional bursts to update XP, gear, or tweak the hero between adventures.
- **Job to be done.** Create a Player-hero respecting the system's invariants, keep the sheet honest during play (Endurance, Hope, Shadow, conditions), and print or share a sheet that looks at home next to the official Free League PDF.
- **Not the audience.** Newcomers being introduced to the system. The wizard guides, but copy assumes the player has read or will read the rules; we do not re-teach TOR 2e in tooltips.

### Brand Personality

- **Three words.** Bookish · Crafted · Quiet.
- **Voice and tone.** Spare, declarative, faintly literary. No marketing energy, no exclamation marks, no emoji. Microcopy should feel set in type rather than shouted by an app.
- **Emotional goal.** Confidence and reverence — the player should feel they are tending a manuscript that belongs to their hero, not filling out a form. Calm at rest; legible at speed.
- **References (positive).** The official TOR 2e printed character sheet (canonical visual spec — `src/features/sheet/PrintedCharacterSheet.tsx` exists to honour it). D&D Beyond for organisation patterns. Shadowdarklings for scope and restraint.
- **Anti-references.** Generic SaaS dashboards (Stripe-style chrome, gradients, neon CTAs). Fantasy clichés that read as cosplay (dragon-scale borders, faux-medieval drop caps, parchment textures used as wallpaper). Bootstrap card grids. Anything that announces "I am a TTRPG tool" before the content does.

### Aesthetic Direction

- **Visual tone.** Manuscript-on-parchment, hand-illuminated but disciplined. Type does most of the work; ornament is rare and deliberate.
- **Colour.** Two themes via CSS variables on `:root[data-theme]` — `parchment` (warm cream + ink-navy + ink-red, current default) and `tor-dark` (warm parchment text on near-black, bronze/moss accents). Token names are stable across themes; consumers never branch on theme. Print always forces the parchment palette regardless of the user's preference.
- **Typography.** Cinzel for display and labels (uppercase, generously tracked), Cormorant Garamond for body and inputs, Caveat for player-written content (name, backstory) so it reads as the hero's own hand. Sub-12 px text only via the four `text-eyebrow` / `text-microlabel` / `text-microcaption` / `text-microline` tokens — 8 px is the absolute floor.
- **Layout.** Generous tracking on uppercase labels (`tracking-eyebrow` 0.28em is the manuscript tell). Modest radii (`rounded-md` panels, `rounded-full` pills). Five named shadow tokens, never ad-hoc.
- **Motion.** Subtle and purposeful — the only place motion is *the feature* is the 3D dice tray (`@3d-dice/dice-box`). Everywhere else, motion serves the action and bows out under `prefers-reduced-motion`.
- **Print.** The printed sheet (`/character/:id/sheet`) is the canonical visual spec. When screen and print drift, the editor follows the printed sheet.

### Design Principles

1. **The printed sheet is the truth.** Every screen-only flourish must survive the print test. If the editor diverges from the printed sheet, the editor is wrong.
2. **Type is the design.** Reach for typography (size, weight, tracking, family) before colour, before borders, before icons. Decoration is a last resort, not a default.
3. **Tokens, not values.** Colours, shadows, sub-12 px sizes, and tracking go through the named tokens in `src/styles.css`. Ad-hoc `text-[10px]`, `tracking-[0.2em]`, `shadow-[…]`, or hex literals are smells — escalate by adding a token, not by bypassing the system.
4. **Calm beats clever.** No gradients, no glassmorphism, no skeuomorphic ink-drying. The dice tray is the only place where motion is permitted to be theatrical; everywhere else, less.
5. **Accessibility is non-negotiable.** WCAG AA contrast against the active theme. Every interactive element keyboard-reachable. `:focus-visible` styles mandatory. `prefers-reduced-motion` honoured beyond the global safety net.
