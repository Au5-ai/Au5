from pydantic import Field
from app.shared.configuration.common import BaseConfig

class OpenAIConfig(BaseConfig):
    api_key: str = Field(validation_alias="OPENAI_API_KEY")
    api_url: str = Field(validation_alias="OPENAI_API_URL")
    model: str = Field(validation_alias="OPENAI_MODEL")