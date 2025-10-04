from app.core.features.openai.assistants.create.request import (
    CreateAssistantRequest,
    CreateAssistantResponse
)
from app.shared.result import Result
from app.infrastructure.openai_client import OpenAIClient
import logging

logger = logging.getLogger(__name__) 

class CreateAssistantHandler:

    def __init__(self, openai_client: OpenAIClient):
        self.openai_client = openai_client
    
    async def handle(self, request: CreateAssistantRequest) -> Result[CreateAssistantResponse, str]:
        
        try:
            
            assistant = await self.openai_client.client(**request.to_proxy_params()).beta.assistants.create(**request.to_openai_params())
            
            response = CreateAssistantResponse(
                assistant_id=assistant.id,
            )
            
            return Result.success(response)
            
        except Exception as e:
            logger.error(f"Failed to create assistant: {e}", exc_info=True)
            return Result.failure("failed to create assistant")