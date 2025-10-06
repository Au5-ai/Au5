from fastapi import APIRouter, Depends
from app.core.features.openai.assistants.create.request import CreateAssistantRequest, CreateAssistantResponse
from app.core.features.openai.assistants.create.handler import CreateAssistantHandler
from app.core.features.openai.assistants.create.deps import get_create_assistant_handler
from app.shared.result import Result

router = APIRouter()


@router.post(
    "",
    response_model=Result[CreateAssistantResponse, str],
    description="Create a new OpenAI assistant with specified configuration"
)
async def create_assistant(
    request: CreateAssistantRequest,
    handler: CreateAssistantHandler = Depends(get_create_assistant_handler)
):
    return await handler.handle(request)
    
    