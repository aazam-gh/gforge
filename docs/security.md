# Security and data residency

This is a hackathon prototype using synthetic Acme data. It does not claim production certification, guaranteed data sovereignty, enterprise SSO, or a completed zero-trust deployment.

## Current locations and limitations

| Component                           | Current location              | Status and limitation                                                                                                                                                                                 |
| ----------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cloud SQL `workeros-postgres`       | `us-central1`                 | Running PostgreSQL business-state infrastructure. Public application access is not the intended path; local development uses Cloud SQL Auth Proxy.                                                    |
| WorkerOS web, MCP, and ADK services | Developer machine             | Not deployed as hosted production services.                                                                                                                                                           |
| Gemini Vertex endpoint              | Configured target: `global`   | Vertex AI was disabled at the 2026-08-29 audit. The current model default is not proven eligible and no current data transfer is occurring. A global endpoint must not be described as region-pinned. |
| Google Agent Runtime                | None                          | Not deployed; no runtime residency claim is possible.                                                                                                                                                 |
| Google Memory Bank                  | None                          | Not configured; no memory location or retention claim is possible.                                                                                                                                    |
| Google Cloud Logging / Trace        | Project audit logs only       | Application OpenTelemetry export and regional log-retention controls are not configured.                                                                                                              |
| TrueForge tenant                    | External configuration absent | No current authenticated execution or tenant residency evidence is recorded.                                                                                                                          |

## Data flow and trust boundaries

1. The WorkerOS server reads/writes authoritative synthetic business state through PostgreSQL.
2. TrueForge, when configured, supervises execution and requests tools; it must not receive browser-held credentials.
3. Enterprise MCP validates structured tool input and is the only application boundary allowed to expose business reads and approved writes.
4. ADK specialists receive only the evidence required for their role and return structured findings. They have no mutation tools.
5. A consequential write loads the persisted Case, proposal, approval, and exact before/after terms server-side. Caller-supplied identity or correction terms are not authoritative.
6. After mutation, the system rereads authoritative billing and resolves the Case only when verification matches.

## Controls implemented in source

- Synthetic/de-identified data only; no real customer or personal data may be committed or demonstrated.
- Zod/Pydantic validation at service and agent boundaries.
- Tool allowlisting and sensitive-write classification.
- Server-derived approver identity, workspace authorization, and Revenue Operations role check for the development approval path.
- Persisted approval with expiry, exact proposal binding, atomic consumption, and idempotency.
- Ordered CaseEvents for operational evidence. Hidden chain-of-thought is neither requested nor stored.
- Explicit failure for unavailable TrueForge/Vertex services; no simulated external success.

## Secrets

Credentials belong in environment configuration or a managed secret service. Never commit TrueForge tokens, database passwords, ADC files, service-account keys, or billing credentials. Client-visible environment variables are never suitable for secrets. The Cloud SQL launcher rotates a dedicated runtime password and keeps it process-local.

Secret Manager, production workload identity, private networking, TLS termination, audit retention, data-loss prevention, Agent Identity, Agent Gateway, and Model Armor remain unimplemented. They must stay `PARTIAL`, `NOT_STARTED`, or `BLOCKED` in the scorecard until deployment evidence exists.
