from fastapi.openapi.utils import get_openapi

def custom_openapi(app):
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="AI Engine API",
        version="1.0.0",
        description="API documentation for the AI Engine",
        routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema
