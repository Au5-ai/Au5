from abc import ABC, abstractmethod
from app.core.contracts.vector_db.models.collection import Collection
import logging



class IVectorDatabase(ABC):
    """Port interface for vector database operations"""
    
    @abstractmethod
    async def create_collection(self, collection: Collection) -> bool:
        """Create a new collection with the specified configuration
        
        Args:
            collection: Collection configuration
            
        Returns:
            bool: True if collection was created successfully
        """
        pass
    
    
    @abstractmethod
    async def collection_exists(self, name: str) -> bool:
        """Check if a collection exists
        
        Args:
            name: Name of the collection
            
        Returns:
            bool: True if collection exists
        """
        pass