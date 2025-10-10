from pydantic import Field
from app.shared.configuration.common import BaseConfig

        
class QdrantConfig(BaseConfig):
    host: str = Field(validation_alias="QDRANT_HOST")
    port: str = Field(validation_alias="QDRANT_PORT")