# Reference alignment

This repository is being built against `WORKEROS_DUAL_HACKATHON_REFERENCE.md`, supplied as the project source-of-truth reference. The reference is intentionally treated as requirements, not as proof that a capability exists.

## Current baseline

Implemented foundation:

- `apps/web/` contains the required control-plane routes.
- `packages/contracts/` contains initial Zod state and agent schemas.
- `packages/policy/` identifies sensitive billing tools.
- `packages/trueforge/` exposes an explicit unavailable-state adapter.
- `services/enterprise-mcp/` defines the required MCP tool surface.
- `services/adk-agents/` contains typed specialist placeholders.
- `workers/revenue-integrity/` contains the worker manifest and Skill.
- `fixtures/demo-enterprise/acme.json` is synthetic demo data.
- CI, build, and workspace smoke tests are present.
- Commercial Change Assurance has a typed deterministic reconciliation core, PostgreSQL/Drizzle schema and migration, database-backed MCP tool surface, and a real ADK Contract Agent definition.

## Explicitly not yet implemented

The following remain planned or externally blocked and must not be described as live: a created Cloud SQL trial database (Console-only setup still needs its password), a live TrueForge tenant session, sandbox/Code Mode execution, ADK deployment on Vertex/Agent Runtime, a Vertex model accessible to this project, Memory Bank, Pub/Sub/Secret Manager/Cloud Observability, Qodo installation/review history, and real event streaming. The persisted approval/write/verification code is implemented but cannot be integration-executed until Cloud SQL is created and connected.

## First vertical-slice acceptance

The first meaningful implementation PRs should prove: seeded Acme state → real MCP reads → real ADK structured evidence → deterministic reconciliation → persisted TrueForge approval → approved billing write → independent verification → ordered CaseEvents and UI state.

## Change-control rule

If implementation reality conflicts with the attached reference, document the conflict in the PR and propose the smallest correction. Do not silently change architecture or check off a requirement based on placeholder code.
