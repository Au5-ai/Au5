from fastapi import APIRouter
from app.api.routers.openai_sample import router as openai_assistant_router
from app.api.routers.start import router as start_router

router = APIRouter()

# Include OpenAI assistant routes
router.include_router(openai_assistant_router, prefix="/api")

# Include base routes
router.include_router(start_router)

@router.get("/")
def read_root():
    return {"message": "Welcome to the AI Engine!"}