from fastapi import APIRouter
from app.api.routers.openai import router as openai_router
from app.api.routers.liveness import router as liveness

router = APIRouter()

# Include OpenAI assistant routes
router.include_router(openai_router, prefix="/api")

# Include base routes
router.include_router(liveness)