# WorkerOS hackathon scorecard

Last audited: 2026-08-29 on `codex/live-trueforge-golden-path`. This branch is stacked on open PRs and is not counted as merged product capability.

This file records implementation reality. Allowed states are:

- `NOT_STARTED` — no meaningful implementation exists.
- `PARTIAL` — some source or tests exist, but the complete requirement is not proven.
- `VERIFIED` — code and reproducible evidence are both named.
- `BLOCKED` — the next proof requires unavailable access, service enablement, or an external dependency.

`VERIFIED` applies only to the stated evidence, not to broader production readiness. No numeric judging score is claimed.

## Shared golden path

| Requirement                                             | Status   | Current evidence                                                                                                                                                                                                                            | Missing proof                                                                                                     |
| ------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Synthetic Acme commercial evidence                      | VERIFIED | `fixtures/demo-enterprise/acme.json`; `packages/db/src/seed.ts`                                                                                                                                                                             | None for the fixture itself                                                                                       |
| Amendment #3 precedence and $312,000 arithmetic         | VERIFIED | `packages/domain/src/reconciliation.ts`; `packages/domain/src/reconciliation.test.ts`; `pnpm test`                                                                                                                                          | None for deterministic domain behavior                                                                            |
| PostgreSQL business state and ordered CaseEvents        | VERIFIED | `packages/db/src/schema.ts`; migration; and `packages/operations/src/index.integration.test.ts` passed against a freshly migrated/seeded isolated Cloud SQL database on 2026-08-29, including contiguous ordered event sequences            | None for the tested persistence/event-ordering boundary                                                           |
| Database-backed MCP reads and approved write            | PARTIAL  | TrueForge session `01m16k3tgzrad8ff8hc60hbjh5` captured live contract, CRM, and billing reads; operations integration tests prove the approved write                                                                                        | The live write is resumed by WorkerOS operations rather than a TrueForge MCP write event                          |
| Real ADK structured Contract Agent                      | VERIFIED | `services/adk-agents/agents.py`; live Vertex `gemini-3.5-flash` structured response; Python tests                                                                                                                                           | Deployment to Google Agent Runtime remains separate                                                               |
| TrueForge-supervised investigation                      | VERIFIED | Live session `01m16k3tgzrad8ff8hc60hbjh5`, turn `01m16k3th3vxgqa2th1kbnkkve.local`, terminal `turn.done`, Vertex model, and database-backed MCP evidence                                                                                    | Sandbox/Skill execution is tracked separately                                                                     |
| Meaningful TrueForge sandbox / Code Mode reconciliation | BLOCKED  | TrueForge attempted local sandbox creation on 2026-08-29                                                                                                                                                                                    | Host Homebrew Python 3.14 cannot load `pyexpat`, so TrueForge cannot create its `.venv`; no sandbox claim is made |
| Approval pause and exact persisted proposal             | VERIFIED | Live TrueForge output paused before mutation; case `CASE-1788001546232` persisted exact before/after terms and the UI required the server-derived Revenue Ops approval                                                                      | Production identity remains out of scope                                                                          |
| Idempotent billing mutation and reread verification     | VERIFIED | `packages/operations/src/index.integration.test.ts` proves one version increment, one mutation event, persisted approval consumption, retry reuse, successful resolution, and failed-verification non-resolution against isolated Cloud SQL | None for the tested operations boundary; full TrueForge run is tracked separately                                 |
| Resolved Case visible in UI                             | VERIFIED | Live case `CASE-1788001546232` showed eight ordered events, matched $1,332,000 billing, zero remaining leakage, verification passed, and `resolved`                                                                                         | `/fleet` still contains fixtures                                                                                  |
| Repeatable end-to-end golden run                        | PARTIAL  | `WORKEROS_RESET_DEMO=true` restores synthetic drift; one live TrueForge → MCP → Vertex/ADK → approval → mutation → reread → verification UI run completed                                                                                   | TrueForge sandbox/Skill and TrueForge-owned write resume remain incomplete                                        |

## WeMakeDevs / TrueForge judging

| Judging factor             | Status  | Evidence and honest assessment                                                                                                                                                                                                                                     |
| -------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Potential impact           | PARTIAL | Commercial Change Assurance demonstrates a concrete $312,000 synthetic annualized leakage case, but the complete supervised run is not yet captured.                                                                                                               |
| Creativity and originality | PARTIAL | Revenue integrity as a governed institutional worker is differentiated in the reference, Skill, domain model, and UI. Presentation proof is pending.                                                                                                               |
| Technical excellence       | PARTIAL | Strict TypeScript, Zod/Pydantic boundaries, deterministic finance logic, migrations, fail-closed operations, tests, and CI exist. Live orchestration and disposable-Postgres integration coverage remain.                                                          |
| Sponsor-tool usage         | PARTIAL | TrueForge SDK sessions and turn streaming are integrated in source. Live MCP, sandbox, subagent, approval, reconnect, and event-stream evidence is absent.                                                                                                         |
| Control and safety         | PARTIAL | Isolated Cloud SQL tests now prove unapproved/rejected/expired/tampered failures, one-time mutation, ordered events, and verification behavior. Server workspace authorization, specialist failure, and the same controls through live TrueForge still need proof. |
| Presentation               | PARTIAL | Operations-oriented Fleet, Cases, Case Detail, and Approvals screens exist. Fixture claims, a recorded golden run, and final videos remain.                                                                                                                        |

### Best Use of TrueForge proof

| Proof item                                              | Status      | Evidence / blocker                                                                                                                                           |
| ------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Real MCP tools                                          | PARTIAL     | Protocol-compliant SDK client and database-backed tools exist; no captured TrueForge tool run.                                                               |
| Generated or agent-directed code in sandbox / Code Mode | NOT_STARTED | No TrueForge sandbox execution exists.                                                                                                                       |
| Human approval before consequential action              | PARTIAL     | Persisted approval gate exists and the supervisor pause is tested; database mutation invariants and live TrueForge approval capture remain.                  |
| Genuine delegated/subagent work                         | PARTIAL     | Typed delegation to one Google ADK Contract Agent exists; no TrueForge-native Evidence QA subagent or live delegation capture.                               |
| Persistent TrueForge session surviving reconnect        | PARTIAL     | Case stores `trueforgeSessionId`; adapter supports reuse/retrieval; resume logic reads persisted state. Direct replay tests and live reconnect proof remain. |
| Skills / SOP                                            | PARTIAL     | `workers/revenue-integrity/skills/revenue-integrity/SKILL.md` exists; no event proves TrueForge loaded it.                                                   |
| Event stream                                            | PARTIAL     | SDK subscription and event mapping methods exist; events are not yet persisted from a live stream.                                                           |
| Structured final output                                 | PARTIAL     | Shared contracts and deterministic resolution exist; no live TrueForge structured completion is captured.                                                    |
| Real action                                             | PARTIAL     | A real approved mutation was executed and reread in an isolated Cloud SQL database; it has not yet been driven by a live TrueForge run.                      |
| Post-action verification                                | PARTIAL     | Cloud SQL tests prove both resolve-on-match and non-resolution-on-mismatch; live TrueForge/MCP end-to-end proof is missing.                                  |
| Qodo review history                                     | BLOCKED     | PR history and CI exist, but no verifiable Qodo installation or Qodo review is present. Configure the GitHub integration and preserve its review comments.   |

## Google All Things Agentic

### Eligibility

| Requirement                           | Status   | Evidence / blocker                                                                                                                                                                                                                 |
| ------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Autonomous agent beyond a chat loop   | PARTIAL  | Persisted Case workflow, tools, approval, mutation, and verification exist; live complete execution is blocked.                                                                                                                    |
| Gemini 3.5 or newer                   | VERIFIED | `services/adk-agents/agents.py` defaults to `gemini-3.5-flash`; on 2026-08-29 the Vertex-backed ADK endpoint in project `workeros-demo-20260825`, location `global`, returned HTTP 200 with five schema-valid Acme evidence facts. |
| Google ADK                            | VERIFIED | A real ADK `LlmAgent` with native structured output completed the same controlled `gemini-3.5-flash` call. This verifies the Contract Agent boundary only, not Agent Runtime deployment or the complete workflow.                  |
| Google Cloud infrastructure           | VERIFIED | Cloud SQL `workeros-postgres` was read on 2026-08-29 as `RUNNABLE`, PostgreSQL 18, `us-central1`; reproduce with the command in `docs/DEMO_EVIDENCE.md`.                                                                           |
| Application functions as demonstrated | PARTIAL  | A live local UI run completed through resolved verification on Cloud SQL; Google Agent Runtime deployment, sandbox proof, and final recording remain.                                                                              |

### Primary judging criteria

| Criterion                                     | Status  | Evidence and remaining work                                                                                                                                                |
| --------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Innovation and Operational Utility — 40%      | PARTIAL | High-value governed correction and deterministic impact are present. Prove the complete action and clarify the “unlikely hero” Revenue Operations positioning in the demo. |
| Architectural Discipline and Tech Stack — 30% | PARTIAL | WorkerOS, TrueForge, ADK, MCP, PostgreSQL, policy, and domain boundaries are separated. Google fleet services and live orchestration remain unproven.                      |
| Demo and Production Readiness — 30%           | PARTIAL | UI, setup docs, CI, Cloud SQL, and safety paths exist. Hosted/runtime proof, traces, repeatable smoke test, and video are absent.                                          |

### Fortified Enterprise Fleet

| Requirement                         | Status      | Current evidence                                                                                     | Missing proof                                                                      |
| ----------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Agent Registry                      | PARTIAL     | `workers/revenue-integrity/worker.yaml` and `/fleet` establish a local catalog concept               | Actual registry publication/version/discovery and persisted agent definitions      |
| Agent Runtime                       | BLOCKED     | ADK service can run locally                                                                          | Deployment to Google Agent Runtime and asynchronous execution ID                   |
| Memory Bank                         | NOT_STARTED | PostgreSQL correctly stores authoritative business state                                             | Non-authoritative cross-case memory integration and residency proof                |
| Agent Identity                      | PARTIAL     | Server-derived development approver session and scoped tool policy exist                             | Distinct production identities/IAM for each specialist and executor                |
| Agent Gateway                       | PARTIAL     | Enterprise MCP and deny-by-default policy provide an application boundary                            | Google Agent Gateway routing, identity, and explicit allow/deny proof              |
| Model Armor                         | NOT_STARTED | Structured validation reduces malformed-output risk                                                  | Inline prompt-injection/tool-poisoning/PII control and adversarial fixture proof   |
| Agent Observability / OpenTelemetry | PARTIAL     | Ordered CaseEvents and operational evidence exist                                                    | Trace context propagation and Google/OpenTelemetry trace capture                   |
| Multi-agent necessity               | PARTIAL     | Contract, Billing, and Policy roles are defined conceptually                                         | Real independent Billing and Policy ADK agents plus live delegation                |
| Long-running/asynchronous work      | PARTIAL     | Persisted Cases, TrueForge session IDs, approval pause, and persisted-state resume logic exist       | Direct replay tests, runtime execution, reconnect, and delayed resume capture      |
| Cross-department discoverability    | PARTIAL     | Agent owners/roles are described in project material                                                 | Real registry discovery and reuse workflow                                         |
| Governance                          | PARTIAL     | Sensitive writes are approval-gated, scoped, idempotent, and verified in tests                       | Production identity/gateway enforcement and live proof                             |
| Data handling and security          | PARTIAL     | Synthetic-only policy, PostgreSQL authority, secrets rules, and residency limitations are documented | Secret Manager, network controls, retention policy, and deployed boundary evidence |
| “Unlikely Hero” enterprise use case | PARTIAL     | Commercial Change Assurance serves Revenue Operations and Finance Controls                           | Final submission narrative and functioning demo                                    |

## Priority queue

1. **P0:** Configure the existing TrueForge tenant and prove one persistent session: MCP reads, Skill load, delegated ADK evidence, meaningful sandbox reconciliation, approval pause, reconnect, one write, reread, verification, and events.
2. **P0:** Repeat the Acme run from a clean seed and capture all artifacts in `docs/DEMO_EVIDENCE.md`.
3. **P1:** Add the smallest real Google enterprise fleet integrations in this order: Runtime, Registry, Identity, Observability, Memory Bank, Gateway, Model Armor. Mark unavailable services `BLOCKED` and continue.
4. **P1:** Replace `/fleet` fixtures, add disposable-Postgres integration tests, and configure Qodo before further meaningful PRs.

Bonus models, additional domains, graph infrastructure, a workflow builder, production SSO, and decorative dashboards remain deferred until the shared golden path is verified.
