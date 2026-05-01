# The One Sheet v2 Outline

## Overview

`v2` introduces campaigns as an organisational and collaboration layer on top of owned characters. A campaign is primarily a container for related characters plus a way for a GM to manage the sheets of characters actively playing in that campaign.

This version should stay intentionally narrow: campaigns are not a full virtual tabletop or social network. They are a lightweight coordination feature.

## Desired End State

At the end of `v2`, users can:

- Create a campaign with a title and rich-text description.
- Join a campaign through a shareable join link.
- Associate existing characters with a campaign.
- View campaign membership and active characters.
- Let the GM modify player character sheets within that campaign context.

## Scope

In scope:

- Campaign entity.
- GM and player campaign roles.
- Join-by-link flow.
- Campaign page with metadata and member characters.
- Permission model for GM edits on campaign characters.
- Basic notes/description support using rich text.

Out of scope:

- Full chat, messaging, or forum features.
- Complex multi-GM workflows unless clearly needed later.
- Live dice rolling or tabletop play surface.
- Fine-grained operational transforms or CRDT co-editing.

## Essential Product Decisions

- A campaign exists to organise characters and enable GM control, not to replace character ownership.
- Players still own their characters at the account level.
- GM campaign permissions extend to characters attached to that campaign.
- Join links should be revocable and resettable.

## Proposed Phases

### Phase 1: Campaign Data Model and Permissions
- Define `Campaign`, membership, join token, and character assignment models.
- Introduce campaign roles and authorisation rules.

### Phase 2: Campaign Creation and Discovery
- Build campaign list and create-campaign flows.
- Add title, rich-text description, and join link generation/reset.

### Phase 3: Character Assignment and GM Controls
- Allow players to attach characters to campaigns.
- Allow GMs to view and edit those attached character sheets.
- Make campaign context visible in the sheet UX.

### Phase 4: Collaboration Polish
- Add campaign-centric dashboards and quality-of-life management tools.
- Evaluate whether realtime updates are worth introducing here.

## Key Risks and Watchpoints

- Permission complexity once a character belongs to a campaign but still has an owner.
- Avoiding confusing edit precedence between player and GM.
- Rich-text storage and sanitisation.
- Join-link abuse or stale invitations.

## Success Criteria

### Automated Verification
- [ ] Campaign CRUD and membership rules are covered by API tests.
- [ ] Join-link flows are covered by integration tests.
- [ ] Authorisation tests verify GM edit access and player ownership boundaries.

### Manual Verification
- [ ] A GM can create a campaign and invite a player by link.
- [ ] A player can join with an existing character.
- [ ] The GM can modify the joined character sheet within the campaign flow.
- [ ] Campaign title and rich-text description display correctly on desktop and mobile.

## Notes for Future Refinement

- Reassess later whether campaign notes need public/private separation.
- Decide after real usage whether GM changes need explicit audit history.
- Keep room for eventual Loremaster dashboards, company-level shared state, or realtime visibility if they become clearly valuable.

## References

- Product requirements: `DOMAIN_SPEC.md`
- `Company` and collaboration concepts: `DOMAIN_SPEC.md:273-292`, `523-531`, `1300-1308`
- Realtime architecture ideas for future use: `DOMAIN_SPEC.md:1618-1675`
