# The One Sheet

The One Sheet is a character-sheet web app for *The One Ring* (2nd Edition).

It is designed to help players create, manage, and evolve Player-hero sheets while respecting the system's canonical rules for derived values, validation, gear, progression, and runtime state.

## Project Status

This repository is currently in the planning stage.

At the moment, it contains:

- the canonical product requirements document
- a detailed `v0` implementation plan
- outline roadmaps for `v1` and `v2`

No application code has been implemented yet.

## Product Direction

The long-term product vision is a web app that:

- lets a player create and edit a hero sheet while respecting The One Ring 2e rules
- computes all derived values automatically
- validates rule constraints and data invariants
- supports persistence and later collaboration features
- grows from a local-first single-user tool into a hosted multi-user product

## Roadmap

### v0

`v0` is the local-first MVP.

It is planned as a single-page application with multiple sheet views, storing multiple characters in browser `localStorage` and supporting export/import for future hosted versions.

Planned scope:

- single-page character management
- multiple local characters per browser
- automatic recomputation of derived values
- guided character creation support
- versioned JSON export/import

Out of scope for `v0`:

- accounts
- backend persistence
- campaigns
- GM collaboration
- realtime features

### v1

`v1` turns the MVP into a hosted product.

Planned scope:

- user accounts and authentication
- persistent hosted character storage
- multiple characters per user across devices
- import path from `v0`
- mobile-friendly UX

### v2

`v2` introduces campaigns as a lightweight organisational and collaboration layer.

Planned scope:

- campaign creation
- join-by-link flow
- campaign title and rich-text description
- associating characters with campaigns
- GM ability to modify character sheets within a campaign context

## Core Design Principles

- Canonical rules first: the PRD is the source of truth for schema, formulas, and validation.
- Derived values are never trusted as user input and must always be recomputed.
- The product starts local-first, then evolves to hosted persistence, then to collaborative campaign features.
- Architecture should preserve a stable domain core even as storage and collaboration layers change.

## Documentation

- Product requirements: `docs/PRD_TheOneSheet.md`
- MVP plan: `docs/PLAN_v0.md`
- Hosted persistence outline: `docs/PLAN_v1.md`
- Campaigns outline: `docs/PLAN_v2.md`

## Planned Technical Direction

The current planning documents lean towards:

- TypeScript
- React for the frontend
- a shared domain layer for formulas and validation
- a future hosted stack with API, database, and account-backed persistence

These choices are documented in the PRD and may still evolve as implementation begins.

## Getting Started

There is no runnable application yet.

If you are starting implementation, read the documents in this order:

1. `docs/PRD_TheOneSheet.md`
2. `docs/PLAN_v0.md`
3. `docs/PLAN_v1.md`
4. `docs/PLAN_v2.md`

## Licence

No licence has been defined yet.
