---
description: Promote session learnings from .agents/LEARNINGS.md into permanent docs, commands, and skills. Read-only until the user approves the proposal.
---

# /learn

Promote session learnings from `.agents/LEARNINGS.md` into the permanent instruction layer — `AGENTS.md`, `docs/*.md`, `PRODUCT.md`, `DESIGN.md`, `.agents/commands/*.md`, `.agents/skills/*/SKILL.md`. This is the maintenance loop that keeps operational knowledge from rotting as transient bullet points.

> **When to use:** periodically (e.g. weekly, or whenever `LEARNINGS.md` exceeds ~40 entries), or when you notice the same insight being re-learned across sessions. **`/save` writes learnings; `/learn` processes them.** They are separate by design.

## Input

- Optional **date range** to scope the analysis (e.g. `since 2026-04-10`). Default: all entries.
- Optional **focus area** (e.g. `domain`, `creation-wizard`, `ci`). Default: all.

## Procedure

### Phase 1 — Inventory

1. Read `.agents/LEARNINGS.md`. If the file does not exist or has no dated entries, stop and tell the user there is nothing to absorb.
2. List all skills via Glob `.agents/skills/*/SKILL.md` and read each one (front-matter + body). Today the repo has only `the-one-sheet` — this step is near-trivial, but keep it general for future skills.
3. List all repo commands via Glob `.agents/commands/*.md` and read their descriptions (the YAML front-matter `description` field is enough; full body only on demand during incorporation).
4. Read the canonical project docs:
   - `AGENTS.md` (repo root) — universal contract. Pay attention to §3 (conventions), §5/§5a (do-not-touch and authoritative zones), §7 (commands table), §10 (out-of-scope flags), §11 (quick orientation).
   - `PRODUCT.md` (repo root) — strategic / brand.
   - `DESIGN.md` (repo root) — visual tokens, components, do's and don'ts.
   - `docs/DOMAIN_SPEC.md` — canonical TOR 2e domain spec.
   - `docs/ARCHITECTURE.md` — layers, dependency rules, persistence model.
   - `docs/CODE_STYLE.md` — TypeScript and React conventions.
   - `docs/PLAN_MVP.md` — current plan (read-only context). **Never edit `docs/PLAN_v0.md` / `PLAN_v1.md` / `PLAN_v2.md`** — they are immutable snapshots.

### Phase 2 — Classify

5. For each learning entry, assign one classification:

| Classification       | Criteria                                                                                                              | Action                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **already-absorbed** | The insight is already codified in a doc, command, or skill — explicitly stated or clearly implied by existing rules. | Remove from `LEARNINGS.md`.                                                                       |
| **incorporate**      | Actionable and belongs in an existing doc, command, or skill, but is not yet there.                                   | Add to the target, then remove from `LEARNINGS.md`.                                               |
| **new-command**      | Suggests a recurring workflow that does not yet have a slash command.                                                 | Propose the new `.agents/commands/<name>.md`, then remove from `LEARNINGS.md` after creation.     |
| **new-skill**        | Suggests a coherent domain capability pack worth invoking on demand. Rare — most insights are commands or doc edits.  | Propose the new `.agents/skills/<name>/SKILL.md`, then remove from `LEARNINGS.md` after creation. |
| **keep**             | Valuable context but too volatile, contextual, or opinion-based to become a permanent rule.                           | Keep in `LEARNINGS.md`.                                                                           |

6. **Cluster related entries** — group `incorporate` items targeting the same file. Group `new-command` / `new-skill` candidates that form a coherent theme.

### Phase 3 — Propose

7. Present a structured proposal to the user before making **any** changes:

```
## Learning Proposal

### Already absorbed (X items) — will be removed
- [date] "learning text" → already in {file}

### Incorporate (X items) — will be added to existing files
#### {target-file-1}
- [date] "learning text" → add to {section}
- [date] "learning text" → add to {section}

#### {target-file-2}
- ...

### New command candidates (X items)
- **/{proposed-name}**: {1-line rationale}
  - Sourced from: [date] "learning 1", [date] "learning 2"

### New skill candidates (X items)
- **{proposed-name}**: {1-line rationale}
  - Sourced from: [date] "learning 1", [date] "learning 2"

### Keep as learnings (X items) — no action
- [date] "learning text" — {brief reason: volatile / contextual / personal}

### Summary
| Classification | Count |
|---|---|
| Already absorbed | X |
| Incorporate | X |
| New command | X |
| New skill | X |
| Keep | X |
| **Total** | **X** |
```

8. **Wait for approval.** The user may adjust classifications, reject incorporations, or refine new-command / new-skill proposals. Do not proceed until the user confirms.

### Phase 4 — Execute

9. **Incorporate items** — for each `incorporate` cluster:
   - Read the target file.
   - Add the insight in the appropriate section. Match the document's existing style and density. **Do not create new top-level sections** unless the learning genuinely introduces a new concern; prefer extending an existing section.
   - **Keep additions terse.** A one-line learning stays roughly one line in the target. Do not inflate.
   - Skill / command files have YAML front-matter; project docs (`AGENTS.md`, `docs/*`, `PRODUCT.md`, `DESIGN.md`) typically do not. Do not invent an `updated` field where none exists.

10. **Create new commands** — for each approved `new-command`:
    - Write `.agents/commands/<name>.md` mirroring the structure of existing commands (`save.md`, `audit.md`):
      - YAML front-matter with `description`.
      - H1 heading `# /<name>`.
      - Sections: short intro, _When to use_, _Input_ (if any), _Procedure_ (numbered steps), _Hard rules_.
    - Use English for the command body (matches the rest of `.agents/commands/`).

11. **Create new skills** — for each approved `new-skill`:
    - Write `.agents/skills/<name>/SKILL.md` mirroring `the-one-sheet/SKILL.md`:
      - YAML front-matter with `name` and `description` (description is the trigger contract — be specific).
      - Body: identity, when to invoke, conventions, references to docs.
    - Use English. Keep it lean — skills are loaded on demand by description match.

12. **Sync cross-references** — only what actually exists in this repo:
    - New command → add a row in `AGENTS.md §7` (Repo slash commands).
    - New skill that should run at session start → add to `AGENTS.md §1 Boot` numbered list.
    - Edit to `docs/DOMAIN_SPEC.md` that affects `derived` or `validate` → cross-check `AGENTS.md §11 Quick orientation`.
    - Edit to `DESIGN.md` → cross-check `DESIGN.json`.
    - Do **not** look for tables that do not exist (e.g. there is no master skill table in `AGENTS.md`).

13. **Clean `.agents/LEARNINGS.md`**:
    - Remove all `already-absorbed`, `incorporate`, and successfully-created `new-command` / `new-skill` entries.
    - Keep `keep` entries in place. Do not reorder. Preserve chronological structure.
    - If all entries under a `## YYYY-MM-DD` heading were absorbed, remove the heading too.

### Phase 5 — Report

14. Present a summary:

```
## Learning Complete

### Changes made
- {file}: added {N} items ({brief list})
- {file}: added {N} items ({brief list})
- {new-file}: created ({rationale})

### LEARNINGS.md
- Before: {N} items across {M} date sections
- Removed: {X} items (already absorbed: {A}, incorporated: {B}, new command: {C}, new skill: {D})
- Remaining: {Y} items across {K} date sections

### Files modified
- {list of all changed files}
```

## Hard rules

- **Read-only until approved.** Phase 3 is a proposal. Never edit files before the user confirms.
- **One-line stays one-line.** Learnings are terse by design. When incorporating, match the target doc's density — do not expand a bullet into a paragraph.
- **Preserve chronological order** in `LEARNINGS.md`. Do not reorder, regroup, or merge date sections — just remove absorbed entries and leave the rest in place.
- **Empty date sections get removed.** If all entries under a `## YYYY-MM-DD` heading are absorbed, remove the heading too.
- **Do not force absorption.** Borderline between `incorporate` and `keep` → prefer `keep`. The cost of a stale learning is low; the cost of a bad rule in a doc is high.
- **No new top-level sections** in skills, commands, or docs unless the learning genuinely introduces a new concern. Extend existing sections by default.
- **Do not touch the immutable plan snapshots** (`docs/PLAN_v0.md`, `PLAN_v1.md`, `PLAN_v2.md`) — `docs/PLAN_MVP.md` is the live one.
- **Do not touch `pnpm-lock.yaml`, `dist/`, `node_modules/`, `.git/`** — see `AGENTS.md §5`.
- **Language:** all repo docs, commands, and skills are en-GB. Communication with the human user is pt-BR. See `AGENTS.md §3`.
- **This command does not commit.** Run `/save` after `/learn` to commit and push the changes.
