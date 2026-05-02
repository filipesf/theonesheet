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
