# Architecture

> Layers, dependency rules, data flow. Authoritative for v0; v1 and v2 introduce additional layers under the same rules.

## Folder layout

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

## Dependency rules

```
app  →  features  →  domain  ←  ref-data
                     ▲
                     │
            persistence
```

- `app` may import from anything.
- `features` may import from `domain`, `persistence`, `ref-data`, and shared UI primitives — never from another `features/<x>` (cross-feature reuse goes through `domain` or shared UI).
- `domain` is a **pure leaf**: no React, no I/O, no DOM, no `localStorage`, no fetch. It only knows TypeScript, types, and pure functions.
- `ref-data` is a **pure leaf** of data: no behaviour, no functions beyond simple lookups.
- `persistence` may import from `domain` (for types) but never from `features` or `app`.

Violations of these rules are architecture bugs, not stylistic preferences.

## Primary data flow — editing a character attribute

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

## Persistence model

- Storage backend: `window.localStorage`.
- Key pattern: `tos:character:<id>` for individual characters, `tos:characters:index` for the ID list, `tos:dice-log:<characterId>` for dice history.
- Every persisted character carries `schemaVersion: 'v0'`. On read, `domain/migrations/` runs sequentially before returning a domain object.
- **Derived fields are never persisted.** Only sources (attributes, choices, equipment, conditions) are written. On every read/import, derived values are recomputed.
- Writes are debounced (~300 ms) to avoid thrashing on slider/number-input changes.

## Import / export

- Export: JSON file `{ schemaVersion, app: 'the-one-sheet', exportedAt, character }`.
- Import: parse → zod-validate against the current schema → run migrations → recompute derived → present a confirmation diff before persisting.
- Forward compatibility is the design goal: a v1 hosted instance must be able to import a v0 file.

## Routing (hash router)

- `#/` — Library (character cards).
- `#/character/new` — guided creation wizard.
- `#/character/:id` — sheet editor.
- `#/character/:id/sheet` — printed sheet view (fidelity-first to the official layout).
- `#/settings` — theme, language, import/export.

## Dice subsystem

- `features/dice/DiceTray` — Vaul drawer, hotkey-toggled, 3D dice via `@3d-dice/dice-box`.
- `features/dice/DiceLog` — sidebar history (D&D Beyond Game Log style), capped at ~100 entries per character.
- TOR-specific presets implement the Feat Die + Success Die mechanic, including Gandalf and Eye runes.
- Dice subsystem is **decoupled from Character state**: it accepts a roll request `{ label, formula, characterId? }` and never mutates the character.

## What lives where — quick lookup

| You want to… | File / area |
| --- | --- |
| Change a TOR rule formula | `src/domain/derived.ts` |
| Add a validation invariant | `src/domain/validate.ts` |
| Add a Culture / Calling / Skill | `src/ref-data/<area>.ts` |
| Change how Characters are stored | `src/persistence/local-storage.ts` |
| Add a route | `src/app/router.ts` |
| Add a creation wizard step | `src/features/creation/` |
| Tune the printed sheet layout | `src/features/sheet/PrintedCharacterSheet.tsx` |

## Boundaries that exist for v1 readiness

- The repository pattern in `persistence/` will swap `localStorage` for a `supabase-character-repository.ts` in v1 without touching `features/` or `domain/`.
- The migration layer in `domain/migrations/` is the seam where v0 → v1 schema upgrades land.
- All character access in `features/` goes through hooks (`useCharacterLibrary`, `useCharacter`) — never direct `localStorage` reads.

## UI primitives and tooling

Visual tokens, themes, and component aesthetics live in `DESIGN.md` at the repo root. This section covers the technical layer — which libraries we depend on and where shared UI primitives are extracted to.

### Library choices

- **Component primitives:** the shadcn/ui pattern (copy-paste into the repo when needed). Do **not** install `shadcn` as a dependency — there is no `shadcn` package on the dependency list and there should not be one.
- **Icons:** `lucide-react`.
- **Drawers:** `vaul` (used for the dice tray).
- **Toasts:** `sonner`.
- **Forms:** `react-hook-form` + `zod`.

### Extraction rule

Lift a component into `src/app/ui/` (or wherever a shared primitive sits) only after the **third** duplication. Two similar usages are not yet a pattern; three are.

### Shared primitives in `src/app/ui/`

| Component | Use |
| --- | --- |
| `Modal` | Dialogs (rename, delete, import) and the dice tray. Handles focus trap, scroll-lock, Escape, ARIA. |
| `PrimaryButton` / `GhostButton` / `DestructiveButton` | The three button styles consumed by dialogs and the wizard footer. |
| `SelectionCard` | The "pick one of these" button (cultures, attribute sets, callings, distinctive features, themes). Props: `active`, `padding` (`'sm'` / `'md'`), plus the standard button attributes. Handles `aria-pressed`, focus ring, and disabled state. |

## Reference data conventions

> Originally `docs/CONTENT_TOR2E.md`. Folded in here so the file-organization rules sit next to the layer rules they belong to. The TOR 2e content scope and licensing rules live in [`DOMAIN_SPEC.md`](./DOMAIN_SPEC.md) Appendix A.

### Files

```
src/ref-data/
├── cultures.ts        # the playable Cultures
├── proficiencies.ts   # combat proficiencies
├── skills.ts          # the 18 skills with groupings
├── labels.ts          # short string labels (i18n keys, display names)
└── notes.ts           # static notes / hints surfaced in the UI
```

Future additions (as needed):

```
├── callings.ts        # Captain, Champion, Messenger, Scholar, Treasure-Hunter, Warden
├── equipment.ts       # weapons, armour, shields, helms, gear with stats
├── virtues.ts         # Cultural and Calling Virtues
└── rewards.ts         # Cultural and Calling Rewards
```

### Conventions

1. Every reference module exports `as const` literals so TypeScript infers the narrowest possible type.

   ```ts
   export const SKILLS = [
     { id: 'awe', group: 'personality' },
     { id: 'inspire', group: 'personality' },
     // ...
   ] as const;
   ```

2. IDs are stable, lowercase, ASCII, kebab-case. They are persisted in characters; renaming an ID is a breaking schema migration.

3. Display names live in i18n (`features/<area>/locales/pt-BR/...`), not in `ref-data`. `ref-data` only holds machine-stable identifiers and mechanical data.

4. Mechanical numbers (TN modifiers, base values, costs) live in `ref-data`. Derivation logic that combines them lives in `domain/derived.ts`.

5. Cross-references between content files are by ID, never by object reference. This avoids circular imports and keeps the data graph serialisable.

### Adding a new entry — checklist

1. Decide which file owns it (`cultures.ts`, `skills.ts`, etc.). If a new category appears, add a new file rather than mixing.
2. Define the entry as a const literal with a stable ID.
3. Update the type alias in the same file (or in `ref-data/types.ts` if shared).
4. Add the i18n keys in the relevant locale bundle.
5. If derivation logic depends on the new entry, extend `domain/derived.ts` and add unit tests in `domain/__tests__/`.
6. If the entry is selectable during creation, surface it in `features/creation/`.
7. If the entry shows up on the printed sheet, update `features/sheet/PrintedCharacterSheet.tsx` and run a print preview to verify layout.

### Schema versioning

- The `Character` schema includes a `schemaVersion` field, currently `'v0'`.
- Adding optional fields is **not** a breaking change; bumping the version is reserved for shape changes that break a v0 file.
- When you bump the version, add a migration in `src/domain/migrations/` and a fixture in `src/persistence/__tests__/` proving the old file can still be imported.

### Worked examples (existing)

- `src/domain/__tests__/derived.test.ts` — exercises derived calculations.
- `src/domain/__tests__/worked-example.test.ts` — full character end-to-end derivation.

When adding a Culture, Calling, or Skill, **add or extend a worked example** that covers it. Without that, regressions land silently.

### What `ref-data/` must never do

- Import from `domain/` (would create a cycle; `domain` already depends on `ref-data`).
- Contain functions, classes, or React.
- Read from `localStorage`, fetch, or `import.meta.env`.
- Hold any user-specific data.
