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
