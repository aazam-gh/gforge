from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from agents import MODEL, analyze_contract, vertex_configured
from vertex_proxy import vertex_chat_completions
app = FastAPI(title='WorkerOS ADK specialists')
class ContractRequest(BaseModel): documents: list[dict]
@app.get('/health')
def health():
    return {
        'service': 'workeros-adk-agents',
        'contract_agent': 'configured' if vertex_configured() else 'unavailable',
        'model': MODEL,
    }
@app.post('/v1/contract-analysis')
async def contract_analysis(request: ContractRequest):
    try: return (await analyze_contract(request.documents)).model_dump(by_alias=True)
    except RuntimeError as error: raise HTTPException(status_code=503, detail=str(error)) from error

@app.post('/v1/chat/completions')
async def chat_completions(request: Request):
    return await vertex_chat_completions(await request.json())
