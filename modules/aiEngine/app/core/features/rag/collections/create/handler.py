from app.core.contracts.vector_db.vector_database import IVectorDatabase
from app.shared.result import Result
from app.core.features.rag.collections.create.request import CreateCollectionRequest
from app.core.features.rag.collections.create.errors import CreateCollectionError

class CreateCollectionHandler:
    def __init__(self, vector_db: IVectorDatabase):
        self.vector_db = vector_db
    
    async def handle(self, request: CreateCollectionRequest) -> Result[None, str]:
    
        existing = await self.vector_db.collection_exists(request.space_id)
        if existing:
            return CreateCollectionError.CollectionAlreadyExists()
        
        success = await self.vector_db.create_collection(request.to_collection())
        if not success:
            return CreateCollectionError.CreationFailed()
        
        return Result.success()
            