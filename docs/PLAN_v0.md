# The One Sheet v0 Implementation Plan

## Overview

`v0` is the local-first MVP of The One Sheet. It delivers a single-page character sheet application for The One Ring 2e where one user can create, edit, store, export, and import multiple characters entirely in the browser.

The goal of this version is to validate the core domain model, sheet ergonomics, and derived-rule engine before introducing accounts, backend persistence, or collaborative campaign features.

## Current State Analysis

The repository currently contains only the product requirements document:

- `DOMAIN_SPEC.md`

The PRD already defines the core domain model and rule engine we should treat as canonical:

- `Character` schema: `DOMAIN_SPEC.md:88-163`
- `Company` schema: `DOMAIN_SPEC.md:273-292`
- Derived-value formulas: `DOMAIN_SPEC.md:318-409`
- Character creation flow: `DOMAIN_SPEC.md:425-531`
- Validation invariants: `DOMAIN_SPEC.md:1241-1275`
- Recommended architecture: `DOMAIN_SPEC.md:1427-1728`

Important product clarifications for `v0`:

- The app is single-page with multiple views/panels, inspired by ShadowDarklings.
- Data is stored in `localStorage` only.
- A browser can hold multiple characters.
- Export/import must support forward compatibility with future hosted versions.
- `Company`, campaigns, accounts, and GM collaboration are out of scope.

## Desired End State

At the end of `v0`, a user can open the app and:

- Create a new hero using The One Ring 2e character rules.
- Edit an existing hero in a single-page interface with multiple sections.
- Store multiple heroes in browser `localStorage`.
- Automatically recompute all derived values from canonical inputs.
- Export any hero to a versioned JSON payload.
- Import a previously exported hero and revalidate/recompute it.
- Recover their data after reload without a server.

The MVP is successful when the browser-only application is useful as a standalone character manager even before any online features exist.

### Key Discoveries

- The most stable core is the shared domain logic for formulas and invariants, not infrastructure: `DOMAIN_SPEC.md:1471-1478`.
- The collaboration boundary begins at Company formation in creation Phase 9, which makes it the cleanest cut line after MVP creation support: `DOMAIN_SPEC.md:523-531`.
- Imported data cannot be trusted as authoritative for derived fields; the app must recompute TNs, endurance, hope, parry, load, and conditions on load/import: `DOMAIN_SPEC.md:320-385`.
- The PRD contains known rule-data gaps that should be tracked explicitly rather than hidden in code assumptions: `DOMAIN_SPEC.md:1394-1405`.

## What We're NOT Doing

Out of scope for `v0`:

- User accounts or authentication.
- Any backend API or database.
- Cross-device sync.
- Campaigns, `Company`, `Patron`, `Safe Haven`, or `Fellowship Focus` as collaborative entities.
- Loremaster dashboards or GM controls.
- Realtime updates, SSE, or WebSockets.
- Full audit log or event-sourced session history.
- Rich mobile optimisation beyond basic functional responsiveness.
- Advanced progression flows beyond what is required to manage the character sheet.

## Implementation Approach

Build `v0` as a frontend-only TypeScript application, but preserve the future architecture boundaries from day one.

Recommended structure:

- `src/app` for shell and routing/view state.
- `src/features/sheet` for character-sheet views and editing flows.
- `src/features/library` for local character list and import/export actions.
- `src/domain` for pure calculations, invariants, and normalisers.
- `src/ref-data` for cultures, callings, skills, combat proficiencies, and gear tables.
- `src/persistence` for `localStorage` adapters and export/import serializers.

Core engineering rule:

- Persist only source-of-truth fields and metadata we own.
- Recompute all derived fields whenever a character is read, imported, or edited.

## Phase 1: App Skeleton and Domain Foundation

### Overview

Create the initial application shell, canonical domain types, rule engine, and reference data needed to support character calculations without any UI complexity yet.

### Changes Required

#### 1. Project bootstrap
**Files**: `package.json`, `tsconfig.json`, `vite.config.ts`, app entry files
**Changes**:

- Initialise a React + TypeScript app.
- Configure strict TypeScript.
- Add test tooling.
- Set up a minimal component and styling approach appropriate for a sheet-heavy UI.

#### 2. Canonical schema and types
**Files**: `src/domain/schema.ts`, `src/domain/types.ts`
**Changes**:

- Define app-level types for `Character` and nested entities based on the PRD.
- Add an explicit `schemaVersion` field for export/import payloads.
- Split source fields from derived fields where useful for internal safety.

```ts
export type ExportedCharacterFile = {
  schemaVersion: 'v0';
  app: 'the-one-sheet';
  exportedAt: string;
  character: Character;
};
```

#### 3. Rule engine and recomputation layer
**Files**: `src/domain/derived.ts`, `src/domain/validate.ts`, `src/domain/normalise.ts`
**Changes**:

- Implement formulas for TNs, max endurance, max hope, base parry, effective parry, load, weary, and miserable.
- Add a `normaliseCharacter` function that recomputes derived values from raw inputs.
- Add invariants for legal ranges and critical creation rules that are stable enough for MVP.

```ts
export function normaliseCharacter(input: Character): Character {
  const withDerivedStats = recomputeDerivedStats(input);
  const withLoad = recomputeLoad(withDerivedStats);

  return {
    ...withLoad,
    conditions: {
      ...withLoad.conditions,
      weary: withLoad.current_endurance <= withLoad.load,
      miserable: withLoad.shadow >= withLoad.current_hope,
    },
  };
}
```

#### 4. Reference data package-in-place
**Files**: `src/ref-data/*.ts`
**Changes**:

- Encode cultures, callings, skills, proficiencies, war gear, standard of living thresholds, and starting rules from the PRD.
- Mark incomplete canonical data with explicit placeholders and comments tied to the PRD gaps.

### Success Criteria

#### Automated Verification
- [x] App installs and starts locally: `pnpm install && pnpm dev`
- [x] Domain tests pass: `pnpm test`
- [x] Type checking passes: `pnpm tsc --noEmit`
- [x] Linting passes once configured: `pnpm lint`

#### Manual Verification
- [ ] A developer can create a valid in-memory character object from PRD data.
- [ ] Derived values update correctly when base attributes or gear change.
- [ ] Known data gaps are clearly documented in code, not silently guessed.

**Implementation Note**: After this phase, manually verify the rules engine against the worked example before building more UI on top of it.

---

## Phase 2: Single-Page Character Sheet and Local Library

### Overview

Build the main UX: one app shell with multiple sheet views plus a local character library for switching between heroes stored in the browser.

### Changes Required

#### 1. App shell and section navigation
**Files**: `src/app/App.tsx`, `src/features/sheet/*`
**Changes**:

- Create a single-page layout with navigable sections such as identity, attributes, skills, gear, conditions, rewards/virtues, and notes.
- Keep navigation lightweight: tabs, sidebar, or sticky subnav.
- Optimise for quick editing over wizard completeness.

#### 2. Local character library
**Files**: `src/features/library/*`, `src/persistence/local-storage.ts`
**Changes**:

- Store multiple characters under a stable storage key.
- Support create, duplicate, rename, delete, and switch active character.
- Add safe load/save and corruption fallback handling.

```ts
const STORAGE_KEY = 'the-one-sheet:v0:characters';

export function saveCharacters(characters: CharacterRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
}
```

#### 3. Editing model
**Files**: `src/features/sheet/editor/*`
**Changes**:

- Support direct editing of source fields.
- Prevent direct editing of derived fields.
- Surface validation issues inline without blocking every intermediate draft state.

### Success Criteria

#### Automated Verification
- [x] UI component tests pass: `pnpm test`
- [x] Local persistence tests pass for create/update/delete flows: `pnpm test`
- [x] Build succeeds: `pnpm build`

#### Manual Verification
- [ ] A user can create multiple characters in one browser.
- [ ] Refreshing the page restores the same character library.
- [ ] Switching between characters does not overwrite the wrong record.
- [ ] Derived values remain read-only and visually distinct from editable fields.

**Implementation Note**: Pause after this phase to verify the sheet flow is genuinely useful before adding import/export and deeper creation tooling.

---

## Phase 3: Character Creation Helpers and Validation UX

### Overview

Add guided creation support for Phases 1-8 of the PRD without forcing a route-per-phase wizard.

### Changes Required

#### 1. Structured creation workflow inside the single page
**Files**: `src/features/creation/*`
**Changes**:

- Add a progressive creation experience embedded in the sheet.
- Support cultural defaults, calling choices, favoured skills, previous experience spending, starting gear, starting reward, and starting virtue.
- Track completion state per section.

#### 2. Creation-specific validation
**Files**: `src/domain/creation.ts`, `src/features/creation/validation.ts`
**Changes**:

- Implement validation for the most important creation invariants from the PRD.
- Distinguish between blocking invalid finalisation and acceptable draft incompleteness.

#### 3. Worked example regression
**Files**: `src/domain/__tests__/worked-example.test.ts`
**Changes**:

- Encode the Belba Bolger example from the PRD as a regression test.

### Success Criteria

#### Automated Verification
- [x] Worked example test passes: `pnpm test`
- [x] Creation validation tests pass: `pnpm test`
- [x] Type checking still passes: `pnpm tsc --noEmit`

#### Manual Verification
- [ ] A new user can create a hero without editing raw JSON.
- [ ] Previous Experience costs and gear restrictions are enforced clearly.
- [ ] Draft characters can exist before final completion.
- [ ] Finalised characters satisfy the key PRD invariants.

**Implementation Note**: Confirm the creation flow is understandable without backend support before finalising MVP scope.

---

## Phase 4: Export/Import and Forward-Compatibility Layer

### Overview

Make local-first data portable so `v0` characters can migrate into future hosted versions.

### Changes Required

#### 1. Versioned export format
**Files**: `src/persistence/export.ts`
**Changes**:

- Export a stable JSON envelope with app and schema metadata.
- Ensure exported files are importable in later versions even if the internal UI state changes.

#### 2. Import + migration entry point
**Files**: `src/persistence/import.ts`, `src/domain/migrations/*`
**Changes**:

- Validate imported payloads.
- Add a migration pipeline, even if initially it only handles `v0 -> v0`.
- Recompute all derived fields after import.

#### 3. UX and safety affordances
**Files**: `src/features/library/import-export/*`
**Changes**:

- Support export of a single character.
- Support import with duplicate-name handling.
- Show clear errors for invalid or incompatible files.

### Success Criteria

#### Automated Verification
- [x] Export/import round-trip tests pass: `pnpm test`
- [x] Invalid import payloads are rejected in tests: `pnpm test`
- [x] Build succeeds with import/export functionality: `pnpm build`

#### Manual Verification
- [ ] A user can export a character to JSON and re-import it successfully.
- [ ] Imported characters are normalised and display correct derived values.
- [ ] Invalid files fail safely without destroying existing local data.

**Implementation Note**: This phase is the MVP release gate because it protects future migration into server-backed versions.

---

## Testing Strategy

### Unit Tests
- Derived stat formulas from PRD section 4.
- Load calculation including armour, helm, shield, fatigue, and restrictions.
- Conditions (`weary`, `miserable`) recomputation.
- Standard-of-living thresholds where implemented.
- Creation cost calculations for skills and proficiencies.
- Export/import migration and normalisation behaviour.

### Integration Tests
- Create character -> save locally -> refresh -> reopen.
- Create two characters -> switch between them -> edit both safely.
- Export character -> clear storage -> import character -> verify integrity.

### Manual Testing Steps
1. Create a hero from scratch using the embedded creation flow.
2. Modify base attributes and confirm TNs and derived stats update immediately.
3. Add and remove gear, verifying load and conditions update correctly.
4. Create multiple heroes and switch between them.
5. Export one hero and import it into a fresh browser profile.
6. Attempt to import malformed JSON and verify the failure state is safe and understandable.

## Performance Considerations

- Character calculations are lightweight and should remain synchronous.
- Recompute-on-edit is acceptable if the rule engine stays pure and small.
- `localStorage` writes should be batched or debounced enough to avoid poor typing UX.
- Avoid over-engineering state management before real collaboration exists.

## Migration Notes

- Every exported payload must carry a `schemaVersion`.
- Future hosted versions should import the same JSON envelope, then migrate to the server-side schema.
- `v0` must treat imported derived values as disposable and regenerate them.
- If the internal schema changes during `v0`, create explicit migration functions instead of breaking old exports.

## References

- Product requirements: `DOMAIN_SPEC.md`
- `Character` schema: `DOMAIN_SPEC.md:88-163`
- Derived formulas: `DOMAIN_SPEC.md:318-409`
- Creation flow: `DOMAIN_SPEC.md:425-531`
- Invariants: `DOMAIN_SPEC.md:1241-1275`
- Known rule-data gaps: `DOMAIN_SPEC.md:1394-1405`
