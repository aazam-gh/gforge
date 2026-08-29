# WorkerOS

WorkerOS is an enterprise control plane for governed AI workers. The first Revenue Integrity Fleet segment is Commercial Change Assurance: it establishes effective commercial terms from governing evidence, finds operational drift, and applies a human-approved correction only after verification.

The repository source of truth is `WORKEROS_DUAL_HACKATHON_REFERENCE.md`. Current capability status and proof are tracked in `docs/HACKATHON_SCORECARD.md` and `docs/DEMO_EVIDENCE.md`; planned Google or TrueForge integrations are never presented as implemented.

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm db:migrate
pnpm db:seed
pnpm dev
```

The UI runs at `http://localhost:3000`; MCP runs on `http://localhost:4000/mcp`; ADK runs on port 8001. This repository contains synthetic demo data only. TrueForge and Vertex AI calls are not faked; adapters report explicit unavailable states until configured. See `docs/local-and-cloud-setup.md` for the Cloud SQL and external-service setup.
