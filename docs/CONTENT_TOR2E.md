# Content — The One Ring 2e Reference Data

> How TOR 2e content (cultures, callings, skills, gear, virtues, rewards) is structured in `src/ref-data/` and how to add or update entries.

## Scope and licensing

- The MVP supports **The One Ring 2e core book only**. Loremaster's Guide and supplements are out of scope.
- This is **internal use only** for the maintainer's RPG group; no public release.
- Reference data should structure mechanics (numbers, formulas, rule references), not reproduce flavour text from the book. Player-written descriptions, names, and notes are filled in by the user.
- If/when the project is released publicly, content licensing must be revisited (see `[DESIGNER]` flag in `PLAN_MVP.md`).

## Files

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

## Conventions

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

## Adding a new entry — checklist

1. Decide which file owns it (`cultures.ts`, `skills.ts`, etc.). If a new category appears, add a new file rather than mixing.
2. Define the entry as a const literal with a stable ID.
3. Update the type alias in the same file (or in `ref-data/types.ts` if shared).
4. Add the i18n keys in the relevant locale bundle.
5. If derivation logic depends on the new entry, extend `domain/derived.ts` and add unit tests in `domain/__tests__/`.
6. If the entry is selectable during creation, surface it in `features/creation/`.
7. If the entry shows up on the printed sheet, update `features/sheet/PrintedCharacterSheet.tsx` and run a print preview to verify layout.

## Schema versioning

- The `Character` schema includes a `schemaVersion` field, currently `'v0'`.
- Adding optional fields is **not** a breaking change; bumping the version is reserved for shape changes that break a v0 file.
- When you bump the version, add a migration in `src/domain/migrations/` and a fixture in `src/persistence/__tests__/` proving the old file can still be imported.

## Worked examples (existing)

- `src/domain/__tests__/derived.test.ts` — exercises derived calculations.
- `src/domain/__tests__/worked-example.test.ts` — full character end-to-end derivation.

When adding a Culture, Calling, or Skill, **add or extend a worked example** that covers it. Without that, regressions land silently.

## What ref-data must never do

- Import from `domain/` (would create a cycle; `domain` already depends on `ref-data`).
- Contain functions, classes, or React.
- Read from `localStorage`, fetch, or `import.meta.env`.
- Hold any user-specific data.

## What ref-data must never contain

- Verbatim flavour text or descriptions from the TOR 2e book — see "Scope and licensing" above.
- Internal review notes — those go to `docs/` or to GitHub issues, not into `src/`.
