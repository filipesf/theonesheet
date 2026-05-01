# PLAN_MVP — The One Sheet

> Living implementation plan for the v0 (local-first) MVP. Combines the product-specific scope from `PLAN_v0.md` with the tech-stack decisions made for this project, with explicit deferrals recorded for v1 and v2.

---

## 1. Design and Development Philosophy

1. **Canonical rules first.** `docs/DOMAIN_SPEC.md` is the source of truth. Schema, formulas, and invariants in `src/domain/` are canonical; the UI derives, never redefines.
2. **Derived never persists.** TNs, Endurance, Hope, Parry, Load, and conditions are always recomputed on load/import/edit. Storage holds sources only.
3. **Local-first is a decision, not a phase.** v0 is fully offline, single-user, no network. Auth and sync are v1, an intentional architectural break — not "we'll add it later".
4. **TypeScript strict from day 1.** No `any`. zod only at boundaries (import/export, forms).
5. **Heavy tests on pure-domain; light on UI.** Deterministic rules deserve dense unit tests. Components get smoke tests. No snapshot or E2E.
6. **Rule of three for abstraction.** Duplicate until the third occurrence. Premature abstraction is enemy number one for a solo project.
7. **Zero hardcoded strings.** Everything via `t()` from day 1, even with a single pt-BR bundle.
8. **"Done" = usable + rules tests pass.** Typecheck/lint are CI hygiene, not the definition of done.
9. **LLM is dev-time only.** No app feature calls an LLM at runtime in v0/v1/v2. All intelligence is human ↔ Claude Code collaboration.
10. **Compact, referenced documentation.** AGENTS.md plus four short docs in `docs/`. Comments only where the "why" is non-obvious.

---

## 2. Application Architecture

### 2.1 Components

```
┌──────────────────────────────────────────────────────────┐
│  app/  (shell, hash router, providers, top nav)          │
└──────────────────────────────────────────────────────────┘
        │                                       │
        ▼                                       ▼
┌──────────────────┐                 ┌──────────────────────┐
│  features/       │                 │  features/dice/      │
│  ├ library/      │                 │  ├ DiceTray (vaul)   │
│  ├ creation/     │                 │  ├ DiceLog (sidebar) │
│  ├ sheet-editor/ │                 │  └ TOR roll presets  │
│  └ sheet/ (print)│                 └──────────────────────┘
└──────────────────┘                            │
        │                                       │
        ▼                                       │
┌────────────────────────────────────────────────────────┐
│  domain/  (pure)                                       │
│  ├ types.ts        ├ derived.ts                        │
│  ├ validate.ts     ├ normalise.ts                      │
│  ├ schema.ts       └ migrations/                       │
└────────────────────────────────────────────────────────┘
        │                                       │
        ▼                                       ▼
┌────────────────────┐                 ┌──────────────────┐
│  persistence/      │                 │  ref-data/       │
│  ├ local-storage   │                 │  ├ cultures      │
│  ├ export          │                 │  ├ skills        │
│  └ import (zod)    │                 │  ├ proficiencies │
└────────────────────┘                 │  ├ labels, notes │
        │                              └──────────────────┘
        ▼
   localStorage
```

**Dependency rule:** `app → features → domain ← ref-data` and `features → persistence → domain`. `domain` is a pure leaf (no I/O, no React). `ref-data` is a pure leaf (data only, no behaviour).

### 2.2 Primary data flow — editing a character attribute

```
User input
  → features/sheet-editor (controlled form)
  → domain/normalise.ts        (sanitise)
  → domain/validate.ts         (invariants)
  → domain/derived.ts          (recompute Endurance, Hope, TNs, Load, Parry, conditions)
  → in-memory state (Context)
  → persistence/local-storage  (debounced write)
  → UI re-render
```

### 2.3 Tech stack

| Layer | Choice | Rationale | MVP / Later |
| --- | --- | --- | --- |
| Bundler | Vite 6 (in use) | Fast HMR, ESM-first | MVP |
| Runtime | React 19 (in use) | Already installed | MVP |
| Language | TypeScript 5.8 strict | Domain is type-heavy | MVP |
| Styling | Tailwind v4 (in use) | Already wired up | MVP |
| Components | shadcn/ui (copy-paste) | Owned source, no lock-in | MVP |
| Routing | react-router-dom 6 (hash) | Already in use; GH Pages-friendly | MVP |
| Forms | react-hook-form + zod | Single schema for form and payload | MVP |
| Server state | — | No server in v0 | v1 (Supabase + TanStack Query) |
| Client state | Context + custom hooks | Sufficient for one user, one tab | MVP |
| Persistence | `localStorage` | Aligns with DOMAIN_SPEC; small payload; simple | MVP |
| Migrations | `domain/migrations/` (versioned) | `schemaVersion: 'v0'` from day 1 | MVP |
| Import/Export | JSON + zod on import | Cross-version compat for v1 | MVP |
| Dice roller | `@3d-dice/dice-box` | Approved, lazy-loaded | MVP |
| Dice log | Sidebar persisted in `localStorage` | D&D Beyond-style | MVP |
| i18n | i18next + react-i18next | Single pt-BR bundle, no hardcode | MVP |
| Tests | Vitest + Testing Library + jsdom | Already in use | MVP |
| Lint/format | ESLint 9 + typescript-eslint | Already in use; Biome migration optional | Later (Biome) |
| Package manager | pnpm | Already in use, lockfile present | MVP |
| CI | GitHub Actions | Aligned with GH Pages | MVP |
| Deploy | GitHub Pages | Free static hosting | MVP |
| Backend (BaaS) | — | v1 introduces Supabase | v1 |
| Auth | — | v1 | v1 |
| Real-time | — | v2 (if needed) | v2 |
| PWA | — | Browser cache + storage cover offline basics | Later |
| Tolkien dark theme | CSS vars + `data-theme="tor"` | Coexists with current parchment theme | MVP |

### 2.4 Explicit deferrals

- **Supabase, auth, sync, multi-device** → v1 (`PLAN_v1.md`).
- **Campaigns, GM, join links, rich text** → v2 (`PLAN_v2.md`).
- **Biome migration** → only when ESLint config becomes friction.
- **PWA / service worker** → only when "home screen icon" is requested.
- **Mobile polish** → v1 (`PLAN_v1.md` covers it).
- **TanStack Query** → only when a remote source exists (v1).

---

## 3. Skills / Commands / Hooks Build Decisions

### 3.1 Skills

| Criterion | Verdict |
| --- | --- |
| Recurring task in MVP workflow? | **Yes** — every session must load architecture/design/style context |
| Absence causes repeated effort? | **Yes** — without it, agents either ignore docs or require manual reading instructions |
| Cost (build + maintain) < benefit? | **Yes** — short skill, ~40 lines, near-zero maintenance |

**Verdict: Build now** — one skill, `the-one-sheet`.

Spec:
- Location: `.claude/skills/the-one-sheet/SKILL.md`.
- Behaviour: lists the four reference docs and instructs the agent to read them before non-trivial edits. AGENTS.md instructs the agent to invoke this skill at session start.

### 3.2 Commands

| Criterion | Verdict |
| --- | --- |
| Recurring task? | **Yes** — commit, push, and audit happen every cycle |
| Absence causes repeated effort? | **Yes** — without commands, commit-style and audit-checklist instructions get re-pasted |
| Cost < benefit? | **Yes** — each command is 20–50 lines |

**Verdict: Build now** — three commands.

Specs:
1. `/commit` — `git status` → `git diff` → propose imperative-style message (≤72 char title, no co-author, GPG-signed) → confirm → specific `git add` → `git commit -S`.
2. `/push` — verify branch is `main`, working tree clean → confirm → `git push origin main` → report deploy URL when GH Pages completes.
3. `/audit` — read `docs/ARCHITECTURE.md`, `DESIGN.md`, `docs/CODE_STYLE.md` → scan `git diff main` → report violations grouped by severity. No auto-fix.

### 3.3 Hooks

| Criterion | Verdict |
| --- | --- |
| Recurring task? | **No** — no MVP workflow requires deterministic automation outside the LLM |
| Absence causes repeated effort? | **No** — CI gates typecheck/lint/test |
| Cost < benefit? | N/A |

**Verdict: Skip.** Revisit when a workflow appears that must run independently of the LLM (e.g. Supabase types regen on migration save, in v1).

---

## 4. AGENTS.md

Delivered as `/AGENTS.md` at repo root. See that file for the full content.

---

## 5. LLM Workflow

### 5.1 Where LLMs are used

| Stage | LLM use | Default model |
| --- | --- | --- |
| Planning a feature/refactor | Claude Code with `hl-create-plan` | Opus 4.7 |
| Feature implementation | Claude Code with `hl-implement-plan` or direct | Sonnet 4.6 |
| TOR rule code (`domain/derived.ts`, etc.) | Claude Code | Opus 4.7 |
| UI / component / Tailwind | Claude Code with `frontend-design` / `i-polish` | Sonnet 4.6 |
| Mechanical refactor, rename, sweep | Claude Code | Haiku 4.5 |
| Code review / audit | Repo command `/audit` | Sonnet 4.6 |
| Commit / push | Repo commands `/commit`, `/push` | Haiku 4.5 |
| Debug | Claude Code with `hl-debug` | Sonnet 4.6 |
| Pre-merge polish | `i-polish`, `i-harden`, `web-design-guidelines` | Sonnet 4.6 |

**No LLM at app runtime** in v0/v1/v2.

### 5.2 Storage of prompts and instructions

| Path | Scope | Read by |
| --- | --- | --- |
| `AGENTS.md` (root) | Universal contract | Any LLM agent |
| `docs/*.md` | Universal technical documentation | Any LLM, any human |
| `.claude/skills/the-one-sheet/SKILL.md` | Claude Code-specific | Claude Code only |
| `.claude/commands/{commit,push,audit}.md` | Claude Code-specific | Claude Code only |
| `.claude/settings.json` | Claude Code-specific | Claude Code only |

If other agent runners are adopted (Cursor, Aider, etc.), their configs go under their own `.cursor/`, `.aider/` directories and read `AGENTS.md` plus `docs/`.

### 5.3 Human ↔ LLM handoff

| Actor | Does |
| --- | --- |
| Human | Defines scope, decides trade-offs, reviews diffs, authorises commit/push |
| LLM | Reads context, proposes plans, writes code and tests, runs lint/test, reports |
| LLM **never** | Commits without `/commit`, pushes without `/push`, deletes data, edits `docs/PLAN_v*` snapshots, adds dependencies without explicit flag |

---

## 6. Open flags

- `[DESIGNER: TOR 2e content licensing strategy]` — non-blocking for internal use; revisit before any public release.

---

## 7. References

- `docs/DOMAIN_SPEC.md` — canonical TOR 2e domain spec
- `PRODUCT.md` (root) — strategic / brand context
- `DESIGN.md` (root) — visual contracts
- `docs/PLAN_v0.md` — local-first MVP detail
- `docs/PLAN_v1.md` — hosted product outline
- `docs/PLAN_v2.md` — campaigns outline
- `docs/ROADMAP.md` — one-page index
