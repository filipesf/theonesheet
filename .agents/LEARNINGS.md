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
