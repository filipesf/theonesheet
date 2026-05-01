---
name: The One Sheet
description: A local-first manuscript-on-parchment character sheet for The One Ring 2e.
colors:
  parchment: "#f5efe0"
  parchment-deep: "#ede4cf"
  parchment-soft: "#faf4e6"
  ink-navy: "#1f2c5c"
  ink-navy-soft: "#3a4a82"
  ink-red: "#a33024"
  ink-red-soft: "#c9685a"
  shell: "#1a1410"
typography:
  display:
    fontFamily: "Cormorant SC, Cormorant Garamond, serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0.06em"
  label:
    fontFamily: "Cormorant SC, Cormorant Garamond, serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0.2em"
  body:
    fontFamily: "Crimson Pro, Crimson Text, EB Garamond, serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  eyebrow:
    fontFamily: "Cormorant SC, Cormorant Garamond, serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.28em"
  microlabel:
    fontFamily: "Cormorant SC, Cormorant Garamond, serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.2em"
  microcaption:
    fontFamily: "Cormorant SC, Cormorant Garamond, serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.2em"
  microline:
    fontFamily: "Cormorant SC, Cormorant Garamond, serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.2em"
rounded:
  none: "0px"
  sm: "2px"
  md: "6px"
  full: "9999px"
spacing:
  hairline: "1.5px"
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink-red}"
    textColor: "{colors.parchment-soft}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.none}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.ink-red-soft}"
    textColor: "{colors.parchment-soft}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-red}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.none}"
    padding: "10px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.ink-red}"
    textColor: "{colors.parchment-soft}"
  selection-card:
    backgroundColor: "{colors.parchment-soft}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.none}"
    padding: "16px"
  selection-card-active:
    backgroundColor: "{colors.parchment-soft}"
    textColor: "{colors.ink-navy}"
  modal-shell:
    backgroundColor: "{colors.parchment-soft}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.none}"
    padding: "20px"
  character-card:
    backgroundColor: "{colors.parchment-soft}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.none}"
    padding: "20px"
  diamond-attribute:
    backgroundColor: "transparent"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.none}"
    size: "60px"
  top-nav:
    backgroundColor: "{colors.shell}"
    textColor: "{colors.parchment-soft}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.none}"
    height: "56px"
---

# Design System: The One Sheet

## 1. Overview

**Creative North Star: "The Hero's Manuscript"**

The One Sheet is not a SaaS app pretending to be a TTRPG tool; it is a manuscript that the player tends on behalf of a hero. The interface should feel hand-set rather than rendered: warm cream paper, ink-navy body text, an ink-red rubricator's accent used sparingly, and uppercase small-caps labels stretched across generous letter-spacing the way a typesetter would space a chapter heading. The 3D dice tray is the only place where the app permits theatre; everywhere else, the design steps back so the type, the numbers, and the hero do the talking.

The aesthetic deliberately rejects the marketing chrome of contemporary product UI — gradients, glassmorphism, stripe-style dashboards, neon CTAs — and equally rejects fantasy cosplay: dragon-scale borders, faux-medieval drop caps, parchment textures used as wallpaper. The printed sheet, modelled on the official Free League TOR 2e character sheet, is the canonical visual spec; when the editor and the printed view drift, the editor is wrong.

**Key Characteristics:**

- Manuscript-on-parchment temperament: warm cream surfaces, ink-navy text, a single rubricator's red.
- Type does the work: hierarchy from family, weight, size, tracking, italic, and case — never gradients or icons.
- Italic is reserved for player-entered fields, so the hero's own words read as a manuscript entry.
- Two coexisting themes via `:root[data-theme]` (`parchment`, `tor-dark`) with stable token names; print always forces parchment.
- Diamonds are the system's signature primitive — rotated squares carry attribute values, brand mark, and microcaptions.
- Five named shadow tokens; all other elevation is forbidden.
- Motion is restrained outside the dice tray and bows out under `prefers-reduced-motion`.

## 2. Colors

A two-axis palette: warm parchment surfaces and ink-navy text, with one disciplined accent (ink-red) acting as the rubricator's mark. The `tor-dark` theme inverts the surface/text axis and shifts the accent toward bronze and moss while keeping token names stable, so consumers never branch on theme.

### Primary
- **Ink Red** (`#a33024`, parchment) / **Bronze** (`#c98a3b`, tor-dark): the rubricator's accent. Chapter borders, primary buttons, focus rings, brand mark fill, the 2 px underline on the active nav link, and any "tend the hero" affordance (delete, dangerous, primary action). It must remain rare — the rubric only marks the load-bearing words on a page.
- **Ink Red Soft** (`#c9685a`, parchment) / **Moss** (`#7a8a5a`, tor-dark): hover states for the primary accent, secondary accents, and the tor-dark sidekick to bronze.

### Neutral
- **Parchment** (`#f5efe0`, parchment) / **Ink-Black** (`#1a1612`, tor-dark): the page itself. Body background.
- **Parchment Deep** (`#ede4cf` / `#231d17`): cards and panels — the page-within-a-page.
- **Parchment Soft** (`#faf4e6` / `#2a231b`): hover surfaces, modal interior, inset rests.
- **Ink Navy** (`#1f2c5c` / `#e9dcc0` warm parchment in tor-dark): primary text, headings, all numeric content. The body voice.
- **Ink Navy Soft** (`#3a4a82` / `#bca97f`): secondary text, captions, less-loaded labels.
- **Shell** (`#1a1410` / `#0d0a07`): the leather-strap top-nav band. Always darker than the body so it reads as a contrasting band even under tor-dark.

### Named Rules

**The Rubricator's Rule.** Ink-red is the only chromatic accent in the parchment theme, and it must remain rare. Never apply it to broad surfaces, gradients, or decorative fills; reserve it for the load-bearing words on a page — primary action, active nav, accent borders, focus rings, and the rare illuminated initial. If the eye finds red dominating a screen, the screen is wrong.

**The Stable-Token Rule.** Token names do not branch on theme. Components reference `--color-ink-navy` regardless of whether the active palette renders it as `#1f2c5c` or warm parchment. Never write `data-theme === 'tor-dark' ? … : …` in component code.

**The Print-Wins Rule.** The print stylesheet always forces the parchment palette. Any token swap that would change the printed sheet's appearance is rejected by definition.

## 3. Typography

**Display Font:** Cormorant SC (with Cormorant Garamond fallback)
**Body Font:** Crimson Pro (with Crimson Text, EB Garamond fallback)
**Label Font:** Cormorant SC — same family as display; the small-cap height makes uppercase labels read as set-in-type rather than shouted.

**Character:** A two-family system with no cursive face. Cormorant SC delivers uniform small-cap height for every uppercase label, eyebrow, and section heading. Crimson Pro is a variable-weight book serif (close in temperament to Beaufort Pro) carrying body, inputs, and all numeric content; its italic cut is a true italic, not a slanted Roman, so player-entered fields read as a manuscript entry rather than a form value. Cursive faces are intentionally absent: hierarchy comes from family, weight, size, tracking, italic, and case — not from a script.

### Hierarchy

- **Display** (Cormorant SC, weight 600–700, `clamp(2.25rem, 4vw, 2.75rem)`, line-height 1): hero attribute clusters, chapter titles. Tracked at `tracking-display` (0.06em).
- **Headline** (Cormorant SC, 600, `text-xl` 20px / `text-2xl` 24px, line-height 1.1): modal titles, sheet section headings. Tracked at `tracking-label` (0.2em) when uppercased.
- **Body** (Crimson Pro, 500, 16px, line-height 1.5): default body, input text, help text. Cap line length at 65–75ch where prose flows.
- **Body Italic** (Crimson Pro Italic, 600, `text-3xl` 30px in the library card): the hero's name and any player-entered field — manuscript voice.
- **Numeric** (Crimson Pro, 600, `tabular-nums`): every numeric value, current/max ratios, dice values. Always `font-semibold` so digits read as authoritative tokens against surrounding prose.
- **Eyebrow** (Cormorant SC, 600, 13px, line-height 1): primary eyebrows above sections, top-nav links, primary buttons. Tracked at `tracking-eyebrow` (0.28em).
- **Microlabel** (Cormorant SC, 600, 12px): diamond labels, card actions. Tracked at `tracking-label` (0.2em).
- **Microcaption** (Cormorant SC, 600, 11px): sheet field labels, table headers, `<kbd>` keycaps. Tracked at `tracking-label`.
- **Microline** (Cormorant SC, 600, 10px): attribute pills, dice face captions. The absolute floor.

### Named Rules

**The Italic-Equals-Hand Rule.** Italic is reserved for player-entered content — name, blessing, distinctive features, rewards, virtues, gear, weapon and armour names. Pair with `placeholder:not-italic` so empty inputs render their hint upright. Never italicise system labels, headings, or static content; the italic is what makes a player's words read like manuscript ink.

**The Ten-Pixel Floor Rule.** Sub-12px text only via the four tokens (`text-eyebrow` 13px, `text-microlabel` 12px, `text-microcaption` 11px, `text-microline` 10px). Below 10 px is forbidden. Cormorant SC reads thin under 10 px regardless of weight; if a label needs to fit smaller, the layout is wrong, not the type.

**The Tracked-Uppercase Rule.** Uppercase labels are always tracked through one of the four `tracking-*` tokens (display 0.06em, section 0.12em, label 0.2em, eyebrow 0.28em). Ad-hoc `tracking-[Nem]` values are a smell; escalate by adding a token.

**The Tabular-Numerics Rule.** Every digit on the sheet uses `tabular-nums` and `font-semibold` so columns of values, current/max ratios, and rolled totals align without jitter as content changes.

## 4. Elevation

Surfaces are flat by default. Five named shadow tokens cover every legitimate occurrence of depth in the app; ad-hoc `shadow-[…]` strings are forbidden. The vocabulary is two-layer: a thin warm ink-red lift sits directly under cards, and a deeper navy-tinted spread provides the page-on-page glow. Both colours derive from the active palette, so the elevation feels native to parchment rather than a generic drop shadow.

### Shadow Vocabulary

- **shadow-card** (`0 1px 0 rgba(163, 48, 36, 0.15), 0 8px 24px -12px rgba(31, 44, 92, 0.25)`): the library hero card at rest. The hairline ink-red sits flush under the card; the navy spread is the page-glow.
- **shadow-card-hover** (`0 2px 0 rgba(163, 48, 36, 0.2), 0 12px 32px -12px rgba(31, 44, 92, 0.35)`): paired with `-translate-y-0.5` on hover. The card lifts and the rubric thickens.
- **shadow-sheet** (`0 2px 24px -12px rgba(31, 44, 92, 0.4)`): the printed character sheet on screen. A single soft halo, no rubric line — the sheet is paper, not a panel.
- **shadow-modal** (`0 8px 40px -12px rgba(31, 44, 92, 0.55)`): dialogs and modals. The deepest spread; the modal is the only surface that owes the page a sense of weight above it.
- **shadow-launcher** (`0 8px 24px -8px rgba(31, 44, 92, 0.5)`): the floating dice launcher. Lifted but compact.

### Named Rules

**The Five-Shadow Rule.** Only the five tokens above carry elevation. `shadow-lg`, `shadow-xl`, ad-hoc literals, neumorphic insets, and any inner shadow are forbidden. If a new surface seems to need a sixth shadow, the surface is probably wrong — push it to a card, a modal, or no shadow at all.

**The Flat-By-Default Rule.** Sections, fields, lists, and the printed sheet itself are flat. Hover lift is reserved for interactive cards (library, selection); state changes elsewhere are colour or border, not depth.

## 5. Components

For each component, lead with how it should feel, then specify the structural tokens. Cards are not the lazy answer here — the library card and the printed sheet are *the product*, and they earn their geometry.

### Buttons (Primary / Ghost / Destructive)

- **Character:** uppercase Cormorant SC at `text-eyebrow` (13 px), tracked `0.2em`, with a 10 × 16 padding ratio. They read as engraved labels, not pill CTAs.
- **Shape:** square corners (`rounded-none`). Pills and rounded rectangles are forbidden — buttons are letterforms set into a coloured panel, not capsules.
- **Primary:** `bg-ink-red text-parchment-soft`. Hover swaps to `bg-ink-red-soft`; active darkens via `bg-ink-red/90`.
- **Ghost:** transparent with a `border-ink-red/60` 1 px stroke and `text-ink-red`. Hover fills with a translucent `bg-ink-red/10`.
- **Destructive:** identical to primary visually; the dialog context (and the destructive variant of `Modal`) carry the danger.
- **Focus:** `focus-visible:ring-2 focus-visible:ring-ink-red focus-visible:ring-offset-2` on a parchment-soft offset. Never `outline: none` without a replacement.

### Cards (Library Character Card)

- **Character:** the library card *is* a manuscript chapter heading — culture eyebrow, italic name, three diamond attribute pills, current/max ratios, four action lozenges along the bottom, and a delete strip at the foot.
- **Corner Style:** square (`rounded-none`).
- **Background:** `bg-parchment-soft`.
- **Border:** double-stroke. Outer `border-2` in `border-ink-red` (active) or `border-ink-red/50` (idle); inner offset `border` in `border-ink-red/40` with a `m-1.5` gutter — the rubric frame inside the panel frame.
- **Shadow Strategy:** `shadow-card` at rest, `shadow-card-hover` on hover paired with `hover:-translate-y-0.5`. No other movement.
- **Internal Padding:** `px-5 pt-5 pb-4` for the head; action row uses a 4-column grid with `border-t border-ink-red/30` separators.

### Selection Card

- **Character:** the wizard's "pick one of these" affordance — culture, calling, attribute set, distinctive features, theme.
- **Style:** `bg-parchment-soft/40` idle, `bg-parchment-soft` active. `border-2`: `border-ink-red/40` idle, `border-ink-red` active. Hover bumps the idle border to `border-ink-red/70`. Padding is two tokens: `p-3` (`sm`) or `p-4` (`md`).
- **State:** uses `aria-pressed` rather than radio semantics; focus ring `ring-ink-red ring-offset-parchment`.

### Modal

- **Character:** a chapter-page on top of the page. Primary heading is uppercase Cormorant SC in ink-red, tracked `tracking-label`, sized `text-xl`. Description is body Crimson Pro at 80% navy.
- **Style:** double-stroke just like cards — outer `border-2 border-ink-red/60` (or `border-ink-red` for the destructive variant), inner offset `border border-ink-red/40` with a `m-1.5` gutter. Background `bg-parchment-soft`.
- **Shadow:** `shadow-modal`.
- **Behaviour:** focus trap, scroll-lock, Escape to close, restore focus to the trigger on close. `initialFocusRef` is supported so destructive confirms can put focus on the destructive primary action — Enter then commits the choice the user came for.
- **Backdrop:** `bg-ink-navy/40`, blocks pointer events on the page beneath. No blur — glassmorphism is forbidden.

### Inputs / Fields

- **Style:** `font: inherit` reset (so utility classes like `italic`, `font-semibold`, and `tabular-nums` win). Background follows the surrounding surface (`bg-parchment-soft` on cards, `bg-parchment` inline). Borders are 1 px `border-ink-red/40` ish unless the field is part of a card frame, in which case the card frame *is* the field's border.
- **Placeholder:** muted via `color-mix(in srgb, var(--color-ink-navy) 35%, transparent)` and forced upright (`placeholder:not-italic`) so empty inputs hold their hint without leaking the manuscript italic.
- **Focus:** `focus-visible:ring-2 focus-visible:ring-ink-red`. Never strip outline globally.
- **Numerics:** every numeric input uses `tabular-nums font-semibold`.

### Navigation (Top Nav — the leather strap)

- **Style:** a single sticky 56 px band, `bg-shell text-parchment-soft`, with `border-b border-ink-red/40`. The band stays dark in both themes — it is not paper, it is the leather strap that holds the manuscript closed.
- **Brand mark:** a 24 × 24 ink-red diamond on the dark shell, with an inner 12 × 12 filled diamond — the rubric in miniature.
- **Links:** `font-label text-eyebrow tracking-label uppercase`. Active link adds a 2 px ink-red underline (`absolute left-3 right-3 -bottom-px h-[2px] bg-ink-red`); idle is `text-parchment-soft/70`.
- **Primary CTA:** ink-red panel button, same letterform as the rest.
- **Theme toggle:** a 16 × 16 diamond outline that fills when tor-dark is active — even chrome restates the signature primitive.

### Diamond (signature primitive)

- **Character:** the diamond is the visual signature of the system — the rubric mark, the attribute pill, the brand. A 45deg-rotated square with a 2 px ink-red border around an upright label or numeric.
- **Sizes:** four tokens — `xs` 28 px, `sm` 40 px, `md` 60 px, `lg` 104 px (`--size-diamond-{xs,sm,md,lg}`). The `lg` size is the attribute TN cluster.
- **Geometry:** the vertex of a 45deg-rotated square sits at half the box width past the centre, so visual gap between two diamonds = CSS gap minus `(size · (√2 − 1) / 2)`. Three vertex tokens express the *visual* gap directly: `--diamond-gap-vertex-tight` 8 px, `--diamond-gap-vertex-cosy` 16 px, `--diamond-gap-vertex-airy` 24 px. Use these instead of raw `gap-*` when placing labels next to or around a rotated diamond.
- **Value:** the value sits in an upright inner span with `font-body font-semibold tabular-nums text-ink-navy`. The sized typography (`text-diamond-lg`, `text-2xl`, `text-base`, `text-sm`) is keyed off the diamond size token.
- **Filled variant:** swap the border for a solid `bg-ink-red`; used on the brand mark and the active theme-toggle, never on data values.

## 6. Do's and Don'ts

### Do

- **Do** treat the printed `/character/:id/sheet` as the canonical visual spec. If the editor and the printed view diverge, the editor follows the printed sheet — never the other way around.
- **Do** reach for typography (size, weight, tracking, family, italic, case) before colour, border, or icon.
- **Do** use the named tokens for colour, sub-12 px sizes, tracking, and shadow (`tracking-eyebrow`, `text-microlabel`, `shadow-card`, etc.). Adding a token is the way to escalate; bypassing the system is not.
- **Do** italicise player-entered content (name, blessings, distinctive features, rewards, virtues, gear, weapon and armour names) and pair the input with `placeholder:not-italic`.
- **Do** apply `tabular-nums` and `font-semibold` to every digit on the sheet so columns of numbers stay aligned as content changes.
- **Do** keep token names stable across themes (`--color-ink-red` is ink-red in parchment and bronze in tor-dark). Component code never branches on theme.
- **Do** honour `prefers-reduced-motion` beyond the global safety net — the dice tray disables physics via `usePrefersReducedMotion` rather than relying on the CSS cap alone.
- **Do** use the `Diamond` primitive when you need a mark that *means* "attribute" or "the One Sheet brand" — the brand mark, the attribute TN cluster, the theme toggle, the empty-state ornament.

### Don't

- **Don't** use generic SaaS dashboard chrome — Stripe-style gradients, neon CTAs, glassmorphism, blurred surfaces. They are explicit anti-references in PRODUCT context (`AGENTS.md §12`).
- **Don't** dress the app in fantasy clichés — dragon-scale borders, faux-medieval drop caps, parchment textures used as wallpaper. The sheet must read as set-in-type, not cosplay.
- **Don't** introduce a cursive face. Hierarchy comes from family, weight, tracking, italic, and case — not from a script.
- **Don't** use `border-left` or `border-right` greater than 1 px as a coloured stripe accent on cards, list items, callouts, or alerts. Use the double-stroke frame, the rubric ink-red, or no border at all.
- **Don't** apply gradients to text (`background-clip: text` + gradient is forbidden) or to broad surfaces. Solid colours and tinted neutrals only.
- **Don't** write ad-hoc `shadow-[…]`, `tracking-[Nem]`, `text-[Npx]`, or hex literals in component code. Escalate by adding a token in `src/styles.css`, not by bypassing the system.
- **Don't** persist any `derived` value (Endurance, Parry, Load, Hope, TNs, conditions). Storage holds source fields only; recompute on every read. This is an architecture rule that affects design — derived ratings displayed on cards are computed at render time.
- **Don't** hardcode UI strings. Every label, button, eyebrow, and tooltip routes through `t('namespace.key')` — even on a single-bundle pt-BR app today.
- **Don't** ship `console.*` calls except `console.error`.
- **Don't** drop below the 10 px type floor. If a label needs to fit smaller, the layout is wrong.
- **Don't** use a modal as the first thought. Exhaust inline / progressive alternatives before reaching for `Modal`.
