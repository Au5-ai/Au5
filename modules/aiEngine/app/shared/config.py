from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    openai_api_url: str

    class Config:
        env_file = ".env"