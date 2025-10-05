from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from app.core.features.openai.threads.run.deps import get_thread_run_handler
from app.core.features.openai.threads.run.handler import ThreadRunHandler
from app.core.features.openai.threads.run.request import RunThreadRequest
from app.shared.exceptions import ServiceException

router = APIRouter()


@router.post(
    "/runs",
    description="Create a thread with messages and stream the assistant's response in real-time."
)
async def create_run(
    request: RunThreadRequest,
    handler: ThreadRunHandler = Depends(get_thread_run_handler)
):
    result = await handler.handle(request)
    
    if result.is_failure():
        raise ServiceException(result.error)
    
    return StreamingResponse(
        result.data,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )