# Enterprise MCP service instructions

- Use actual PostgreSQL/Cloud SQL state through the database package once implemented; never hard-code successful source responses.
- Keep the six reads structured and scoped by workspace/account.
- `update_billing_quantity` is sensitive and must require a valid approval reference from the TrueForge-controlled path.
- `add_crm_note` is auditable even when considered a safe write.
- Every write must be idempotent, emit a CaseEvent, and leave zero state change on rejection or malformed input.
- Tool descriptions must state read/write semantics, data scope, side effects, and approval requirements.
- No MCP tool may log secrets, private data, or hidden model reasoning.
