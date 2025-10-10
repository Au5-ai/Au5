from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class CollectionConfig(BaseModel):
    size: int = Field(default=128, description="Vector size/dimension")
    distance: str = Field(default="cosine", description="Distance function (cosine, euclidean, dot)")
    on_disk: bool = Field(default=True, description="Whether to store vectors on disk")
    
class Collection(BaseModel):
    """Vector collection model"""
    name: str = Field(..., description="Collection name")
    config: CollectionConfig = Field(..., description="Collection configuration")