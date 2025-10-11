
from fastapi import Depends
from qdrant_client import QdrantClient

from app.core.contracts.vector_db.vector_database import IVectorDatabase
from app.infrastructure.vector_db.qdrant_adapter import QdrantAdapter
from app.infrastructure.vector_db.qdrant_client import get_qdrant_client



async def get_vector_db(
    client: QdrantClient = Depends(get_qdrant_client)
) -> IVectorDatabase:
    return QdrantAdapter(client)