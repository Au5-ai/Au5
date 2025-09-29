from fastapi import APIRouter
from app.shared.result import Result

router = APIRouter()

@router.get("/")
def read_root():
    return Result.ok("Welcome to the AI Engine!")