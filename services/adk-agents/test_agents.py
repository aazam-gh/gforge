from agents import SpecialistResult, contract_agent, vertex_configured
def test_contract_agent_is_a_real_adk_definition():
    assert contract_agent.name == 'contract_agent'
    assert SpecialistResult.model_validate({'status':'ambiguous','confidence':0,'follow_up_required':True}).status == 'ambiguous'
def test_vertex_is_explicit_when_not_configured(monkeypatch):
    monkeypatch.delenv('GOOGLE_CLOUD_PROJECT', raising=False)
    assert vertex_configured() is False
