from app.shared.configuration.common import BaseConfig

class AppConfig(BaseConfig):
    app_mode: str = "development"  