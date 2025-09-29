from .base import BaseConfig

class AppConfig(BaseConfig):
    app_mode: str = "development"  # Default to development mode