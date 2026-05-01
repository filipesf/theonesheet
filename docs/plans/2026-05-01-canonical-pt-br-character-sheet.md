# Canonical pt-BR Terminology on the Character Sheet

> Author: planning agent (Claude Opus 4.7) — 2026-05-01
> Status: draft, awaiting human approval before implementation
> Scope: v0 (local-first); no schema migration; labels-only realignment with Devir's canonical pt-BR translation of *The One Ring 2e*

## Overview

The character sheet currently displays Portuguese labels that diverge from the official Brazilian translation of *The One Ring 2e* (Devir). Players who own the rulebook see "Espírito" on screen but read "Astúcia" in the book; "Vigor" on screen but "Resistência" in the book; "Vocação" on screen but "Chamado" in the book. The dissonance is small per-label but adds up to a sheet that *feels* like a fan translation rather than a faithful companion to the printed rules.

This plan re-aligns every visible label on the digital sheet with the canonical Devir terminology while leaving the underlying domain model untouched. Because internal IDs (`wits`, `parry`, `weary`, `awe`, `enhearten`, `scan`, `explore`, `riddle`, `lore`, `hunting`, `song`, `awareness`, `calling`, `shadow-path`, …) stay in English, no persisted file changes shape: characters saved before this work load identically afterwards. The only artefact that changes is `src/app/locales/pt-BR.json`, plus a small UI addition for the "Ferimento" descriptor field that is missing from the current sheet, and a sweep of test fixtures that compared against the old strings.

## Current State Analysis

### Where the divergence lives

`src/app/locales/pt-BR.json` is the single source of truth for every visible string in the app (Code Style §i18n: "every visible string goes through `t('namespace.key')`"). A spot-check against the canon (`docs/THE_ONE_RING_BASIC_RULES.md`) and the official PDF sheet shows the following live divergences:

| Surface | Current | Canon (Devir) | Locale path |
|---|---|---|---|
| 3rd attribute (full) | Espírito | Astúcia | `sheet.attribute.wits`, `sheet.aria.wits-rating` |
| 3rd attribute (short, card + wizard) | Esp | Ast | `card.attr.wts`, `creation.step.skills.category.wits` |
| Calling | Vocação | Chamado | `sheet.label.calling`, `creation.step.calling.choose-calling` |
| Calling step title | Vocação e Equipamento | Chamado e Equipamento | `creation.step.calling.title` |
| Shadow Path | Caminho da Sombra | Caminho das Sombras | `sheet.label.shadow-path` |
| Distinctive Features | Traços Marcantes / Traços marcantes | Características Notáveis / Características notáveis | `sheet.label.distinctive-features`, `creation.field.distinctive_features` |
| Attribute TN diamond sub-label | ND | NA | `sheet.label.tn`, `dice.tray.tn` |
| Endurance (derived & current) | Vigor / Vigor Atual | Resistência / Resistência Atual | `sheet.label.derived.endurance`, `sheet.label.current-endurance`, `sheet.aria.current-endurance`, `card.endurance` |
| Parry | Aparar | Bloqueio | `sheet.label.derived.parry`, `sheet.armour.label.parry` |
| Shadow Scars | Cicatriz | Cicatrizes de Sombra | `sheet.label.shadow-scars`, `sheet.aria.shadow-scars` |
| War-gear section | Armas e Equipamento | Equipamento de Guerra | `sheet.section.war-gear` |
| Sidebar pools | Sociedade / Aventura / Perícia | pontos de sociedade / pontos de aventura / pontos de perícia | `sheet.label.fellowship-score`, `sheet.label.adventure-points`, `sheet.label.skill-points` |
| Condition: Weary | Esgotado | Exausto | `sheet.condition.weary`, `dice.tray.weary` |
| Condition: Miserable | Miserável | Arrasado | `sheet.condition.miserable`, `dice.tray.miserable` |
| Skill: awe | Reverência | Fascínio | `ref.skills.awe` |
| Skill: awareness | Percepção | Vigilância | `ref.skills.awareness` |
| Skill: hunting | Caça | Caçada | `ref.skills.hunting` |
| Skill: song | Canto | Música | `ref.skills.song` |
| Skill: enhearten | Inspiração | Indução | `ref.skills.enhearten` |
| Skill: scan | Observar | Busca | `ref.skills.scan` |
| Skill: explore | Explorar | Exploração | `ref.skills.explore` |
| Skill: riddle | Enigmas | Enigma | `ref.skills.riddle` |
| Skill: lore | Saber | História | `ref.skills.lore` |
| Wizard review copy | "Vigor, Esperança e Aparar são recalculados" | "Resistência, Esperança e Bloqueio são recalculados" | `creation.step.review.body` |
| Wizard prowess copy | "Proeza reduz em 1 o ND do Atributo" | "Proeza reduz em 1 o NA do Atributo" | `creation.step.calling.prowess-attribute-body` |

### What is *not* divergent

Verified against canon and confirmed to keep their current values:

- Skills `athletics`, `craft`, `travel`, `insight`, `healing`, `courtesy`, `battle`, `persuade`, `stealth` — all match (`Atletismo`, `Ofício`, `Viagem`, `Discernimento`, `Cura`, `Cortesia`, `Batalha`, `Persuasão`, `Furtividade`).
- The condition `wounded` → `Ferido` matches canon (`docs/THE_ONE_RING_BASIC_RULES.md`, line 514: "FERIDO E FERIMENTOS").
- The Heart attribute label (`Coração`) and the Strength attribute label (`Força`) match.
- Every weapon, armour, helm, shield, virtue, reward, blessing, patron, and Standard of Living label is in scope of *some* canon table but **not in the brief for this plan** — see "What we're NOT doing".
- The proper noun **"Versos de Saber"** (virtue `rhymes-of-lore`), **"Espírito Indomável"** (cultural virtue `untameable-spirit`), and **"Saber de Eriador"** (cultural virtue `lore-of-eriador`) intentionally use the word *Espírito* / *Saber* even after the realignment: they are *names of game artefacts*, not generic uses of the attribute or skill noun. Cross-checked against canon — these are the established Devir names of those virtues.

### What the sheet is missing entirely

The official PDF sheet shows a free-text field labelled **Ferimento** (singular, lower in the sidebar than the three condition checkboxes) where the player records *which wound* the hero is currently suffering — pierced thigh, broken rib, etc. The canon (line 514) makes the distinction explicit: "Ferido" is the binary state; "um Ferimento" is the description. The current digital sheet has only the boolean `conditions.wounded` checkbox; there is no place to write *what* the wound is. `src/domain/types.ts` confirms the absence — `Character` has no `wound` or `wound_description` field.

### Where the divergent strings are read

Confirmed by inspection of `src/features/sheet/PrintedCharacterSheet.tsx`, `src/features/creation/`, and `src/features/dice/`:

- The `PrintedCharacterSheet` consumes everything via `t("sheet.…")` keys; no hardcoded pt-BR.
- The dice tray reads `dice.tray.weary`, `dice.tray.miserable`, `dice.tray.tn`.
- The library card reads `card.attr.wts`, `card.endurance`.
- The creation wizard reads `creation.step.…` keys, including the skill-category short label `creation.step.skills.category.wits`.
- The reference-data layer (`src/ref-data/`) only carries IDs, never display text — confirmed by reading `docs/ARCHITECTURE.md` §"Reference data conventions".

So a single edit to `pt-BR.json` propagates to every UI surface that today shows the divergent label.

### Capitalisation convention

The canon uses ALL-CAPS for attributes and skills inside headings (`**ASTÚCIA**`, `**FASCÍNIO**`). The current digital sheet stores Title Case in the locale (`"Astúcia"`, `"Fascínio"`) and applies `tracking-label uppercase` via Tailwind classes in components (see `SectionHeader` in `PrintedCharacterSheet.tsx`, line 1191: `class="… tracking-label uppercase text-ink-red"`). This is the right division of labour and matches `DESIGN.md` §"The Tracked-Uppercase Rule": **uppercase is a presentational decision, not a string decision**. We will continue to store labels in Title Case in `pt-BR.json` and let CSS uppercase them.

## Desired End State

After this plan ships:

- Every label visible on the editor, the printed sheet, the library card, the dice tray, and the creation wizard matches the Devir 2e translation.
- The sheet shows a free-text `Ferimento` field beneath the three condition checkboxes (matching the PDF layout), filled in only when `wounded` is checked.
- All test files that asserted against the old pt-BR strings still pass; new smoke tests assert at least three high-visibility canonical labels (`Astúcia`, `Resistência`, `Chamado`) so a future regression flips a red light.
- No persisted character is altered. A character file exported on `main` (pre-merge) imports cleanly post-merge with the new labels rendering on top of the unchanged source data.
- `pnpm tsc`, `pnpm lint`, `pnpm test`, and `pnpm build` all pass.

### Verification — the moment we know it's done

1. Open the library, load Belba Bolger, click "Editar". Every label on screen reads the canon term (Astúcia, Resistência, Chamado, Bloqueio, Característica Notável, NA, Caçada, Música, Indução, Busca, Exploração, Enigma, História, Fascínio, Vigilância, Caminho das Sombras, Equipamento de Guerra).
2. Tick the "Ferido" checkbox; the `Ferimento` text field becomes editable; type "Costela quebrada"; navigate away and back; the value is persisted (assuming Phase 2 lands the schema field) or at least preserved within the session (UI-only fallback).
3. Open the dice tray with a heroic state of `weary=true`; the eyebrow toggle reads `Exausto (1–3 viram 0)`. Same for `Arrasado (Olho = falha automática)`.
4. Walk through `#/character/new`. The wizard step is titled "Chamado e Equipamento"; the prowess body reads "Proeza reduz em 1 o NA do Atributo escolhido."; the review body mentions "Resistência, Esperança e Bloqueio".
5. Print preview the sheet (`/character/:id/sheet`). Section headers read `EQUIPAMENTO DE GUERRA`, `CONDIÇÕES`, etc. (uppercased by CSS, Title-Cased in the bundle).

## Key Discoveries

- **The locale file is the only meaningful source of pt-BR strings.** `grep -rE "Esgotado|Miser[áa]vel|Aparar|Vigor|Espírito|Vocação|Reverência|Percepção"` against `src/**/*.{ts,tsx}` returns zero hits outside the locale, two test files, and one comment in `PrintedCharacterSheet.tsx` (the docstring at line 931 — `"e.g. 'Vigor Atual'"`). Renaming is therefore mostly mechanical.
- **`Character` has no `wound` field.** Adding one is the cleanest path to persist a free-text wound description, and is justified by the canon's explicit separation of *Ferido* (state) from *Ferimento* (description). Per `docs/ARCHITECTURE.md` §"Schema versioning": *"Adding optional fields is **not** a breaking change; bumping the version is reserved for shape changes that break a v0 file."* So `wound?: string` is free.
- **Ref-data is unaffected.** `src/ref-data/` holds only IDs + mechanical numbers; it has no pt-BR text (`docs/ARCHITECTURE.md` §"Reference data conventions" rule 3).
- **`untameable-spirit`, `rhymes-of-lore`, `lore-of-eriador` keep their current pt-BR.** They are proper nouns (virtue/feature names) and Devir's translations of those names use *Espírito*, *Saber*, *Saber de Eriador* even though the *generic* skill `lore` translates as `História` and the attribute `wits` as `Astúcia`. This is the ordinary fate of names that contain a common-noun root; we leave them alone.
- **Capitalisation stays Title Case in the bundle.** The CSS does the uppercasing via `tracking-label uppercase`; mirroring the canon's headline-caps inside JSON would force the few non-uppercased reading positions (e.g. tooltip text) into ALL CAPS, breaking the typographic rules in `DESIGN.md`.
- **Equipment names diverge from canon too** (e.g. canon says `Cassetete`, locale says `Cacete`; canon says `Lança Longa`, locale says `Grande lança`; canon says `Briga` group, locale uses `Briga` already; canon says `Picareta` matches). These are deliberately **out of scope** of this plan — see below.

## What We're NOT Doing

- **Renaming any internal ID.** `wits`, `parry`, `weary`, `awe`, `awareness`, `hunting`, `song`, `enhearten`, `scan`, `explore`, `riddle`, `lore`, `calling`, `shadow-path`, `endurance`, `parry` all remain. Per the brief, IDs are stable.
- **Bumping `schemaVersion`.** Adding `wound?: string` (Phase 2) is purely additive; per `docs/ARCHITECTURE.md`, optional fields don't bump the version.
- **Migrating existing characters.** No persistence-time transformation runs; old data stays valid.
- **Changing app chrome.** Top-bar, IMPRIMIR button, ROLAR DADOS launcher, RETRATO panel are explicitly out of scope per the brief.
- **Equipment terminology sweep.** Weapons (`Cacete` vs canon's `Cassetete`, `Grande lança` vs `Lança Longa`, etc.), armour, helm, shield labels still diverge. Folding them in here would double the surface area without serving the brief; defer to a follow-up plan once this lands.
- **Fixing the wizard's calling-skill copy beyond the listed strings.** If a downstream step uses an unlisted skill label, it is automatically corrected by Phase 1 because labels are read from `ref.skills.*`. No further edits.
- **Reorganising the sheet leiaute** beyond the `Ferimento` field. The brief is explicit: cromo and ornamentation differences vs the PDF (vinhas, "O UM ANEL" header) stay.
- **Adding a `wound` migration**. The field defaults to `''` in the schema's blank-character helper and to `undefined` (read as `''`) on imported v0 files via the existing `domain/normalise.ts` defaulting pass. Pure additive.

## Implementation Approach

Three small, self-contained phases plus a test/copy sweep at the end. Each phase ships as one commit.

```
Phase 1  →  i18n realignment        (pt-BR.json)
Phase 2  →  Ferimento field         (UI + optional schema field)
Phase 3  →  Test + copy sweep       (existing fixtures, new smoke test)
```

We deliberately do **not** split Phase 1 by section. The whole locale change is one atomic edit so the diff is reviewable as "a single terminology pass" rather than a sequence of half-converted states.

## Phase 1 — Realign pt-BR labels with the Devir canon

### Overview

Single-file edit to `src/app/locales/pt-BR.json` applying every divergence listed in *Current State Analysis*. After this lands, the editor, library card, dice tray, and wizard already display canon terminology — without touching any TypeScript.

### Changes

**File:** `src/app/locales/pt-BR.json`

Apply the changes below. All paths are dot-notation against the JSON tree.

#### Attribute labels
- `card.attr.wts`: `"Esp"` → `"Ast"`
- `sheet.aria.wits-rating`: `"Pontuação de Espírito"` → `"Pontuação de Astúcia"`
- `sheet.attribute.wits`: `"Espírito"` → `"Astúcia"`
- `creation.step.skills.category.wits`: `"Esp"` → `"Ast"`

#### Identity
- `sheet.label.calling`: `"Vocação"` → `"Chamado"`
- `sheet.label.shadow-path`: `"Caminho da Sombra"` → `"Caminho das Sombras"`
- `sheet.label.distinctive-features`: `"Traços Marcantes"` → `"Características Notáveis"`
- `creation.field.distinctive_features`: `"Traços marcantes"` → `"Características notáveis"`
- `creation.step.calling.title`: `"Vocação e Equipamento"` → `"Chamado e Equipamento"`
- `creation.step.calling.choose-calling`: `"Vocação"` → `"Chamado"`

#### Diamonds and TN copy
- `sheet.label.tn`: `"ND"` → `"NA"`
- `dice.tray.tn`: `"ND"` → `"NA"`
- `dice.outcome.no-tn`: `"ND não definido"` → `"NA não definido"`
- `dice.result.tn`: `"ND {{tn}}"` → `"NA {{tn}}"`
- `creation.step.calling.prowess-attribute-body`: `"Proeza reduz em 1 o ND do Atributo escolhido."` → `"Proeza reduz em 1 o NA do Atributo escolhido."`

#### Endurance / Hope / Parry / Shadow Scars
- `sheet.label.derived.endurance`: `"Vigor"` → `"Resistência"`
- `sheet.label.derived.parry`: `"Aparar"` → `"Bloqueio"`
- `sheet.label.current-endurance`: `"Vigor Atual"` → `"Resistência Atual"`
- `sheet.aria.current-endurance`: `"Vigor atual"` → `"Resistência atual"`
- `sheet.label.shadow-scars`: `"Cicatriz"` → `"Cicatrizes de Sombra"`
- `sheet.aria.shadow-scars`: `"Cicatriz de Sombra"` → `"Cicatrizes de Sombra"`
- `sheet.armour.label.parry`: `"Aparar"` → `"Bloqueio"`
- `card.endurance`: `"Vigor"` → `"Resistência"`

#### Sidebar resource pools
- `sheet.label.fellowship-score`: `"Sociedade"` → `"Sociedade"` *(stays — single word matches canon top-level "Pontos de Sociedade" but the column header is just the noun. Confirmed by canon line 1656 "## PONTOS DE PERÍCIA" used as a heading; the diamond label remains the noun.)* **No change.**
- `sheet.label.adventure-points`: `"Aventura"` → `"Aventura"` **No change.**
- `sheet.label.skill-points`: `"Perícia"` → `"Perícia"` **No change.**

  > **Decision (made by planning agent, justify briefly):** the brief asked to expand these to `"pontos de aventura"`, etc. After re-reading the canon (lines 524, 1656, 1670), the *section headings* in the rulebook are "Pontos de Aventura", "Pontos de Perícia", "Pontos de Sociedade", but the *column / pool labels* on the official PDF sheet are just the single noun. Expanding the diamond sub-label to three words would break the typographic geometry (the diamond's inner span is sized for ~9 characters). Recommend: **leave the label single-noun**, and add a tooltip or eyebrow elsewhere. To revisit with the human reviewer; if they prefer the long form, the locale change is trivial but the layout in `PrintedCharacterSheet.tsx` may need a follow-up.

#### Conditions
- `sheet.condition.weary`: `"Esgotado"` → `"Exausto"`
- `sheet.condition.miserable`: `"Miserável"` → `"Arrasado"`
- `dice.tray.weary`: `"Esgotado (1–3 viram 0)"` → `"Exausto (1–3 viram 0)"`
- `dice.tray.miserable`: `"Miserável (Olho = falha automática)"` → `"Arrasado (Olho = falha automática)"`

#### War-gear
- `sheet.section.war-gear`: `"Armas e Equipamento"` → `"Equipamento de Guerra"`

#### Skills (the nine renames)
- `ref.skills.awe`: `"Reverência"` → `"Fascínio"`
- `ref.skills.awareness`: `"Percepção"` → `"Vigilância"`
- `ref.skills.hunting`: `"Caça"` → `"Caçada"`
- `ref.skills.song`: `"Canto"` → `"Música"`
- `ref.skills.enhearten`: `"Inspiração"` → `"Indução"`
- `ref.skills.scan`: `"Observar"` → `"Busca"`
- `ref.skills.explore`: `"Explorar"` → `"Exploração"`
- `ref.skills.riddle`: `"Enigmas"` → `"Enigma"`
- `ref.skills.lore`: `"Saber"` → `"História"`

#### Wizard review copy
- `creation.step.review.body`: `"Hora de assinar a ficha. Confira os dados — Vigor, Esperança e Aparar são recalculados ao finalizar."` → `"Hora de assinar a ficha. Confira os dados — Resistência, Esperança e Bloqueio são recalculados ao finalizar."`

### Automated verification

```bash
pnpm tsc       # nothing typed against label values, expect green
pnpm lint      # JSON-untouched ESLint, expect green
pnpm test      # several existing tests will fail — addressed in Phase 3
pnpm build     # expect green
```

> Note: Phase 1 alone is expected to fail `pnpm test` until Phase 3 lands, because two creation tests assert against the old labels (see Phase 3). Sequence: Phase 1 → Phase 3 (test sweep) → Phase 2 (Ferimento), or land them in a single PR ordered Phase 1 → Phase 2 → Phase 3. Recommendation: **single PR, three commits**.

### Manual verification

- [ ] Open `#/` (library), confirm `card.attr.wts` reads `Ast` and `card.endurance` reads `Resistência`.
- [ ] Open `#/character/<id>` (sheet editor), inspect every visible label against the canon table above.
- [ ] Open `#/character/<id>/sheet` (printed view), confirm section headers read `EQUIPAMENTO DE GUERRA` and `CONDIÇÕES`, condition rows read `EXAUSTO`, `ARRASADO`, `FERIDO`.
- [ ] Press `D` to open the dice tray, confirm checkbox labels read `Exausto …` / `Arrasado …` and TN label reads `NA`.
- [ ] Walk `#/character/new`, observe the calling step is titled *Chamado e Equipamento* and the review body reads *Resistência, Esperança e Bloqueio*.

---

## Phase 2 — Add the `Ferimento` (wound description) field

### Overview

Surface a free-text `Ferimento` field beneath the three condition checkboxes in the printed sheet, matching the PDF layout. Persist the value on the `Character` so it survives reload, export, and import.

### Decision: persist or UI-only?

**Recommendation: persist.** Rationale:
- The wound description is hero-state, not session-state. A wound persists between sessions; rolling up a tab and reopening it should not erase "broken rib".
- `docs/ARCHITECTURE.md` is explicit that adding optional fields does not bump the schema version.
- The cost is low: one optional field on one type, one default in `domain/normalise.ts` (or wherever default characters are seeded), one field in `domain/schema.ts`'s blank helper, and one input control on the sheet. No wizard surface needed (Phase 7 of the canonical creation pipeline does not ask for a wound — it is filled in only after a Piercing Blow).
- Export / import: the field travels inside the existing `Character` blob; the importer's zod schema needs the optional field added.

If the human reviewer prefers UI-only (state held in `useState` inside `ConditionsBlock`), the trade-off is that wounds vanish across reloads — likely acceptable for v0 but worse than persistence given the trivial cost.

### Changes

**File:** `src/domain/types.ts`
- Add `wound?: string` to `Character` (placed adjacent to `notes`, since both are free-text fields). Document with a one-line en-GB comment: `// short description of an active wound, e.g. "broken rib"; cleared when the wounded condition is removed.`

**File:** `src/domain/schema.ts` (the blank-character helper, currently around line 47/72)
- Add `wound: ''` next to `notes: ''`.

**File:** `src/domain/normalise.ts`
- If a normalisation pass exists for v0 character defaults, add `wound: character.wound ?? ''` so imported pre-feature files load with an empty string instead of `undefined`. (Verify by reading the file before editing — if it already does spread-with-defaults, this may be a no-op.)

**File:** `src/persistence/import-export.ts` (or wherever the import zod schema lives — confirm path during implementation)
- Add `wound: z.string().optional()` to the character schema.
- Old exports lacking the field still parse.

**File:** `src/features/sheet/PrintedCharacterSheet.tsx` (`ConditionsBlock`, lines 1120–1157)
- After the three `<ConditionCheck …>` rows, render a new labelled text input bound to `character.wound`. Disable / dim it when `character.conditions.wounded === false` so the field is visually inert when there is no wound to describe (matches the PDF: the line is empty when the box is unticked).
- Pseudocode:

```tsx
<label className="flex flex-col gap-1 mt-2 min-w-0">
  <span className="font-label text-microcaption tracking-label uppercase text-ink-red">
    {t('sheet.label.wound')}
  </span>
  <input
    type="text"
    value={character.wound ?? ''}
    onChange={(event) => update({ wound: event.target.value })}
    disabled={!character.conditions.wounded}
    placeholder={t('sheet.placeholder.wound')}
    aria-label={t('sheet.aria.wound')}
    className="… italic … placeholder:not-italic …"  // mirrors TextField styling
  />
</label>
```

  Use the established italic-equals-hand convention (`DESIGN.md`): the value is player-entered, so it renders italic; the placeholder is forced upright.

**File:** `src/app/locales/pt-BR.json`
- Add three new keys:
  - `sheet.label.wound`: `"Ferimento"`
  - `sheet.placeholder.wound`: `"Costela quebrada · gash no braço · …"`
  - `sheet.aria.wound`: `"Descrição do ferimento"`

### Automated verification

```bash
pnpm tsc       # required: catches missed call sites for the new optional field
pnpm lint      # green
pnpm test      # green (no test asserts on the new field yet)
pnpm build     # green
```

### Manual verification

- [ ] Open the sheet editor, untick all conditions; the `Ferimento` input is dimmed/disabled and empty.
- [ ] Tick `Ferido`; the input becomes editable; type "Costela quebrada"; reload the page; the value persists.
- [ ] Untick `Ferido`; the input is dimmed; the previously typed value remains stored (not auto-cleared) so re-ticking restores it. *(Decision: don't auto-clear; players may toggle the box temporarily.)*
- [ ] Export the character to JSON; the file contains `"wound": "Costela quebrada"`. Import it on a fresh browser profile; the value round-trips.
- [ ] Print preview: the `Ferimento` line renders below the three condition rows.

---

## Phase 3 — Test and comment sweep

### Overview

Update the two test files that assert against the old pt-BR strings; refresh the comment in `PrintedCharacterSheet.tsx` that mentions `"Vigor Atual"`; add a small smoke test that hard-codes three canon labels (`Astúcia`, `Resistência`, `Chamado`) so any future regression flips a red light.

### Changes

**File:** `src/features/creation/steps/__tests__/StepCalling.mastery.test.tsx`
- Lines 79, 109: `getByRole('button', { name: /Explorar/i })` → `getByRole('button', { name: /Exploração/i })`. (The `lore`/`scan`/etc. variants likely don't appear in the regex; confirm by reading the full test file during implementation.)

**File:** `src/features/creation/__tests__/draftToCharacter.test.ts`
- Line 72 comment: `"// heroes flagged Esgotado/Miserável on the editor."` → `"// heroes flagged Exausto/Arrasado on the editor."` (en-GB comment language but the tags inside refer to the rendered pt-BR labels, so they update with the canon.)

**File:** `src/features/creation/steps/__tests__/StepCulture.cultureSwitch.test.tsx`
- Sweep with grep for any of the renamed strings inside `getByText`, `getByRole`, regex literals, etc. Update each match. *(Read full file during implementation; current grep returned no hits, but inspect anyway.)*

**File:** `src/features/sheet/PrintedCharacterSheet.tsx`
- Line 931 comment: `"e.g. 'Vigor Atual'"` → `"e.g. 'Resistência Atual'"`.

**New file:** `src/app/__tests__/canon-labels.test.ts` *(or co-located with the locale; folder convention is `__tests__/` next to the file under test — `src/app/__tests__/`)*
- Three assertions against the imported `pt-BR.json`:
  1. `sheet.attribute.wits === 'Astúcia'`
  2. `sheet.label.derived.endurance === 'Resistência'`
  3. `sheet.label.calling === 'Chamado'`
- Rationale: the locale file is a JSON literal; grep would also catch this, but a vitest assertion makes the intent legible and runs in CI. Cheap insurance.

### Automated verification

```bash
pnpm test      # all green; new canon-labels test passes
pnpm tsc
pnpm lint
pnpm build
```

### Manual verification

- [ ] All four `pnpm` commands run clean.
- [ ] CI on the PR is green end-to-end (lint → typecheck → test → build → deploy preview).

---

## Testing Strategy

### Unit / component tests

- Existing `domain/__tests__/derived.test.ts` and `worked-example.test.ts` operate on numeric fields and English IDs — unaffected.
- Existing `creation/__tests__/draftToCharacter.test.ts` operates on field shapes — unaffected after the comment update.
- Existing `creation/steps/__tests__/StepCalling.mastery.test.tsx` reads pt-BR through the live i18n bundle — needs the regex update.
- New `app/__tests__/canon-labels.test.ts` pins three high-visibility strings.

### Manual QA checklist

Per the *Desired End State* §"Verification". Walk it before sign-off.

### Edge cases to verify

- A character imported from a pre-feature export (`wound` absent) loads cleanly with `wound === ''`.
- Toggling `wounded` off and on does not erase the typed `wound` description.
- Print preview lays out the `Ferimento` line without overflowing the sidebar.
- The dice tray's checkbox labels still wrap correctly at narrow widths after `Esgotado` (8 chars) → `Exausto` (7 chars) and `Miserável` (9 chars) → `Arrasado` (8 chars). Both shorter, so layout is safer.

## Performance Considerations

None. Label edits don't change render cost; one extra `<input>` in `ConditionsBlock` is negligible.

## Migration Notes

- **No `schemaVersion` bump.** The `wound` field is optional; pre-feature files load with the field absent and the UI defaults it to `''`.
- **Imported v0 files:** the existing import path (`persistence/import-export.ts`) needs the zod schema relaxed to allow `wound?: string`; old files without the key continue to parse.
- **No data backfill needed.** Belba Bolger's seed character (in `src/persistence/` or `src/ref-data/`, confirm during implementation) does not need a pre-filled wound — she ships unwounded.

## References

### Canon (the rulebook)

- `docs/THE_ONE_RING_BASIC_RULES.md` lines 261, 437, 443, 514, 524, 576, 648, 824, 1204, 1230, 1377, 1395–1410, 1656, 1670, 1768, 1780, 2017, 2141, 2143, 2149, 2187, 2289, 4657 — every divergence in the table above is anchored to one of these line ranges.

### Project canon

- `AGENTS.md` §3 (mandatory conventions: pt-BR only, zero hardcoded strings, all via `t()`).
- `docs/ARCHITECTURE.md` §"Reference data conventions" rule 3 (display names live in i18n, not in `ref-data/`); §"Schema versioning" (optional fields don't bump version).
- `docs/CODE_STYLE.md` §i18n.
- `DESIGN.md` §"The Italic-Equals-Hand Rule" (`Ferimento` value is italic; placeholder is upright).
- `DESIGN.md` §"The Tracked-Uppercase Rule" (capitalisation lives in CSS, not in the bundle).

### Files touched

- `src/app/locales/pt-BR.json` — Phase 1 (the bulk) and Phase 2 (three new keys).
- `src/domain/types.ts` — Phase 2 (`wound?: string`).
- `src/domain/schema.ts` — Phase 2 (default `wound: ''`).
- `src/domain/normalise.ts` — Phase 2 (defensive default — verify if needed).
- `src/persistence/import-export.ts` — Phase 2 (zod schema relaxation).
- `src/features/sheet/PrintedCharacterSheet.tsx` — Phase 2 (input control) and Phase 3 (comment).
- `src/features/creation/__tests__/draftToCharacter.test.ts` — Phase 3 (comment).
- `src/features/creation/steps/__tests__/StepCalling.mastery.test.tsx` — Phase 3 (regex).
- `src/features/creation/steps/__tests__/StepCulture.cultureSwitch.test.tsx` — Phase 3 (sweep, possibly no-op).
- `src/app/__tests__/canon-labels.test.ts` — Phase 3 (new file).

### Out of scope, captured for follow-up

- Equipment terminology pass (weapons, armour, helms, shields).
- Sidebar resource-pool label expansion (`Aventura` → `Pontos de Aventura`) if the human reviewer prefers the long form despite the layout cost.
- Re-checking virtue / blessing names (`untameable-spirit`, `lore-of-eriador`) against current Devir errata.
- Sheet-level reorganisation to mirror the PDF more tightly (vinhas, "O UM ANEL" header, condition layout). Brief explicitly excludes.
