from typing import AsyncGenerator
from qdrant_client import QdrantClient

from app.shared.configuration.config import qdrant_settings

async def get_qdrant_client() -> AsyncGenerator[QdrantClient, None]:
    
    client = QdrantClient(
        host=qdrant_settings.host,
        port=qdrant_settings.port,
        timeout=10 # seconds
    )
    
    try:
        yield client
    finally:
        client.close()