# Commercial Change Assurance setup

The generated GCP project is `workeros-demo-20260825` in `us-central1`. Vertex AI and Cloud SQL APIs are enabled. This is synthetic demo data only.

## Cloud SQL

The Cloud SQL free-trial instance is live: `workeros-postgres` (PostgreSQL 18.4) in `us-central1`. Its connection name is `workeros-demo-20260825:us-central1:workeros-postgres`. The initial Drizzle migration and synthetic Acme seed were applied through Cloud SQL Studio on 2026-08-25. Keep the generated `postgres` password outside this repository.

The runnable harness uses a dedicated `workeros_runtime` user and its isolated `workeros_runtime` database, leaving the original `postgres` user and `workeros` database untouched. Run `pnpm mcp:cloud` to rotate the dedicated user's generated password in Cloud SQL, start the Auth Proxy if it is not already listening on port 5432, and launch MCP. The password remains only in the MCP process environment and is never written to disk. Do not use the public IP in application configuration. Future schema changes should use `pnpm db:migrate`; reseeding is safe with `pnpm db:seed`.

## Vertex ADK

Run `gcloud auth application-default login`, then export `GOOGLE_CLOUD_PROJECT=workeros-demo-20260825`, `GOOGLE_CLOUD_LOCATION=us-central1`, and `GOOGLE_GENAI_USE_VERTEXAI=true`. Start the agent with `pnpm adk:dev`. The Contract Agent uses ADK and validates its structured response before WorkerOS accepts evidence. Model Garden lists `gemini-3.6-flash` as serverless, but live ADC calls in `us-central1` returned `404 NOT_FOUND` for it as well as `gemini-3.5-flash` and `gemini-3-flash-preview`; use a model only after a live call succeeds in the required region. The service surfaces this as an execution failure and never substitutes output.

## TrueForge

Set `TRUEFORGE_BASE_URL`, `TRUEFORGE_TOKEN`, and `TRUEFORGE_AGENT_NAME` from the existing tenant. The adapter creates/continues a real SDK session only when all three are present. Its absence is deliberately surfaced as `TRUEFORGE_UNAVAILABLE`; it is never replaced with a fake run.
