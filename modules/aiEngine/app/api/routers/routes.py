from fastapi import APIRouter
from app.api.routers.liveness import router as liveness_router

from app.core.features.openai.assistants.create.router import router as create_assistant_router
from app.core.features.openai.threads.run.router import router as run_thread_router


router = APIRouter()

router.prefix = "/api"

router.include_router(create_assistant_router, prefix="/assistants")
router.include_router(run_thread_router, prefix="/threads")


# Health check endpoint
router.include_router(liveness_router)