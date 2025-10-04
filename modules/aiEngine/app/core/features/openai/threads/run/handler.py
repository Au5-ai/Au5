from typing import AsyncGenerator
from app.core.features.openai.threads.run.request import RunThreadRequest
from app.infrastructure.openai_client import OpenAIClient
from app.shared.result import Result


class ThreadRunHandler: 
    def __init__(self, openai_client: OpenAIClient):
        self.openai_client = openai_client
    
    async def handle(self, request: RunThreadRequest) -> Result[AsyncGenerator, str]:

        try:
            if request.stream:
                return Result.success(self._handle_stream(request))
            else:
                return Result.success(await self._handle_non_stream(request))
            
        except Exception as e:
            return Result.failure(f"Failed to run Thread")
    
    async def _handle_non_stream(self, request: RunThreadRequest):
        params = {
            "thread_id": request.thread_id,
            "assistant_id": request.assistant_id
        }
        
        if request.instructions:
            params["instructions"] = request.instructions
        if request.additional_instructions:
            params["additional_instructions"] = request.additional_instructions
        if request.tools:
            params["tools"] = request.tools
        if request.metadata:
            params["metadata"] = request.metadata
        
        run = await self.openai_client.client(**request.to_proxy_params()).beta.threads.create_and_run()
        
        return 1
    
    async def _handle_stream(self, request: CreateRunRequest) -> AsyncGenerator[str, None]:
        """Handle streaming run"""
        params = {
            "thread_id": request.thread_id,
            "assistant_id": request.assistant_id
        }
        
        if request.instructions:
            params["instructions"] = request.instructions
        if request.additional_instructions:
            params["additional_instructions"] = request.additional_instructions
        
        async with self.openai_client.client.beta.threads.runs.stream(**params) as stream:
            async for event in stream:
                if hasattr(event, 'data'):
                    yield f"event: {event.event}\ndata: {event.data}\n\n"
                else:
                    yield f"event: {type(event).__name__}\n\n"