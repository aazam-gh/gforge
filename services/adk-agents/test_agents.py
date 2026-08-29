from agents import DEFAULT_MODEL, SpecialistResult, contract_agent, vertex_configured

def test_default_model_meets_hackathon_eligibility():
    assert DEFAULT_MODEL == 'gemini-3.5-flash'

def test_contract_agent_is_a_real_adk_definition():
    assert contract_agent.name == 'contract_agent'
    assert contract_agent.output_schema is SpecialistResult
    assert SpecialistResult.model_validate({'status':'ambiguous','confidence':0,'follow_up_required':True}).status == 'ambiguous'
    assert SpecialistResult.model_validate({'status':'ambiguous','confidence':0,'followUpRequired':True}).model_dump(by_alias=True)['followUpRequired'] is True
def test_vertex_is_explicit_when_not_configured(monkeypatch):
    monkeypatch.delenv('GOOGLE_CLOUD_PROJECT', raising=False)
    assert vertex_configured() is False
