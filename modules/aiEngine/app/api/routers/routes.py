from fastapi import APIRouter
from app.api.routers.liveness import router as liveness_router

from app.core.features.openai.assistants.create.router import router as create_assistant_router
from app.core.features.openai.threads.run.router import router as run_thread_router
from app.core.features.rag.collections.create.router import router as crate_collections_router


router = APIRouter()

router.prefix = "/api"

router.include_router(create_assistant_router, prefix="/assistants")
router.include_router(run_thread_router, prefix="/threads")
router.include_router(crate_collections_router, prefix="/collections")

# Health check endpoint
router.include_router(liveness_router)