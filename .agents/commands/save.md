---
description: End-of-session save — quality gates, architecture audit, organised commits, learnings log, and push. Replaces /commit + /push.
---

# /save

End-of-session command that ensures everything modified in this conversation is clean, compliant, and properly committed and pushed before closing. This is the **only** way to wrap a session — there is no separate `/commit` or `/push`.

> **When to use:** at the end of a working session, or whenever the user wants to checkpoint progress. Never run raw `git commit && git push` without `/save`.

## Procedure

### Phase 1 — Scope check

1. Run in parallel:
   - `git status` (no `-uall` flag).
   - `git diff` (working tree).
   - `git diff --staged`.
   - `git diff --name-only HEAD` (full list of modified, added, deleted files).
   - `git log -n 5 --oneline` (to match commit-message precedent).
2. If the working tree is clean (no staged, no unstaged, no untracked of interest), stop and tell the user. Nothing to save.
3. Refuse to proceed if the diff includes secret-looking content: `.env`, `.env.*`, files under `dist/`, credentials, tokens, private keys. Surface the issue and stop.
4. Refuse to touch `docs/PLAN_v0.md`, `docs/PLAN_v1.md`, `docs/PLAN_v2.md` without an explicit current-conversation request from the user — those are immutable plan snapshots.
5. For `docs/DOMAIN_SPEC.md` and `PRODUCT.md`: edits are allowed, but warn the user before committing if the diff is large or rewrites scope sections.
6. **Stage only session-scoped files.** In a mixed working tree, unrelated pre-existing changes stay out. Stage by file, never with `git add -A` or `git add .`. If unsure whether a change belongs to this session, ask.

### Phase 2 — Quality gates

7. Run the same checks CI runs, in this order, stopping on the first failure:
   - `pnpm lint`
   - `pnpm tsc`
   - `pnpm test`
8. If any fail, stop and surface the error. Do not proceed to commit. Fix the underlying issue (or ask the user how to proceed) and re-run.

### Phase 3 — Architecture audit

9. Invoke `/audit` on the diff. The audit reports violations against `docs/ARCHITECTURE.md`, `DESIGN.md`, `docs/CODE_STYLE.md`, `AGENTS.md`, and `PRODUCT.md`, grouped by severity.
10. If `/audit` reports **Critical** or **Major** violations, stop. Surface them to the user and ask whether to fix before committing or to proceed despite the warnings (the user must explicitly opt in to proceeding with Major issues; Critical issues require a fix or explicit override). **Minor** drift may pass.

### Phase 4 — Organise commits

11. Group changed files into logical commits. Good criteria:
    - By layer or feature (`features/sheet`, `features/creation`, `domain/`, `ref-data/`, `persistence/`, `app/`).
    - By type of change (new feature, bug fix, refactor, doc update, infra/CI).
    - Docs separate from code when they serve different purposes.
    - Deletions separate from additions when the intent differs.
12. Draft commit messages following the repo precedent (`git log` for style):
    - Imperative present tense, ≤72 chars on the title line.
    - Match existing precedent — short titles, body only when the _why_ is non-obvious.
    - **No co-author trailer. No "🤖 Generated" footer. No emojis** unless the user asked.
    - If a body is genuinely useful, keep it short and wrap at 72 columns.
13. **Default to multiple commits.** A single dump commit with unrelated changes is wrong. The exception is when concerns genuinely interleave in the same hunks — then accept a blended commit and explain both concerns in the body.
14. Show the proposed grouping and titles to the user and **wait for explicit approval** before committing — _unless_ one of these pre-approval signals is present:
    - The user invoked `/save` with an argument that pre-authorises (e.g. `/save commit e push aprovados`, `/save direto`).
    - The user has said in this turn or a recent turn that the save (or commit + push) is "pré-aprovado", "já está aprovado", "pode salvar direto", or equivalent.
    - Auto mode is active **and** the user has previously signalled pre-approval at least once in the session for the same kind of work — treat as a standing authorisation until revoked. Without prior precedent, still pause the first time.

When skipping the pause, briefly state the chosen titles in your reply _before_ running any `git commit`, so the user can interrupt if wrong.

### Phase 5 — Log learnings

15. Review the conversation for insights worth preserving in `.agents/LEARNINGS.md`. Good learnings are:
    - Mistakes made and corrected (e.g. "zod 4 cascade-broke `creation/` types — pin to zod 3.x").
    - Process discoveries (e.g. "pnpm version must be pinned in GH Actions setup").
    - Tool/data gaps found and fixed (e.g. "Devir pt-BR canon uses _Ferimento_, not _Ferida_").
    - Conventions clarified or established mid-session.
    - Architectural calls made under pressure (worth revisiting in `/learn`).
16. Skip generic, obvious, or filler learnings. If the session produced none, skip this phase entirely.
17. Append to `.agents/LEARNINGS.md` under today's date heading (`## YYYY-MM-DD`). If today's heading already exists, append to it. Do not duplicate entries already present. Each learning is a single line.
18. **Stage `.agents/LEARNINGS.md`** as part of the most appropriate commit group from Phase 4 (usually the docs / infra group, or its own meta-commit if substantial).

### Phase 6 — Commit

19. For each group from Phase 4:
    - `git add <files>` (specific files only — never `-A`, never `.`).
    - `git commit -S -m "<title>"` (or `$(cat <<'EOF' ... EOF)` heredoc for multi-line messages).
20. After all commits, run `git status` to confirm a clean tree.

### Phase 7 — Push

21. Pre-flight in parallel:
    - `git rev-parse --abbrev-ref HEAD` (current branch).
    - `git log @{u}..HEAD --oneline` (commits ahead of upstream).
    - `git log HEAD..@{u} --oneline` (commits behind upstream).
    - `git remote get-url origin`.
22. Stop and surface the issue if any of these fail:
    - Working tree not clean (should not happen after Phase 6 — investigate).
    - Current branch is not `main` — confirm with the user before pushing a non-main branch.
    - Upstream has commits we do not — refuse and recommend `git pull --rebase`. **Do not run rebase automatically.**
    - Zero commits ahead of upstream — stop, nothing to push.
    - Diff to be pushed contains `.env*` or anything secret-looking — stop.
23. Show the user: branch, commits about to be pushed (one-line list), remote URL.
24. Wait for explicit approval — **unless** the same pre-approval signal from Phase 4 covered the push (e.g. "commit e push aprovados").
25. After approval: `git push origin <branch>`. Mention the GitHub Pages deploy can be watched at the Actions tab; do not poll.

### Phase 8 — Report

26. Final summary: commits created (hash + title each), files touched per commit, learnings logged (count + section), push result.

## Hard rules

- **Always sign** with `-S` (GPG). If signing fails, stop and surface the error — never bypass with `--no-gpg-sign`.
- **Never `--amend`.** If the previous commit was wrong, create a new commit.
- **Never `--no-verify`.** If a hook fails, fix the underlying issue and try again.
- **Never `--force` or `--force-with-lease`** without an explicit, current-conversation request. Force-pushing `main` is especially dangerous.
- **Never auto-commit or auto-push without a pre-approval signal.** Default is to pause. Silence is not approval; ambiguity is not approval.
- **Never push to a branch that is not the user's current branch.**
- **Never push secrets.** If pre-flight reveals `.env*` or secret-looking content in the commits about to be pushed, stop.
- **Never skip the quality gates.** `pnpm lint && pnpm tsc && pnpm test` runs on every `/save`. If they are too slow for a quick checkpoint, that is a tooling issue to raise, not a step to skip.
- **Never create a single dump commit.** Organise by context. Blended commits are acceptable only when hunks genuinely interleave.
- **Never commit during pre-commit hook failure.** A failed hook means the commit did not happen — fix and re-stage, do not amend.
- **Learnings must be bite-sized.** One sentence per entry. If it needs more, distil or split. Do not log obvious or generic items.
- This command does not create branches or PRs — it commits to the current branch and pushes to its upstream.
