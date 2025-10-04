from fastapi import APIRouter, Depends, status
from app.core.features.openai.assistants.create.request import CreateAssistantRequest, CreateAssistantResponse
from app.core.features.openai.assistants.create.handler import CreateAssistantHandler
from app.core.features.openai.assistants.create.deps import get_create_assistant_handler

router = APIRouter()


@router.post(
    "/create",
    response_model=CreateAssistantResponse,
    status_code=status.HTTP_200_OK,
    description="Create a new OpenAI assistant with specified configuration"
)
async def create_assistant(
    request: CreateAssistantRequest,
    handler: CreateAssistantHandler = Depends(get_create_assistant_handler)
):
    return await handler.handle(request)
    
    