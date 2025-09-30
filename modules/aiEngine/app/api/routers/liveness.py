from fastapi import APIRouter
from app.shared.result import Result

router = APIRouter()

import time

@router.get("/health/live")
def read_root():
    start = time.perf_counter()
    entry_start = time.perf_counter()
    entry_duration = time.perf_counter() - entry_start
    total_duration = time.perf_counter() - start
    return {
        "status": "Healthy",
        "totalDuration": f"{total_duration:0.7f}",
        "entries": {
            "self": {
                "data": {},
                "duration": f"{entry_duration:0.7f}",
                "status": "Healthy",
                "tags": ["live"]
            }
        }
    }