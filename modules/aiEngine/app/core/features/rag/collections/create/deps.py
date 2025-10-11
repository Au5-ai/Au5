from app.core.contracts.vector_db.vector_database import IVectorDatabase
from app.infrastructure.vector_db.deps import get_vector_db
from app.core.features.rag.collections.create.handler import CreateCollectionHandler
from fastapi import Depends

def get_create_collection_handler(
    vector_db: IVectorDatabase = Depends(get_vector_db)
) -> CreateCollectionHandler:
    return CreateCollectionHandler(vector_db)
