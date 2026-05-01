---
description: Create a signed git commit for the current changes, with confirmation, no co-author trailer, no --amend.
---

# /commit

Create a single git commit for the currently staged-or-pending changes.

## Procedure

1. Run in parallel:
   - `git status` (no `-uall` flag)
   - `git diff` (working tree)
   - `git diff --staged`
   - `git log -n 5 --oneline` (to match existing commit-message style)

2. Inspect the changes:
   - Confirm there is something to commit. If the working tree is clean, stop and tell the user.
   - Refuse to commit if the diff includes `.env`, `.env.local`, files under `dist/`, or any secret-looking content. Warn the user and stop.
   - Refuse to commit if the diff touches `docs/PLAN_v0.md` / `PLAN_v1.md` / `PLAN_v2.md` without an explicit request from the user — those are immutable plan snapshots.
   - For `docs/DOMAIN_SPEC.md` and `PRODUCT.md`: edits are allowed, but warn the user before committing if the diff is large or rewrites scope sections; treat them as authoritative documents that deserve a deliberate change message.

3. Draft a commit message:
   - Imperative present tense, ≤72 chars on the title line.
   - Match the project precedent (look at `git log` — short, no body for trivial changes).
   - No co-author trailer. No "🤖 Generated" footer. No emojis unless the user asked for them.
   - If a body is genuinely useful (e.g., a non-obvious why), keep it short and wrap at 72 columns.

4. Show the proposed message to the user and **wait for explicit approval** before committing — *unless* one of these pre-approval signals is present, in which case proceed straight to step 5:
   - The user invoked `/commit` with an argument that pre-authorises the commit (e.g. `/commit já pode fazer o push`, `/commit commit direto`, `/commit considere o commit pré-aprovado`).
   - The user has said in the same turn or a recent turn that the commit (and/or push) is "pré-aprovado", "já está aprovado", "pode commitar e fazer o push direto", or equivalent.
   - Auto mode is active **and** the user has previously signalled pre-approval at least once in the session for the same kind of work — treat it as a standing authorisation until the user revokes it. If the session has no such precedent, still pause for confirmation the first time.

   When skipping the pause, briefly state the chosen title in your reply *before* running `git commit`, so the user can interrupt if it is wrong.

5. After approval (or under a pre-approval signal):
   - Stage the specific files that should be in this commit (`git add <files>`). Do not use `git add -A` or `git add .` — that risks pulling in unrelated changes.
   - Run `git commit -S -m "<title>"` (or with `$(cat <<'EOF' ... EOF)` heredoc for multi-line messages).
   - Run `git status` to confirm a clean tree.
   - If the user's pre-approval also covered the push (e.g. "commit e push já está aprovado"), run `git push` after the commit and report the push result alongside the commit hash. Otherwise leave the push for `/push`.

6. Report the new commit hash and one-line message back to the user.

## Hard rules

- **Always sign** with `-S` (GPG). If signing fails, stop and surface the error — never bypass with `--no-gpg-sign`.
- **Never `--amend`.** If the previous commit was wrong, create a new commit.
- **Never `--no-verify`.** If a hook fails, fix the underlying issue and try again.
- **Never force-push** from this command. Pushing is a separate command (`/push`).
- **Never commit during pre-commit hook failure.** A failed hook means the commit did not happen — fix and re-stage, do not amend.
- **Never auto-commit without a pre-approval signal.** The default is to pause for explicit approval. The only way to skip the pause is one of the signals listed in step 4 (a pre-approval argument, an explicit "pré-aprovado" / "já está aprovado" message, or a standing authorisation under Auto mode). Silence is not approval; ambiguity is not approval.
