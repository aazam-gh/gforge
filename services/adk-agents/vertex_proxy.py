import os
from typing import Any

import anyio
import google.auth
from google.auth.transport.requests import Request as GoogleAuthRequest
import httpx
from fastapi import HTTPException, Response
from fastapi.responses import StreamingResponse

PROJECT_ID = os.getenv('GOOGLE_CLOUD_PROJECT', '')
LOCATION = os.getenv('GOOGLE_CLOUD_LOCATION', 'global')
MODEL = os.getenv('WORKEROS_ADK_MODEL', 'gemini-3.5-flash')
THOUGHT_SIGNATURE_BYPASS = 'skip_thought_signature_validator'


def preserve_missing_thought_signatures(payload: dict[str, Any]) -> dict[str, Any]:
    """Repair history produced by clients that discard Gemini tool metadata."""
    for message in payload.get('messages', []):
        if message.get('role') != 'assistant':
            continue
        tool_calls = message.get('tool_calls') or []
        if not tool_calls:
            continue
        first = tool_calls[0]
        google = first.setdefault('extra_content', {}).setdefault('google', {})
        google.setdefault('thought_signature', THOUGHT_SIGNATURE_BYPASS)
    return payload


async def _access_token() -> str:
    credentials, _ = google.auth.default(
        scopes=['https://www.googleapis.com/auth/cloud-platform']
    )
    await anyio.to_thread.run_sync(credentials.refresh, GoogleAuthRequest())
    if not credentials.token:
        raise RuntimeError('VERTEX_ADC_TOKEN_MISSING')
    return credentials.token


async def vertex_chat_completions(payload: dict[str, Any]):
    if not PROJECT_ID:
        raise HTTPException(status_code=503, detail='GOOGLE_CLOUD_PROJECT is required')
    if payload.get('model') not in {MODEL, f'google/{MODEL}'}:
        raise HTTPException(status_code=400, detail='VERTEX_MODEL_NOT_ALLOWED')
    payload['model'] = f'google/{MODEL}'
    preserve_missing_thought_signatures(payload)
    token = await _access_token()
    url = (
        'https://aiplatform.googleapis.com/v1/projects/'
        f'{PROJECT_ID}/locations/{LOCATION}/endpoints/openapi/chat/completions'
    )
    client = httpx.AsyncClient(timeout=httpx.Timeout(120.0))
    upstream_request = client.build_request(
        'POST',
        url,
        headers={
            'authorization': f'Bearer {token}',
            'content-type': 'application/json',
        },
        json=payload,
    )
    upstream = await client.send(upstream_request, stream=True)
    if upstream.status_code >= 400:
        content = await upstream.aread()
        media_type = upstream.headers.get('content-type', 'application/json')
        await upstream.aclose()
        await client.aclose()
        return Response(content=content, status_code=upstream.status_code, media_type=media_type)

    async def body():
        try:
            # httpx decodes the upstream gzip here. Do not forward compressed
            # bytes without the matching content-encoding header: SSE clients
            # would see binary data and miss the terminal finish_reason.
            async for chunk in upstream.aiter_bytes():
                yield chunk
        finally:
            await upstream.aclose()
            await client.aclose()

    return StreamingResponse(
        body(),
        status_code=upstream.status_code,
        media_type=upstream.headers.get('content-type', 'text/event-stream'),
    )
