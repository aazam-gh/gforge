from agents import billing_agent, SpecialistResult
def test_specialist_has_typed_result():
    assert isinstance(billing_agent.analyze({}), SpecialistResult)
    assert billing_agent.analyze({}).status == 'not_configured'
