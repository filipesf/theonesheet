# Design System

> Tokens, themes, typography, and component conventions.

## Themes

The MVP ships **two coexisting themes**:

- `parchment` (default) — current Tolkien-bookish look on a parchment background.
- `tor-dark` — dark mode inspired by The One Ring's bronze/moss/parchment palette on a dark base.

Theme is applied via `data-theme="<name>"` on `:root`. Tailwind v4 reads CSS custom properties directly via the `@theme` block. Switching themes is a CSS-variable swap, not a class toggle on every element.

## Color tokens (parchment theme — current)

Defined in `src/styles.css`:

| Token | Value | Use |
| --- | --- | --- |
| `--color-parchment` | `#f5efe0` | Page background |
| `--color-parchment-deep` | `#ede4cf` | Card / panel background |
| `--color-parchment-soft` | `#faf4e6` | Hover / inset surface |
| `--color-ink-navy` | `#1f2c5c` | Primary text, headings |
| `--color-ink-navy-soft` | `#3a4a82` | Secondary text |
| `--color-ink-red` | `#a33024` | Accent, callouts, dangerous actions |
| `--color-ink-red-soft` | `#c9685a` | Accent secondary |
| `--color-shell` | `#1a1410` | Top-nav "leather strap" surface (dark in both themes) |

## Color tokens (tor-dark theme — to implement)

Proposed (revise once palette is finalised in code):

| Token | Suggested value | Use |
| --- | --- | --- |
| `--color-parchment` | `#1a1612` | Page background (deep ink-on-paper inverted) |
| `--color-parchment-deep` | `#231d17` | Cards |
| `--color-parchment-soft` | `#2a231b` | Inset surfaces |
| `--color-ink-navy` | `#e9dcc0` | Primary text (warm parchment) |
| `--color-ink-navy-soft` | `#bca97f` | Secondary text |
| `--color-ink-red` | `#c98a3b` | Bronze accent |
| `--color-ink-red-soft` | `#7a8a5a` | Moss accent |
| `--color-shell` | `#0d0a07` | Top-nav, pushed darker than body so the band still reads as a separate surface |

The token names stay the same so consumer code does not branch on theme.

## Typography

| Token | Stack | Use |
| --- | --- | --- |
| `--font-display` | `Cinzel, "Trajan Pro", serif` | Section headings on the printed sheet |
| `--font-label` | `Cinzel, "Trajan Pro", serif` | Form labels, badge text |
| `--font-hand` | `Caveat, Kalam, "Patrick Hand", cursive` | Player-written content (e.g. backstory, name) |
| `--font-body` | `Cormorant Garamond, "EB Garamond", serif` | Body text, inputs |

Sizes follow Tailwind defaults (`text-xs` and up). For sub-12 px use only the four eyebrow/microlabel tokens below — never `text-[Npx]`.

### Sub-12 px scale

| Token | Value | Use |
| --- | --- | --- |
| `text-eyebrow` | 11 px | Primary eyebrows above section headings, top-nav links, primary buttons |
| `text-microlabel` | 10 px | Diamond labels, card actions, in-component labels |
| `text-microcaption` | 9 px | Sheet field labels, table headers, `<kbd>` keycaps |
| `text-microline` | 8 px | Attribute pills, dice face captions — the absolute floor |

Going below 8 px is a smell. If a label needs to fit smaller, the layout is wrong, not the type.

## Elevation

Shadows are tokens, not literal `shadow-[…]` strings. The five tokens cover the only legitimate places a shadow appears on this app:

| Token | Use |
| --- | --- |
| `shadow-card` | Hero card resting state in the library grid |
| `shadow-card-hover` | Hero card on hover (paired with `-translate-y-0.5`) |
| `shadow-sheet` | The printed character sheet on screen |
| `shadow-modal` | Dialogs and modals |
| `shadow-launcher` | Floating dice launcher |

The RGBA values are still literal in `styles.css` because shadows do not yet need to swap with the theme. When `tor-dark` polish lands, swap the token values per-theme — the consumers do not need to change.

## Spacing and radius

- Use Tailwind spacing scale (`gap-2`, `p-4`, etc.). Custom values (`gap-[7px]`) are a smell — escalate by changing tokens, not bypassing them.
- Border radius: rely on Tailwind tokens (`rounded`, `rounded-md`, `rounded-lg`). Sheet panels use `rounded-md`; pill badges use `rounded-full`.

## Print

The printed sheet (`/character/:id/sheet`) is the visual centerpiece and must remain pixel-faithful to the official TOR character sheet. Print rules live in `src/styles.css` under `@media print`. Rules:

- All non-sheet UI is hidden in print.
- Background colours are forced (`-webkit-print-color-adjust: exact`).
- The sheet fits on a single A4 page.
- Tests for the printed sheet should pass without flexbox-vs-grid layout shifts between screen and print.

## Components

- Component primitives: shadcn/ui pattern (copy-paste into the repo when needed). Do not install shadcn as a dependency.
- Icons: `lucide-react`.
- Drawers: `vaul` (used for the dice tray).
- Toasts: `sonner`.
- Forms: `react-hook-form` + `zod`.

When in doubt, lift the component into `src/app/ui/` (or wherever a shared primitive sits) only after the **third** duplication.

## Accessibility

- All interactive elements must be keyboard-reachable. Hash router transitions must not trap focus.
- Form labels via `<label htmlFor>`; never rely on placeholder as the sole label.
- Colour contrast must pass WCAG AA against the active theme.
- Focus-visible styles are mandatory (`:focus-visible`); avoid `outline: none` without a replacement.

## Motion

- Subtle transitions only. No skeuomorphic ink-drying effects on the sheet.
- The 3D dice (`@3d-dice/dice-box`) is the only place where motion is the feature; everywhere else, motion serves the action.
- Honour `prefers-reduced-motion`: bypass non-essential animations and dice physics when the user opts in.

## Print-vs-screen parity rule

If you change layout in the editor view, run the printed view immediately. If they drift, the editor follows the printed sheet, not the other way around — the printed sheet is the canonical visual spec.
