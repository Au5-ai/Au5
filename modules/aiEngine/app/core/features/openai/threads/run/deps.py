from fastapi import Depends
from app.infrastructure.openai_client import OpenAIClient, get_openai_client
from app.core.features.openai.threads.run.handler import ThreadRunHandler


def get_create_run_handler(
    openai_client: OpenAIClient = Depends(get_openai_client)
) -> ThreadRunHandler:
    """Dependency injection for handler"""
    return ThreadRunHandler(openai_client)
