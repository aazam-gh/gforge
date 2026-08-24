# WorkerOS

WorkerOS is an enterprise control plane for governed AI workers. The initial demo is a Revenue Integrity Fleet that reconciles contracts, usage, CRM, entitlements, and billing while keeping financially material writes behind an explicit human approval gate.

## Quick start

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

The UI runs at `http://localhost:3000`. See `docs/architecture.md` for the local topology. This repository contains synthetic demo data only. TrueForge and Vertex AI calls are not faked; adapters report an explicit unavailable state until configured.
