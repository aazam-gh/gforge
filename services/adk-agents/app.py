from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from agents import analyze_contract, vertex_configured
app = FastAPI(title='WorkerOS ADK specialists')
class ContractRequest(BaseModel): documents: list[dict]
@app.get('/health')
def health(): return {'service': 'workeros-adk-agents', 'contract_agent': 'configured' if vertex_configured() else 'unavailable'}
@app.post('/v1/contract-analysis')
async def contract_analysis(request: ContractRequest):
    try: return (await analyze_contract(request.documents)).model_dump()
    except RuntimeError as error: raise HTTPException(status_code=503, detail=str(error)) from error
