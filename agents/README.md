# WorkerOS agent contracts

The root execution agent is the TrueForge supervisor. Google ADK specialists are separate deployed agents and must be called through the ADK bridge boundary once implemented.

## Required specialist response

Every specialist returns structured data compatible with the following shape:

```json
{
  "agent": "billing_agent",
  "status": "completed",
  "summary": "Billing quantity is 2000 seats.",
  "facts": [{"key": "billing_seats", "value": 2000, "source": "billing_account"}],
  "risks": [],
  "confidence": 0.98,
  "requires_followup": false
}
```

Invalid responses must be rejected. Each specialist needs a timeout, bounded retry behavior, visible failure state, and an evidence reference. The supervisor must report incomplete evidence rather than infer a result.

See `services/adk-agents/` for the current placeholder interfaces and `docs/next-step-requirements.md` for the connected implementation milestone.
