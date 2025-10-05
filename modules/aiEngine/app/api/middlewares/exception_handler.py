from fastapi import Request, Response
from fastapi.responses import JSONResponse
from app.shared.result import Result
from app.shared.exceptions import AppException
import logging

logger = logging.getLogger(__name__) 

async def exception_handler(request: Request, call_next):
    try:
        return await call_next(request)

    except AppException as ae:
        logger.error(
            f"AppException: {ae.message}",
            extra={
                "path": request.url.path,
                "method": request.method,
                "status_code": ae.status_code,
                "details": ae.details
            }
        )
        return Response(content=ae.to_result().model_dump_json(), status_code=ae.status_code, media_type="application/json")

    except Exception as e:
        logger.error(
            f"Exception: {e}",
            extra={
                "path": request.url.path,
                "method": request.method,
            }
        )
        return Response(content=Result.failure(str(e), status=500).model_dump_json(), status_code=500, media_type="application/json")

