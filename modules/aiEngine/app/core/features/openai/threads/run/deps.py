from fastapi import Depends
from app.infrastructure.openai_client import OpenAIClient, get_openai_client
from app.core.features.openai.threads.run.handler import ThreadRunHandler


def get_thread_run_handler(
    openai_client: OpenAIClient = Depends(get_openai_client)
) -> ThreadRunHandler:
    return ThreadRunHandler(openai_client)
