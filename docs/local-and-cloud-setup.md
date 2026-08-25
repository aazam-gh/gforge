# Commercial Change Assurance setup

The generated GCP project is `workeros-demo-20260825` in `us-central1`. Vertex AI and Cloud SQL APIs are enabled. This is synthetic demo data only.

## Cloud SQL

Google currently creates a Cloud SQL free-trial instance through the Cloud Console's **Get started** page, not the `gcloud sql instances create` command. Create a PostgreSQL free-trial instance named `workeros-postgres` in `us-central1`, create database `workeros`, and keep its password outside this repository. The trial is free for instance resources for 30 days but external data transfer and a final backup can incur charges. Delete it without a final backup when the demo ends.

Set `DATABASE_URL` using the Cloud SQL connection method approved for the instance. Then run `pnpm db:migrate` and `pnpm db:seed`.

## Vertex ADK

Run `gcloud auth application-default login`, then export `GOOGLE_CLOUD_PROJECT=workeros-demo-20260825`, `GOOGLE_CLOUD_LOCATION=us-central1`, and `GOOGLE_GENAI_USE_VERTEXAI=true`. Start the agent with `pnpm adk:dev`. The Contract Agent uses ADK and validates its structured response before WorkerOS accepts evidence. As of this implementation, Vertex returned `404 NOT_FOUND` for `gemini-3.5-flash`, `gemini-3.6-flash`, and `gemini-3-flash-preview` in this project and region; set `WORKEROS_GEMINI_MODEL` to the approved Gemini 3.5+ model once this project is granted access. The service surfaces this as an execution failure and never substitutes output.

## TrueForge

Set `TRUEFORGE_BASE_URL`, `TRUEFORGE_TOKEN`, and `TRUEFORGE_AGENT_NAME` from the existing tenant. The adapter creates/continues a real SDK session only when all three are present. Its absence is deliberately surfaced as `TRUEFORGE_UNAVAILABLE`; it is never replaced with a fake run.
