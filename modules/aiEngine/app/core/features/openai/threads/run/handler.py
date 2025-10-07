from typing import AsyncGenerator, Any
from app.core.features.openai.threads.run.request import RunThreadRequest
from app.infrastructure.openai_client import OpenAIClient
from app.shared.result import Result
from app.core.features.openai.threads.run.stream_event import StreamEventFactory, StreamEventType, StreamEvent


class ThreadRunHandler: 
    def __init__(self, openai_client: OpenAIClient):
        self.openai_client = openai_client
    
    async def handle(self, request: RunThreadRequest) -> Result[Any, str]:

        try:
            return Result.success(self._handle_stream(request))
        except Exception as e:
            return Result.failure(f"Failed to run thread")
    
    async def _handle_stream(self, request: RunThreadRequest) -> AsyncGenerator[str, None]:
        
        try:
            async with self.openai_client.client(**request.to_proxy_params()).beta.threads.create_and_run_stream(**request.to_openai_params()) as stream:
                async for event in stream:
                    yield f"data: {event.model_dump_json(exclude_none=True)}\n\n"
                
                # Send done signal
                done_event = StreamEvent(type=StreamEventType.DONE)
                yield f"data: {done_event.model_dump_json(exclude_none=True)}\n\n"
        
        except Exception as e:
            # Send error event
            error_event = StreamEvent(
                type=StreamEventType.ERROR,
                error=str(e),
                details={"exception_type": type(e).__name__}
            )
            yield f"data: {error_event.model_dump_json(exclude_none=True)}\n\n"
    