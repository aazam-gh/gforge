# WorkerOS agent instructions

This file is the operating contract for Codex and other coding agents working in this repository. The canonical product and hackathon reference is the attached `WORKEROS_DUAL_HACKATHON_REFERENCE.md`; use it as the source of truth when a decision is not covered here.

## Product boundary

WorkerOS is an enterprise control plane for governed AI workers. The flagship worker is the Revenue Integrity Fleet. It is not a chatbot or a generic workflow builder.

- WorkerOS owns fleet catalog, worker definitions, cases, business policy, approvals, integrations, outcomes, and operator UI.
- TrueForge owns supervisor execution, Skills, MCP access, sandbox/Code Mode, approval gates, sessions, event streaming, and structured completion.
- Google ADK owns the Contract, Usage, and Billing specialist agents. Do not describe TrueForge-native subagents as Google ADK agents.
- The supervisor must delegate to ADK specialists through a typed MCP bridge or typed service adapter.

## Non-negotiable safety rules

- Never fake a successful external action, cloud deployment, approval, verification, or agent result.
- Sensitive billing writes fail closed without a persisted, valid approval.
- Rejection, timeout, missing evidence, malformed responses, and specialist failure must leave billing unchanged and remain visible.
- Re-read source systems after every approved correction; never mark a Case resolved without verification.
- Use synthetic/de-identified data only. Never commit secrets or personal/customer data.
- Do not expose chain-of-thought. Persist operational evidence, tool calls, structured findings, errors, and timestamps.
- Keep source-of-truth business state in PostgreSQL; active execution state belongs to TrueForge; durable cross-case context may belong to Google Memory Bank only when actually configured.

## Implementation rules

- Work in small feature branches and pull requests; do not push feature work directly to `main`.
- Every meaningful PR must include tests, documentation updates, and a verification note.
- Run `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before requesting review when those scripts are available.
- Use Zod or Pydantic at every service/agent boundary. Reject invalid specialist responses.
- Keep framework adapters separate from domain logic.
- Prefer a working vertical slice over broad scaffolding.
- Only mark a reference checkbox implemented when code and visible proof exist. Add `IMPLEMENTED:` notes with file paths to the relevant project document.

## Golden path

Seed Acme data → start TrueForge session → read contract/usage/billing through MCP → delegate to a real ADK specialist → reconcile deterministically in sandbox/Code Mode → request approval → execute approved billing write → re-read and verify → persist ordered CaseEvents → show the resolved Case in WorkerOS.

## Review posture

Treat Qodo findings as first-class review input. Fix legitimate findings before merge; document intentional rejections in the PR. Never use a giant final PR to hide missing review history.
