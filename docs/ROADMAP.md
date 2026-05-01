# Roadmap

| Version | Focus | Detailed plan |
| --- | --- | --- |
| **v0** (current) | Local-first MVP, single-user, `localStorage` | [`PLAN_v0.md`](./PLAN_v0.md) |
| **v1** | Hosted product, accounts, multi-device, mobile | [`PLAN_v1.md`](./PLAN_v1.md) |
| **v2** | Campaigns, GM controls, join links | [`PLAN_v2.md`](./PLAN_v2.md) |

## Working documents

- [`PLAN_MVP.md`](./PLAN_MVP.md) — current implementation plan, combining v0 product scope with the project's tech-stack decisions.
- [`DOMAIN_SPEC.md`](./DOMAIN_SPEC.md) — canonical TOR 2e domain specification (data model, formulas, validation invariants, reference tables, content scope).

## Reference docs

Strategic and visual contracts live at the repo root, in the [Google Stitch](https://stitch.withgoogle.com/docs/design-md/format/) PRODUCT.md / DESIGN.md format:

- [`PRODUCT.md`](../PRODUCT.md) — register, users, brand personality, anti-references, design principles.
- [`DESIGN.md`](../DESIGN.md) — visual tokens, themes, typography, elevation, components, do's and don'ts. Carries [`DESIGN.json`](../DESIGN.json) as a sidecar.

Engineering contracts stay next to the code:

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — layers, dependency rules, data flow, shared UI primitives, library choices, reference-data conventions.
- [`CODE_STYLE.md`](./CODE_STYLE.md) — TypeScript and React conventions.

## Versioning policy

- `PLAN_v0.md`, `PLAN_v1.md`, `PLAN_v2.md` are immutable plan snapshots — do not edit. If scope shifts, append a new version (`PLAN_v3.md`) or amend `PLAN_MVP.md`.
- `PLAN_MVP.md` is the working document and is allowed to evolve.
