from fastapi import Depends
from app.core.features.openai.assistants.create.handler import CreateAssistantHandler
from app.infrastructure.openai_client import OpenAIClient, get_openai_client


def get_create_assistant_handler(
        openai_client: OpenAIClient = Depends(get_openai_client)
        ) -> CreateAssistantHandler:
    return CreateAssistantHandler(openai_client)