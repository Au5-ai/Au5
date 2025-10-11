from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models
from qdrant_client.http.exceptions import UnexpectedResponse
import logging

from app.core.contracts.vector_db.vector_database import IVectorDatabase
from app.core.contracts.vector_db.models.collection import Collection

logger = logging.getLogger(__name__) 

class QdrantAdapter(IVectorDatabase):
    """Qdrant implementation of the vector database interface"""
    
    def __init__(self, client: QdrantClient):
        self.client = client
    
    async def create_collection(self, collection: Collection) -> bool:
        try:
            # Convert our distance metric to Qdrant's format
            distance_map = {
                "cosine": qdrant_models.Distance.COSINE,
                "euclidean": qdrant_models.Distance.EUCLID,
                "dot": qdrant_models.Distance.DOT
            }
            
            # Create vectors config
            vectors_config = qdrant_models.VectorParams(
                size=collection.config.size,
                distance=distance_map.get(collection.config.distance, qdrant_models.Distance.COSINE)
            )
            
            # Create collection
            self.client.create_collection(
                collection_name=collection.name,
                vectors_config=vectors_config,
                on_disk_payload=collection.config.on_disk
            )
            
            return True
            
        except UnexpectedResponse as e:
            logger.error(f"UnexpectedResponse while creating collection {collection.name}: {e}")
            return False
        except Exception as e:
            logger.error(f"UnexpectedResponse while creating collection {collection.name}: {e}")
            return False
    
    
    async def collection_exists(self, name: str) -> bool:
        try:
            collection = self.client.get_collection(name)
            
            if not collection:
                return False
            return True
            
        except UnexpectedResponse:
            return False
        except Exception:
            return False
        
        


