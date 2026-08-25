# WorkerOS

WorkerOS is an enterprise control plane for governed AI workers. The first Revenue Integrity Fleet segment is Commercial Change Assurance: it establishes effective commercial terms from governing evidence, finds operational drift, and applies a human-approved correction only after verification.

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm db:migrate
pnpm db:seed
pnpm dev
```

The UI runs at `http://localhost:3000`; MCP runs on `http://localhost:4000/mcp`; ADK runs on port 8001. This repository contains synthetic demo data only. TrueForge and Vertex AI calls are not faked; adapters report explicit unavailable states until configured. Cloud SQL free-trial creation currently requires the Cloud Console; see `docs/local-and-cloud-setup.md`.
