# The One Sheet v1 Outline

## Overview

`v1` turns the local-first MVP into a real hosted product. The focus is durable persistence, user accounts, multiple characters per user across devices, and a mobile-friendly experience.

This plan is intentionally an outline. It captures the essential direction while leaving room for product and UX adjustments after learning from `v0`.

## Desired End State

At the end of `v1`, a user can:

- Create an account and sign in securely.
- Create, edit, and manage multiple characters tied to their account.
- Access those characters across sessions and devices.
- Import `v0` exports into their hosted account.
- Use the app comfortably on mobile as well as desktop.

## Scope

In scope:

- Authentication and account ownership.
- Hosted persistence for characters.
- Character list/dashboard for a signed-in user.
- Import path from `v0` local files.
- Mobile-friendly layouts and interaction review.
- Server-side validation and recomputation before persistence.

Out of scope:

- Campaigns and join links.
- GM editing of player sheets.
- Rich collaborative features.
- Realtime campaign sync.

## Essential Product Decisions

- A character has a single owning user.
- The backend is the source of truth for persisted characters.
- Client-side calculations remain for fast UX, but every save is revalidated on the server.
- `v0` import is a first-class migration path, not an afterthought.

## Proposed Phases

### Phase 1: Backend Foundation
- Set up API project, database, and migrations.
- Create persistent character storage.
- Port the shared domain layer so backend and frontend use the same rules.

### Phase 2: Auth and User Ownership
- Add sign-up, sign-in, sign-out, and session handling.
- Associate characters with user IDs.
- Restrict access so users can only manage their own characters.

### Phase 3: Character Persistence and Dashboard
- Build a signed-in character library.
- Support create, update, delete, duplicate, and archive flows.
- Add import from `v0` JSON files.

### Phase 4: Mobile-Friendly Pass
- Review all key flows on narrow screens.
- Adapt navigation, sheet sections, forms, and action placement.
- Ensure the app is genuinely usable on mobile, not merely viewable.

## Key Risks and Watchpoints

- Importing `v0` data with incomplete or legacy fields.
- Keeping client and server schema versions aligned.
- Preventing accidental data loss during migration from browser-only usage.
- Avoiding a desktop-centric sheet layout that becomes painful on phones.

## Success Criteria

### Automated Verification
- [ ] Auth flows have route and integration tests.
- [ ] Character CRUD passes API and UI tests.
- [ ] `v0` import fixtures are accepted and normalised.
- [ ] Responsive build passes lint, typecheck, and tests.

### Manual Verification
- [ ] A user can sign in on a second device and access the same characters.
- [ ] A `v0` export imports cleanly into an account.
- [ ] The primary character-editing flows are usable on mobile.

## Notes for Future Refinement

- Decide later whether to introduce draft autosave indicators, revision history, or soft delete.
- Re-evaluate auth provider and deployment constraints once the MVP usage pattern is clear.
- Use lessons from `v0` to adjust dashboard structure before hardening the UX.

## References

- Product requirements: `DOMAIN_SPEC.md`
- Architecture guidance: `DOMAIN_SPEC.md:1427-1728`
- Validation invariants: `DOMAIN_SPEC.md:1241-1275`
