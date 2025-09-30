from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import httpx

from app.api.models.openai import AssistantRequest, ThreadRunRequest
from app.api.utils.proxyHelper import get_base_url_and_key

router = APIRouter()


def build_headers(api_key: str) -> dict:
    """Build standard headers for OpenAI requests."""
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
        "OpenAI-Beta": "assistants=v2",
    }

async def post_to_openai(url: str, headers: dict, payload: dict) -> dict:
    """Helper for non-streaming POST requests to OpenAI."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        return resp.json()

@router.post("/threads/runs")
async def run_thread(request: ThreadRunRequest):
    """Proxy endpoint for running a thread with streaming support (SSE)."""
    base_url, api_key = get_base_url_and_key(request)
    url = f"{base_url.rstrip('/')}/threads/runs"
    headers = build_headers(api_key)

    payload = {
        "assistant_id": request.assistant_id,
        "thread": {
            "messages": [{"role": m.role, "content": m.content} for m in request.thread.messages]
        },
        "stream": request.stream,
    }

    async def event_stream():
        try:
            async with httpx.AsyncClient(timeout=None) as client:
                async with client.stream("POST", url, headers=headers, json=payload) as resp:
                    if resp.status_code != 200:
                        error_text = await resp.aread()
                        yield f"event: error\ndata: {error_text.decode()}\n\n"
                        return

                    async for line in resp.aiter_lines():
                        if line.strip():
                            yield f"data: {line}\n\n"
        except Exception as e:
            yield f"event: error\ndata: Internal server error: {str(e)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/assistants")
async def create_assistant(request: AssistantRequest):
    """Proxy endpoint for creating an assistant (non-streaming)."""
    base_url, api_key = get_base_url_and_key(request)
    url = f"{base_url.rstrip('/')}/assistants"
    headers = build_headers(api_key)

    payload = {
        "instructions": request.instructions,
        "name": request.name,
        "tools": request.tools,
        "model": request.model,
    }

    try:
        return await post_to_openai(url, headers, payload)
    except httpx.HTTPStatusError as e:
        return {"error": f"OpenAI API returned {e.response.status_code}: {e.response.text}"}
    except Exception as e:
        return {"error": f"Error communicating with OpenAI Assistants API: {str(e)}"}
