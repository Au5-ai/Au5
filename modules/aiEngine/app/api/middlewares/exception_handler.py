from fastapi import Request, Response
from app.shared.result import Result

async def exception_handler(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        error_result = Result.fail(str(e))
        return Response(content=error_result.json(), status_code=500, media_type="application/json")