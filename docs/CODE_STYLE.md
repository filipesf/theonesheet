# Code Style

> TypeScript and React conventions for The One Sheet. Lint and typecheck enforce most of this; the rest is judgement, documented here so it stops being negotiated per PR.

## TypeScript

- **Strict mode is non-negotiable.** No `any`, no implicit any. Use `unknown` and narrow.
- `noUncheckedIndexedAccess: true`. Array access returns `T | undefined`; handle it.
- Prefer `type` aliases for unions and shapes; `interface` for things that are extended.
- Prefer `as const` for literal data (especially in `ref-data/`) so the inferred type is the data.
- zod schemas live next to the type they validate, only at boundaries (import/export, form payloads). Don't wrap internal models in zod.
- Do not export types from a file that doesn't own them. Re-exports belong in `domain/types.ts` and similar barrels.

## React

- Function components only. No class components.
- One component per file. Filename matches the component (`CharacterCard.tsx`).
- Hooks live next to the feature that owns them (`features/library/useCharacterLibrary.ts`). Generic hooks promote to `src/app/hooks/` only after the third caller.
- Controlled components for editor inputs. Uncontrolled is acceptable for ephemeral search/filter UI.
- Avoid `useEffect` for derivation. Compute in render or memoise; reach for effects only for true side effects (subscriptions, debounced persistence, focus management).

## File and folder naming

- Components: `PascalCase.tsx`.
- Hooks: `useX.ts`.
- Pure modules: `kebab-case.ts` (`local-storage.ts`, `import-export.test.ts`).
- Tests: co-located in `__tests__/` next to the file under test (current convention).
- One convention only — pick the existing one when adding files.

## Imports

- Path alias `@/*` maps to `src/*`. Use it for cross-layer imports; relative imports are fine within the same folder.
- Order: external packages → `@/` aliases → relative siblings. ESLint sorts this; do not fight it.

## Naming

- Domain entities follow the PRD: `Character`, `Calling`, `Culture`, `Skill`, `CombatProficiency`, `Virtue`, `Reward`. Do not invent synonyms.
- Derived fields are prefixed with `derived` only when ambiguity would otherwise arise; usually the field name itself (`endurance`, `hope`, `parry`) is enough — context makes it clear.
- Boolean variables read as predicates: `isWeary`, `hasShadow`, `canAdvance`.

## Comments

- Default to **no comment**. Identifier names carry the intent.
- Comments are reserved for non-obvious **why**: hidden constraints, workarounds for specific bugs, invariants that would surprise a reader.
- Never write tutorial comments ("// loop over skills"), commit/PR-context comments ("// fixes issue #42"), or "removed X" markers.
- JSDoc only on exported functions of `domain/` and `persistence/` where signature alone is ambiguous.

## Errors

- Let errors propagate unless there is a specific recovery path. Empty `try/catch` is a bug.
- At UI boundaries (mutation handlers), surface errors via `sonner` toast and log via `console.error`. Nothing else uses `console.*`.
- `domain/` throws typed errors (custom error classes when needed) — never returns `null` to mean "failure".

## Tests

- `domain/` and `persistence/` are heavily tested. Aim for total branch coverage on rule-engine code.
- Component tests assert behaviour (Testing Library), never snapshots.
- Test files end in `.test.ts(x)` and live in `__tests__/` next to the source. Helpers can live in `src/test/`.
- Run `pnpm test` after non-trivial edits. Run `pnpm tsc` after changes that touch types.

## i18n

- Every visible string goes through `t('namespace.key')`. No exceptions, even for "TODO" placeholders.
- Keys use `domain.subdomain.key`. Keys are stable; values are not.
- Put feature-specific keys in `features/<area>/locales/`. Promote shared keys to `app/locales/` only after the third reuse.
- pt-BR is the only bundle in v0. en-GB is added before the first non-Brazilian player.

## Git

- Commit messages follow the existing style in `git log`: short imperative title (≤72 chars), no body for trivial commits, no co-author trailer.
- Commits are signed (`git commit -S`). The `/commit` command enforces this.
- Never amend a published commit. Never force-push to `main`. Never skip hooks.
- Working tree must be clean before `/push`.

## Performance

- The character list never has more than ~50 entries; do not pre-optimise it. The dice log is capped at ~100 per character; same.
- The 3D dice scene is heavy — `@3d-dice/dice-box` is loaded via dynamic `import()` only when the tray opens.
- Memoise components that re-render on every keystroke in the editor (sheet panels) — but only after measuring, not preemptively.

## What we do not do

- No barrel files (`index.ts` re-exports) outside of explicit barrels in `domain/types.ts` and `ref-data/`.
- No global state library (no Redux, no Zustand). Context + hooks until pain shows up.
- No CSS-in-JS. Tailwind v4 utility classes, with semantic tokens.
- No ad-hoc theme overrides on a per-component basis. Edit tokens, not components.
- No deep prop-drilling beyond two levels. Hoist or lift to Context instead.
