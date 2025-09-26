from .base import BaseConfig
from pydantic import Field

class OpenAIConfig(BaseConfig):
    api_key: str = Field(validation_alias="OPENAI_API_KEY")
    api_url: str = Field(validation_alias="OPENAI_API_URL")