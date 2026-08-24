# Security notes

Demo data is synthetic. Enterprise tools must be scoped per worker and account. `update_billing_quantity` is a sensitive write and must only be invoked after a persisted human approval event from TrueForge. Store secrets outside the repository; client-side environment variables are never suitable for credentials. Production work should add identity, audit retention, secret management, network policy, and database migrations before deployment.
