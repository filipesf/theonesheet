---
description: Push the current branch to origin/main with explicit confirmation. Verifies clean working tree first.
---

# /push

Push committed changes on the current branch to the remote.

## Procedure

1. Run in parallel:
   - `git status`
   - `git rev-parse --abbrev-ref HEAD` (current branch)
   - `git log @{u}..HEAD --oneline` (commits ahead of upstream, if any)
   - `git log HEAD..@{u} --oneline` (commits behind upstream, if any)

2. Pre-flight checks. Stop and surface the issue if any of these fail:
   - Working tree is **not** clean — refuse until changes are committed (offer `/commit`) or stashed (do not stash automatically).
   - Current branch is not `main` — confirm with the user before pushing a non-main branch.
   - Upstream has commits we do not — refuse and recommend `git pull --rebase` (do not run it automatically).
   - There are zero commits ahead of upstream — stop, nothing to push.

3. Show the user:
   - Branch.
   - Commits about to be pushed (one-line list).
   - Remote URL (`git remote get-url origin`).

4. Wait for explicit approval — for example, the user typing "yes", "go", "push", or equivalent.

5. After approval:
   - `git push origin <branch>`.
   - If the push succeeds and CI deploys to GitHub Pages, mention that the user can watch the deploy at the Actions tab; do not poll.

## Hard rules

- **Never `--force` or `--force-with-lease`** without an explicit, current-conversation request from the user. Force-pushing `main` is especially dangerous.
- **Never `--no-verify`.**
- **Never push to a branch that is not the user's current branch.**
- **Never push secrets.** If pre-flight reveals `.env*` or anything secret-looking in the commits about to be pushed, stop.
