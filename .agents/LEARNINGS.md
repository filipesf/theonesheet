# Learnings — The One Sheet

> Bite-sized, dated insights worth carrying into the next session. Write via `/save` (Phase 5). Process into permanent docs/skills/commands via `/learn`.

## Format

- One bullet per learning, terse and direct.
- Group under a `## YYYY-MM-DD` heading. Append to today's heading if it already exists.
- Avoid duplicates. Avoid generic advice ("always proofread"). Capture only what is specific and actionable.
- Good targets: domain-spec quirks (TOR 2e errata, Devir pt-BR canon), tooling gotchas (zod, vite, vitest, pnpm, GH Pages), architectural decisions made under pressure, conventions clarified mid-session.
- Skip filler. If a session produced no real learning, leave the date heading off.

## 2026-05-01

- `.agents/LEARNINGS.md` lives at the root of `.agents/`, not in a sub-folder — matches the blueprint's anti-pattern against single-file subdirs.
- `/save` is the only commit/push entrypoint; raw `git commit && git push` is forbidden so the quality gates (`pnpm lint && tsc && test`) and `/audit` always run first.
- New skills created via `/learn` must be hand-authored mirroring `the-one-sheet/SKILL.md` — the global `skill-creator` skill is not available at repo scope.

## 2026-05-02

- `docs/DOMAIN_SPEC.md` was originally generated against a Free League PDF; the canonical source-of-record is now `docs/THE_ONE_RING_BASIC_RULES.md` (Devir pt-BR markdown). Any PDF page reference (`p. 32`, `p. 52`, `pp. 81–89`) must rebind to a section anchor (`§"NAME"` ~line N). When `DOMAIN_SPEC` and `BASIC_RULES` disagree, `BASIC_RULES` wins.
- Treat any "verify against PDF" disclaimer in `DOMAIN_SPEC` as actively suspect, not a TODO. Bardeses + Hobbits attribute tables (§6.2 rows 1–3) had factual errors hidden behind those notes since the spec was first drafted.
- Editing `DOMAIN_SPEC.md` triggers a markdown auto-formatter (table column reflow + `*italic*` → `_italic_`) — a 12-edit session can produce a 700+ line diff. Don't panic; inspect substantive hunks only.
- Multi-eixo spec audit pattern that scaled: dispatch 6 `general-purpose` agents in parallel (each scoped to one mechanical area with precise `BASIC_RULES` line ranges in the prompt) + 1 `Explore` for the `src/` snapshot, all returning structured `Tema — fonte — spec — status — impacto` bullets. Fits under one main-context window.
- Hardiness, Confidence, Nimbleness, Prowess, Dour-Handed, Mastery are **Virtues**, never Rewards. The earlier `DOMAIN_SPEC` draft listed them under §3.6 `Reward.name` — when in doubt about TOR 2e content, basic-rules §"VIRTUDES" / §"RECOMPENSAS" is authoritative.
- The Devir PDF→markdown extraction silently drops every dice/rank icon. Telltale signs in `docs/THE_ONE_RING_BASIC_RULES.md`: empty first column in d12 / rank tables; consecutive prose tokens `de…a…para` separated by double spaces; markdown header rows that should be data rows. Sweep with `awk` over `^\|` lines plus `grep -nE "(de|para|a) {2,}"` whenever the source is re-extracted.
- The Devir PDF orients d12 tables semantically per content, not by a single convention: **encounter** tables put Runa de Gandalf at top (auspicious) and Olho de Sauron at bottom (sinister); **creature / damage / journey-event** tables flip it (Olho top = worst-for-player). Pair Olho/Runa to the row content, not to position.
- Three is Company adds **+1 fixed** to the Company's max Fellowship — never `+1 per hobbit`. Bree-Blood is the per-hero blessing, not Three is Company.
- The canonical Patron list is exactly 6: Balin, Bilbo, Círdan, Gandalf, Gilraen, Tom-and-Goldberry (combined entry). Beorn / Bard / Dáin / Thranduil / Radagast in the current `src/ref-data/patrons.ts` are non-canonical and slated for relocation in Phase 3.
- Bilbo's "Find Patron" effect is an **ephemeral modifier** (+1 Fellowship until next Fellowship Phase). Anti-pattern: folding it into `max_fellowship`. The canonical home is `Company.temporary_modifiers[]`, cleared at the start of each Fellowship Phase. Same applies to Strengthen Fellowship and Ponder Marked Maps.
- Blessings and Virtues live in **independent id namespaces** (resolved via `legacyNameToBlessingId` vs `legacyNameToVirtueId`). The same kebab id can coexist between the two without colliding — e.g. Bardings `stout-hearted` (Blessing) is unrelated to the pre-Phase-3 Bree `stout-hearted` (Virtue). Renames inside one namespace don't need to coordinate with the other.
- `as const` literal arrays narrow optional fields per entry: a union member without `restrictionMin` simply doesn't expose the property, so `entry.restrictionMin` fails type-check. Access with `'restrictionMin' in entry ? entry.restrictionMin : undefined` rather than widening the entry type.
- zod `optional().default('')` resolves the inferred TS type to `string | undefined`, which silently breaks `keyof CreationDraft` consumers (`STEP_FIELDS`, react-hook-form resolvers). For "required-with-empty-default" fields use a plain union — `z.union([z.enum([...]), z.literal('')])` — and seed the empty string in `DEFAULT_VALUES`.
- The canonical 24 Distinctive Features (DOMAIN_SPEC §6.6) collapse the previous per-culture i18n tree into a flat `ref.distinctiveFeatures.canonical.<id>` map. Pre-Phase-3 ids that vanish (grim, robust, curious, eloquent, mirthful, cheerful, hospitable, bluff, cautious, honest, steadfast, stout, trusty, just, vigilant, wise) need a deprecation map back to nearest canonical so persisted v0 sheets keep rendering.
- The TOR 2e v0 Previous-Experience picker is essentially the existing `ExperienceMeter` (StepSkills/StepProficiencies). Adding a dedicated ladder-cost picker UI (Phase 3.11 sub-step 8c) is over-engineering for v0; surface ladder costs only if user feedback demands it.
- Phase 2.9's "`protected: bool`" reads like a persisted boolean but is in fact a derived flag. The architecture rule (derived never persists) wins: persist `gear.rewards_applied: Reward[]`, compute `isProtected = rewards.length > 0` only in the renderer.
- `character.rewards` and `weapon.rewards_applied` intentionally duplicate. BR:2470 keeps the character-level list (sidebar summary); BR:2472 binds the Reward to a specific inalienable item. Both are canonical — don't collapse them.
- The cross-step refine in `refineVirtueSelection` is the canonical home for "field A must be consistent with field B from another step". Despite the name, it already gates `underlined_skill_pick`, `calling_favoured_skills`, and now `starting_reward_target ∈ weapons`. Co-locating new cross-step asserts there beats sprinkling per-step refines.
- The canonical Devir character sheet has **no lock glyph** — Reward inalienability (BR:2472) lives in the GM's head. A digital lock is purely our affordance; render it inline with the gear name and pair it with the Reward name in "Anotações" so the canonical text signal remains primary.
- Reward "Aguçada" / "Keen" picker on a 4-weapon Hobbit budget needs a target reset on two transitions: changing the Reward (clears stale target) and removing the targeted weapon (forces re-pick). Skipping the second leaves the cross-step refine green-but-stale.
