from pydantic import BaseModel
class SpecialistResult(BaseModel):
    agent_id: str
    status: str = "not_configured"
    findings: list[str] = []
    evidence_refs: list[str] = []
class SpecialistAgent:
    def __init__(self, agent_id: str, purpose: str): self.agent_id, self.purpose = agent_id, purpose
    def analyze(self, _input: dict) -> SpecialistResult: return SpecialistResult(agent_id=self.agent_id)
contract_agent=SpecialistAgent('contract_agent','understands commercial contract terms')
usage_agent=SpecialistAgent('usage_agent','analyzes provisioned and consumed product usage')
billing_agent=SpecialistAgent('billing_agent','analyzes billing configuration and invoices')
