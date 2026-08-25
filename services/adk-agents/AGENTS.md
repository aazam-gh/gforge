# ADK agent service instructions

- Use Google ADK for Contract, Usage, and Billing specialists. Do not replace these with generic chat endpoints.
- Use Gemini 3.5+ only after the model/project configuration is real and documented.
- Return typed Pydantic results; prose-only responses are invalid.
- Specialists investigate and report evidence; the TrueForge supervisor owns orchestration, approval, and final Case state.
- Never execute billing writes from an ADK specialist.
- Missing credentials, timeout, malformed output, or unavailable source data must produce an explicit failure/incomplete result.
- Do not claim Agent Runtime, Memory Bank, IAM, Model Armor, or Cloud Observability until configured and demonstrated.
