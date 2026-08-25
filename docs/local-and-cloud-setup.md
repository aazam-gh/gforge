# Commercial Change Assurance setup

The generated GCP project is `workeros-demo-20260825` in `us-central1`. Vertex AI and Cloud SQL APIs are enabled. This is synthetic demo data only.

## Cloud SQL

The Cloud SQL free-trial instance is live: `workeros-postgres` (PostgreSQL 18.4) in `us-central1`, with database `workeros`. Its connection name is `workeros-demo-20260825:us-central1:workeros-postgres`. The Drizzle migration and synthetic Acme seed were applied through Cloud SQL Studio on 2026-08-25. Keep the generated `postgres` password outside this repository.

For local development, install and run the Cloud SQL Auth Proxy with that connection name, then set `DATABASE_URL=postgres://postgres:YOUR_PASSWORD@127.0.0.1:5432/workeros` in an untracked `.env.local`. Do not use the public IP in application configuration. Future schema changes should use `pnpm db:migrate`; reseeding is safe with `pnpm db:seed`.

## Vertex ADK

Run `gcloud auth application-default login`, then export `GOOGLE_CLOUD_PROJECT=workeros-demo-20260825`, `GOOGLE_CLOUD_LOCATION=us-central1`, and `GOOGLE_GENAI_USE_VERTEXAI=true`. Start the agent with `pnpm adk:dev`. The Contract Agent uses ADK and validates its structured response before WorkerOS accepts evidence. Model Garden lists `gemini-3.6-flash` as serverless, but live ADC calls in `us-central1` returned `404 NOT_FOUND` for it as well as `gemini-3.5-flash` and `gemini-3-flash-preview`; use a model only after a live call succeeds in the required region. The service surfaces this as an execution failure and never substitutes output.

## TrueForge

Set `TRUEFORGE_BASE_URL`, `TRUEFORGE_TOKEN`, and `TRUEFORGE_AGENT_NAME` from the existing tenant. The adapter creates/continues a real SDK session only when all three are present. Its absence is deliberately surfaced as `TRUEFORGE_UNAVAILABLE`; it is never replaced with a fake run.
