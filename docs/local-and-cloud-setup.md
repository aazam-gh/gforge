# Commercial Change Assurance setup

The generated GCP project is `workeros-demo-20260825` in `us-central1`. Vertex AI and Cloud SQL APIs are enabled. This is synthetic demo data only.

## Cloud SQL

The Cloud SQL free-trial instance is live: `workeros-postgres` (PostgreSQL 18.4) in `us-central1`. Its connection name is `workeros-demo-20260825:us-central1:workeros-postgres`. The initial Drizzle migration and synthetic Acme seed were applied through Cloud SQL Studio on 2026-08-25. Keep the generated `postgres` password outside this repository.

The runnable harness uses a dedicated `workeros_runtime` user and its isolated `workeros_runtime` database, leaving the original `postgres` user and `workeros` database untouched. Run `pnpm mcp:cloud` to rotate the dedicated user's generated password in Cloud SQL, start the Auth Proxy if it is not already listening on port 5432, and launch MCP. The password remains only in the MCP process environment and is never written to disk. Do not use the public IP in application configuration. Future schema changes should use `pnpm db:migrate`; reseeding is safe with `pnpm db:seed`.

## Vertex ADK

Run `gcloud auth application-default login`, then export `GOOGLE_CLOUD_PROJECT=workeros-demo-20260825`, `GOOGLE_CLOUD_LOCATION=global`, and `GOOGLE_GENAI_USE_VERTEXAI=true`. Start the agent with `pnpm adk:dev`. The Contract Agent uses Vertex AI's `gemini-3-flash-preview` and ADK's native output schema to validate structured output before WorkerOS accepts evidence. This combination completed a live ADC smoke test on 2026-08-25. The former `us-central1` configuration returned `404 NOT_FOUND` for `gemini-3.5-flash`, `gemini-3.6-flash`, and `gemini-3-flash-preview`; do not revert to it without a new live test. The service surfaces execution and schema failures explicitly and never substitutes output.

## TrueForge

For the Day One live UI, export the configured TrueForge tenant values without
committing them, then run `pnpm day-one:dev`. The launcher shares the isolated
Cloud SQL runtime connection with the web app and MCP, checks the ADK health
endpoint, and refuses to run without the TrueForge base URL and agent name. It
never prints or persists a token.

Set `TRUEFORGE_BASE_URL` and `TRUEFORGE_AGENT_NAME` from the existing local or remote tenant. Add `TRUEFORGE_TOKEN` only when authentication is enabled. The adapter creates/continues a real SDK session only when the endpoint and agent are present. Its absence is deliberately surfaced as `TRUEFORGE_UNAVAILABLE`; it is never replaced with a fake run.
