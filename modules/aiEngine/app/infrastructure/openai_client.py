from openai import AsyncOpenAI
from app.shared.configuration.config import openai_settings


class OpenAIClient:
    """Wrapper for OpenAI client - Injectable"""
    
    def __init__(self):
        self._api_key = openai_settings.api_key
        self._url = openai_settings.api_url
        self._client = None
    
    def client(self, api_key: str = None, proxy_url: str = None) -> AsyncOpenAI:
        if self._client is None:
            self._client = AsyncOpenAI(api_key= api_key or self._api_key, base_url= proxy_url or self._url)
        return self._client


def get_openai_client() -> OpenAIClient:
    """Get OpenAI client instance"""
    return OpenAIClient()