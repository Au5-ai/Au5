from fastapi import APIRouter, Depends
from fastapi.responses import Response

from app.core.features.rag.collections.create.handler import CreateCollectionHandler
from app.core.features.rag.collections.create.request import CreateCollectionRequest
from app.core.features.rag.collections.create.deps import get_create_collection_handler
from app.shared.result import Result

router = APIRouter()

@router.post(
    "/create",
    description="Create a new RAG collection in the vector database with space id name",
    response_model=Result[None, str]
    )
async def create_collection(
    request: CreateCollectionRequest,
    handler: CreateCollectionHandler = Depends( get_create_collection_handler)
) -> Response:
    return (await handler.handle(request)).to_json_response()
    