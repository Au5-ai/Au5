 
from fastapi import APIRouter
from app.shared.configuration.config import openai_settings
from app.shared.result import Result
import httpx
from app.api.models.openai import AssistantRequest

router = APIRouter()

@router.post("/assistants")
async def create_assistant(request: AssistantRequest):
    base_url = request.proxy_url if request.proxy_url else openai_settings.api_url
    url = f"{base_url.rstrip('/')}/assistants"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {request.apiKey or openai_settings.api_key}",
        "OpenAI-Beta": "assistants=v2"
    }
    payload = {
        "instructions": request.instructions,
        "name": request.name,
        "tools": request.tools,
        "model": request.model
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            return resp.json()
    except Exception as e:
        return {"error": f"Error communicating with OpenAI Assistants API: {str(e)}"}
