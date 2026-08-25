import asyncio
import json
import os
from typing import Literal
from google.adk.agents import Agent
from google.adk.models import Gemini
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from pydantic import BaseModel, ConfigDict, Field, ValidationError

MODEL = os.getenv('WORKEROS_GEMINI_MODEL', 'gemini-3-flash-preview')
TIMEOUT_SECONDS = float(os.getenv('WORKEROS_ADK_TIMEOUT_SECONDS', '120'))
APP_NAME = 'workeros_contract_assurance'
class EvidenceReference(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    document_id: str = Field(alias='documentId')
    clause_id: str = Field(alias='clauseId')
    effective_from: str = Field(alias='effectiveFrom')
    extracted_value: str | int | bool = Field(alias='extractedValue')
    source: Literal['contract', 'amendment']
class SpecialistResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    agent_id: Literal['contract_agent'] = Field('contract_agent', alias='agentId')
    status: Literal['completed', 'failed', 'ambiguous']
    commercial_facts: list[EvidenceReference] = Field(default_factory=list, alias='commercialFacts')
    confidence: float = Field(ge=0, le=1)
    conflicts: list[str] = Field(default_factory=list)
    follow_up_required: bool = Field(alias='followUpRequired')
    error: str | None = None
CONTRACT_INSTRUCTION = """You are WorkerOS's Contract Agent. Extract only commercial facts explicitly present in supplied governing agreement text. Return JSON matching the requested schema. Preserve document IDs, clause IDs, and effective dates. Never calculate invoices, decide precedence, or propose any billing mutation. If a term is missing, contradictory, or unclear, return status 'ambiguous', describe conflicts, and set follow_up_required true."""
contract_agent = Agent(
    name='contract_agent',
    model=Gemini(model=MODEL, retry_options=types.HttpRetryOptions(attempts=2)),
    instruction=CONTRACT_INSTRUCTION,
    output_schema=SpecialistResult,
)
def vertex_configured() -> bool:
    return bool(os.getenv('GOOGLE_CLOUD_PROJECT') and os.getenv('GOOGLE_CLOUD_LOCATION') and os.getenv('GOOGLE_GENAI_USE_VERTEXAI', '').lower() == 'true')
async def analyze_contract(documents: list[dict]) -> SpecialistResult:
    if not vertex_configured(): raise RuntimeError('VERTEX_ADK_UNAVAILABLE: configure GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, and GOOGLE_GENAI_USE_VERTEXAI=true')
    session_service = InMemorySessionService()
    session = await session_service.create_session(app_name=APP_NAME, user_id='workeros-supervisor')
    runner = Runner(app_name=APP_NAME, agent=contract_agent, session_service=session_service)
    prompt = json.dumps({'documents': documents, 'response_schema': SpecialistResult.model_json_schema()})
    async def run() -> str:
        final_text = ''
        async for event in runner.run_async(user_id='workeros-supervisor', session_id=session.id, new_message=types.Content(role='user', parts=[types.Part(text=prompt)])):
            if event.is_final_response() and event.content and event.content.parts: final_text = ''.join(part.text or '' for part in event.content.parts)
        return final_text
    try: return SpecialistResult.model_validate_json(await asyncio.wait_for(run(), timeout=TIMEOUT_SECONDS))
    except TimeoutError as error: raise RuntimeError('CONTRACT_AGENT_TIMEOUT') from error
    except (ValidationError, json.JSONDecodeError) as error: raise RuntimeError('CONTRACT_AGENT_INVALID_RESPONSE') from error
    except Exception as error: raise RuntimeError('CONTRACT_AGENT_EXECUTION_FAILED') from error
class SpecialistAgent:
    def __init__(self, agent_id: str, purpose: str): self.agent_id, self.purpose = agent_id, purpose
    def analyze(self, _input: dict): raise RuntimeError(f'{self.agent_id.upper()}_NOT_CONFIGURED')
usage_agent = SpecialistAgent('usage_agent', 'analyzes provisioned and consumed product usage')
billing_agent = SpecialistAgent('billing_agent', 'analyzes billing configuration and invoices')
