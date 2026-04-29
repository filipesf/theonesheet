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
