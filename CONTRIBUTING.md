# Contributing to WorkerOS

WorkerOS is developed as a sequence of reviewable pull requests. Start from a clean clone, install Node 22+ and pnpm, then run:

```bash
pnpm install
pnpm build
pnpm test
```

## Branches and pull requests

Use a focused branch such as `feat/mcp-enterprise-reads` or `fix/approval-idempotency`. Keep each PR narrow enough that a reviewer can understand the behavior and its safety implications.

Each PR must include:

- the user-visible or system behavior changed;
- the files and boundaries affected;
- tests and commands run;
- security/approval impact;
- documentation or fixture updates;
- known limitations and explicit unimplemented external integrations.

Run Qodo on every meaningful PR. Fix legitimate findings before merge and explain intentional exceptions in the PR conversation. Merge only after CI and review are green.

## Definition of done

No feature is done because it compiles alone. It must have typed boundaries, failure behavior, tests, documentation, and evidence that it does not bypass approval or claim an unavailable external capability.

## Data and secrets

Use only synthetic fixtures locally. Keep credentials in local environment files or a secret manager; never commit `.env` files, tokens, private keys, production identifiers, or customer data.
