# Reference alignment

This repository is being built against `WORKEROS_DUAL_HACKATHON_REFERENCE.md`, supplied as the project source-of-truth reference. The reference is intentionally treated as requirements, not as proof that a capability exists.

## Current baseline

Implemented foundation:

- `apps/web/` contains the required control-plane routes.
- `packages/contracts/` contains initial Zod state and agent schemas.
- `packages/policy/` identifies sensitive billing tools.
- `packages/trueforge/` integrates the SDK session/turn boundary and exposes explicit unavailable states.
- `services/enterprise-mcp/` defines the required MCP tool surface.
- `services/adk-agents/` contains a real typed Contract Agent definition; Billing and Policy specialists remain future work.
- `workers/revenue-integrity/` contains the worker manifest and Skill.
- `fixtures/demo-enterprise/acme.json` is synthetic demo data.
- CI, build, and workspace smoke tests are present.
- Commercial Change Assurance has a typed deterministic reconciliation core, PostgreSQL/Drizzle schema and migration, database-backed MCP tool surface, replay-safe approval/mutation/verification operations, and persisted Case UI composition.
- The Day One launcher composes Cloud SQL, MCP, ADK health, web, and TrueForge configuration without persisting generated database credentials.

## Explicitly not yet verified

The following must not be described as live or complete: an authenticated TrueForge golden run, Skill-load proof, sandbox/Code Mode reconciliation, a TrueForge Evidence QA subagent, live event persistence, Google Agent Runtime/Registry/Memory Bank/Identity/Gateway/Model Armor, OpenTelemetry export, Secret Manager, Qodo installation/review history, or a repeatable captured end-to-end run.

Cloud SQL is currently running in `us-central1`, but local services were stopped at the 2026-08-29 audit. Vertex AI was disabled, and the configured `gemini-3-flash-preview` does not prove the stated Gemini 3.5+ eligibility requirement. The historical ADK smoke test remains useful engineering evidence but is not current eligibility proof. `/fleet` still contains fixture-driven metrics and specialist availability claims.

## Vertical-slice acceptance

The required final proof remains: seeded Acme state → real TrueForge session and Skill → database-backed MCP reads → eligible Gemini 3.5+ ADK specialist evidence → meaningful TrueForge sandbox reconciliation → persisted approval pause and reconnect → one approved billing write → authoritative reread and verification → ordered CaseEvents and resolved UI state.

## Change-control rule

If implementation reality conflicts with the attached reference, document the conflict in the PR and propose the smallest correction. Do not silently change architecture or check off a requirement based on placeholder code.

Use `docs/HACKATHON_SCORECARD.md` for status and `docs/DEMO_EVIDENCE.md` for reproducible proof.
