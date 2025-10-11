from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.core.contracts.vector_db.models.collection import CollectionConfig, Collection

class CreateCollectionRequest(BaseModel):
    space_id: str = Field(..., description="Collection name")
    config: Optional[CollectionConfig] = Field(
        default_factory=lambda: CollectionConfig(),
        description="Collection configuration"
    )
    
    def to_collection(self) -> Collection:
        return Collection(
            name=self.space_id,
            config=self.config
        )