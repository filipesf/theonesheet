# Product

## Register

product

## Users

The One Sheet is built for a closed circle of TTRPG players, not a market.

- **Primary audience.** Players in the maintainer's tabletop group running *The One Ring 2e* (Free League / Devir). Adults, table-experienced, comfortable with sheet-driven RPGs at roughly the D&D Beyond level of fluency.
- **Context of use.** A second screen on a laptop or tablet during a live session, sitting beside dice and the printed rulebook. Outside sessions, occasional bursts to update XP, gear, or tweak the hero between adventures.
- **Job to be done.** Create a Player-hero respecting the system's invariants, keep the sheet honest during play (Endurance, Hope, Shadow, conditions), and print or share a sheet that looks at home next to the official Free League PDF.
- **Not the audience.** Newcomers being introduced to the system. The wizard guides; copy assumes the player has read or will read the rules. The app does not re-teach TOR 2e in tooltips.
- **Loremasters and players outside the maintainer's group are out of scope for v0.** Multi-user, GM controls, and remote sharing land in v1 and v2 (`docs/PLAN_v1.md`, `docs/PLAN_v2.md`).

## Product Purpose

The One Sheet is a local-first webapp for managing player-character sheets for *The One Ring 2nd Edition*. It is internal tooling for one tabletop group, with no commercial intent.

The app must:

1. Let the player fill in and edit a character sheet while respecting TOR 2e's rules and invariants (e.g. Load ≤ max Endurance; a Dwarf cannot equip a Great Bow; `derived` values are recomputed, never persisted).
2. Automatically compute every derived value on every read (Endurance, Hope, Parry, TNs, Load, Fellowship, conditions).
3. Validate dependencies and dependencies between fields, surfacing violations inline rather than swallowing them.
4. Print a sheet that is pixel-faithful to the official TOR 2e printed character sheet on a single A4 page.
5. Persist locally (`localStorage` in v0; hosted accounts in v1) without ever shipping a runtime LLM dependency.

Success looks like a player sitting down to a session and never reaching for the printed sheet because the screen is the sheet, ratios are honest, and the printed view is the canonical fallback when the laptop runs out of battery.

The canonical TOR 2e domain spec (data model, formulas, validation invariants, reference tables) is `docs/DOMAIN_SPEC.md`. PRODUCT.md is strategic / brand context; the two cover different ground. When they disagree on facts about the system, `DOMAIN_SPEC.md` wins; PRODUCT.md should be updated.

## Brand Personality

- **Three words.** Bookish · Crafted · Quiet.
- **Voice and tone.** Spare, declarative, faintly literary. No marketing energy, no exclamation marks, no emoji. Microcopy should feel set in type rather than shouted by an app.
- **Emotional goal.** Confidence and reverence. The player should feel they are tending a manuscript that belongs to their hero, not filling out a form. Calm at rest; legible at speed.
- **Positive references.** The official TOR 2e printed character sheet (canonical visual spec; `src/features/sheet/PrintedCharacterSheet.tsx` exists to honour it). D&D Beyond for organisation patterns. Shadowdarklings for scope and restraint. Free League's print design language broadly.

## Anti-references

These are the shapes the app must not take. They appear here so the visual spec (`DESIGN.md`) and every future review can carry the line.

- **Generic SaaS dashboard chrome.** Stripe-style gradients, neon CTAs, glassmorphism, blurred backdrops, the hero-metric template. The One Sheet is not a B2B tool dressed in a TTRPG skin.
- **Fantasy cosplay clichés.** Dragon-scale borders, faux-medieval drop caps, parchment textures used as wallpaper, Papyrus-style display faces, swirly cursive scripts. Anything that announces "I am a TTRPG tool" before the content does.
- **Bootstrap card grids.** Same-sized cards with icon + heading + text, repeated endlessly. Cards must earn their geometry; the library and the printed sheet do, generic feature grids do not.
- **Tooltip-as-rulebook.** The app is not a teaching system for TOR 2e. Inline rule explanations beyond what's needed to navigate the sheet are out of scope.
- **Marketing surface energy.** Hero sections, scroll-driven storytelling, customer logos, "powered by" footers. There is no marketing surface; this is internal tooling.

## Design Principles

1. **The printed sheet is the truth.** The printed `/character/:id/sheet`, modelled on the official Free League TOR 2e character sheet, is the canonical visual spec. Every screen-only flourish must survive the print test. When editor and print drift, the editor follows the printed sheet, not the other way around.
2. **Type is the design.** Reach for typography (size, weight, tracking, family, italic, case) before colour, before borders, before icons. Decoration is a last resort, not a default. The system has two families and no cursive face on purpose.
3. **Tokens, not values.** Colour, sub-12 px sizes, tracking, and shadow always go through the named tokens in `src/styles.css`. Ad-hoc `text-[10px]`, `tracking-[0.2em]`, `shadow-[…]`, or hex literals are smells; escalate by adding a token, not by bypassing the system.
4. **Calm beats clever.** No gradients, no glassmorphism, no skeuomorphic ink-drying effects. The 3D dice tray is the only place where motion is permitted to be theatrical; everywhere else, less.
5. **Local-first, lossless, offline-honest.** v0 lives entirely in the browser (`localStorage`), with import/export as the trust contract. The product never silently degrades when offline because there is no online to depend on. Cloud sync, accounts, and multi-device are deferred to v1 by design (`docs/PLAN_v1.md`).
6. **Derived values are always recomputed.** Storage holds source fields only. Endurance, Parry, Load, Hope, TNs, and conditions are recomputed on every read, import, and edit. This is an architecture rule that surfaces in design: cards display ratios that are correct by definition, never stale.

## Accessibility & Inclusion

- **WCAG AA contrast** against the active theme is non-negotiable. Both `parchment` (default) and `tor-dark` palettes must hold the line; the print stylesheet always forces the parchment palette so printed contrast is constant.
- **Keyboard reachability** for every interactive element. Hash router transitions must not trap focus. Modal focus traps restore focus to the trigger on close.
- **Visible focus** is mandatory: every interactive primitive ships a `:focus-visible` style; `outline: none` without a replacement is forbidden. The browser default outline remains the global safety net.
- **`prefers-reduced-motion` honoured beyond the global cap.** The dice tray disables 3D physics via `usePrefersReducedMotion` rather than relying on the universal `animation-duration: 0.01ms` rule alone. New animated features must add the same opt-in path.
- **Form labels via `<label htmlFor>`.** Placeholders are never the sole label.
- **Language.** UI ships in pt-BR only in v0 (no hardcoded strings; every label routes through `t('namespace.key')`). Comments and docs follow the project's en-GB precedent. The TOR 2e canonical labels remain English in code identifiers, with the pt-BR Devir terminology surfacing through i18n.
- **Out of scope without explicit confirmation:** screen-reader optimisation beyond standard semantic HTML, full mobile polish (deferred to v1), and assistive-tech testing budgets.
