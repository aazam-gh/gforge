# PR review playbook

Use this sequence to build review history for the TrueForge Best Code Quality track:

1. `chore: scaffold WorkerOS monorepo`
2. `feat: add core data model and synthetic revenue dataset`
3. `feat: add enterprise MCP service`
4. `feat: integrate TrueForge supervisor`
5. `feat: add Google ADK specialist agents`
6. `feat: add case event stream and investigation UI`
7. `feat: add approval-gated billing correction`
8. `feat: add sandbox reconciliation and verification`
9. `test: add golden-path and safety evaluations`
10. `docs: deployment, security, architecture, demo`

For each PR, Qodo should review the actual diff. The author should fix valid findings, explain rejected findings, and preserve the review discussion. Do not create a single final PR containing all features, and do not merge directly to `main`.

The quality gate is: lint, format check, TypeScript typecheck, unit tests, integration tests, Python tests, production build, clean-clone setup, and secret scan.
