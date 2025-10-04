from fastapi import APIRouter
from app.api.routers.openai import router as openai_router
from app.api.routers.liveness import router as liveness

from app.core.features.openai.assistants.create.router import router as create_assistant_router


router = APIRouter()

router.prefix = "/api"

router.include_router(create_assistant_router, prefix="/assistants")

# Include OpenAI assistant routes
router.include_router(openai_router, prefix="/api")

# Include base routes
router.include_router(liveness)