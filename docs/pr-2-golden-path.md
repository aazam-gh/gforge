# PR 2: Acme supervised golden path

## Scope

This change is intentionally limited to the first governed commercial workflow:

`TrueForge investigation -> MCP evidence reads -> Vertex Contract Agent -> persisted Case -> approval pause -> human approval -> billing mutation -> reread -> verification -> RESOLVED`

The new `@workeros/trueforge` supervisor boundary has two explicit phases:

- `startAcmeGoldenPath` creates or reuses the TrueForge session, submits the investigation turn, validates the specialist result, persists the Case and proposal, and returns only in `waiting_for_approval`.
- `resumeAcmeGoldenPath` is called by the human approval path and performs approval, then asks operations to load the persisted proposal before performing the idempotent billing write, authoritative reread, and verification. Resumed caller payloads cannot supply billing terms.

The database operations and ADK/MCP clients are injected at this boundary so the supervisor remains testable and cannot silently substitute simulated external success. The production composition must inject the real TrueForge adapter, MCP reads, Vertex bridge validation, and database operations.

## Safety fixes included

- ADK Pydantic output now serializes the camelCase contract expected by WorkerOS while accepting Python field names.
- Case event sequence allocation uses a PostgreSQL transaction advisory lock, preventing concurrent appenders from selecting the same sequence.
- Billing mutation validation loads the Case and proposal server-side and rejects account, case, before/after term, impact, or idempotency mismatches.
- Approval, mutation, and verification stages are replay-safe: retries reuse persisted decisions/outcomes, restore Case status, and append missing timeline events without repeating side effects.

## Review and test evidence

- Post-merge CI for PR #1 passed on `main`.
- Local TypeScript typecheck passed.
- Local workspace tests passed: 11 test files / 11 tests.
- The new supervisor test proves the investigation returns at the approval boundary and carries the exact `$312,000` impact (`31,200,000` cents).

## Not claimed by this PR

This PR does not claim a live end-to-end run until the production composition is connected to the configured TrueForge tenant, local MCP endpoint, Cloud SQL runtime database, and Vertex ADC service. It also does not add new domains, agents, graph infrastructure, production identity, or fleet features.
