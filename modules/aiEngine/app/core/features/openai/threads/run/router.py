from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from app.features.openai.threads.create_run.request import (
    CreateRunRequest,
    CreateRunResponse
)
from app.features.openai.threads.create_run.handler import CreateRunHandler
from app.features.openai.threads.create_run.dependencies import get_create_run_handler
from app.core.exceptions import ServiceException

router = APIRouter()


@router.post(
    "",
    summary="Create Run",
    description="Create a run with streaming or non-streaming mode"
)
async def create_run(
    request: CreateRunRequest,
    handler: CreateRunHandler = Depends(get_create_run_handler)
):
    """Create a run"""
    result = await handler.handle(request)
    
    if result.is_failure():
        raise ServiceException(result.error)
    
    if request.stream:
        return StreamingResponse(
            result.value,
            media_type="text/event-stream"
        )
    else:
        return result.value