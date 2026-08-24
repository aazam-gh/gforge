# Next implementation step: connected Revenue Integrity slice

The scaffold is intentionally safe and mostly read-only. The next step should make one end-to-end Acme investigation real while preserving the approval boundary.

## Required engineering work

- Add `packages/db` using Drizzle ORM and PostgreSQL migrations for Workspace, Worker, AgentDefinition, AgentVersion, Case, CaseEvent, Approval, Integration, and Policy.
- Add a seed command that inserts the synthetic Acme Corp dataset: 2,800 contracted seats, 2,800 provisioned seats, 2,734 active seats, 2,800 CRM seats, 2,000 billed seats, and a documented price/impact calculation.
- Replace the MCP development responses with PostgreSQL queries and mutations through `packages/db`.
- Expose the MCP server over HTTP using the official MCP TypeScript transport, with request validation, structured tool metadata, and an explicit sensitive-write policy check.
- Add integration tests against a disposable PostgreSQL instance for all six read tools and both write tools. Assert that billing quantity writes fail without an approval reference.
- Implement the ADK service’s health route and typed specialist endpoints. Configure Gemini through Vertex AI only after a GCP project, region, model, service account, and secret delivery method are selected.
- Implement the TrueForge adapter against the pinned SDK version: session reuse, turn submission, event subscription, approval response, session retrieval, and event-to-CaseEvent mapping. Add contract tests with recorded SDK fixtures; do not treat unavailable credentials as success.
- Add the root TrueForge supervisor flow that delegates to the three ADK specialists, persists a Case and CaseEvents, calculates impact deterministically, pauses for approval, executes the approved write, and independently verifies billing state.
- Connect the Next.js routes to persisted case data and live event updates. Replace placeholder actions with server-side mutations and visible loading, error, empty, and approval states.

## Required security and operations decisions

- Choose identity and roles for case viewers, investigators, approvers, and administrators.
- Define account/workspace scoping and enforce it in MCP queries, policies, and UI mutations.
- Store DATABASE_URL, TrueForge credentials, GCP credentials, and MCP signing/auth material in a secret manager; never expose them to the browser.
- Define audit retention, approval expiration/revocation, idempotency keys, retry behavior, and rollback behavior for billing writes.
- Add structured logs, trace IDs, case correlation IDs, metrics, and redaction rules for enterprise data.
- Decide local Docker Compose topology and GCP deployment targets for the web, MCP, and ADK services.
- Add CI services for PostgreSQL, Python tests, TypeScript tests, migrations, and a production build.

## Acceptance criteria

1. A seeded local database can be queried through the real HTTP MCP endpoint.
2. A single Acme run produces a durable case with evidence from all five sources.
3. The calculated annual impact is reproducible from stored values.
4. `update_billing_quantity` cannot execute until a human approval is persisted and validated.
5. The approved correction is independently re-read and recorded as verified.
6. The UI shows the real case, event timeline, evidence, pending approval, and verification result.
7. Tests pass with no network credentials, while configured integration tests prove the connected path.
