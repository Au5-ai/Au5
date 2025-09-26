from fastapi import FastAPI
from app.api.routers.routes import router
from app.api.middlewares.exception_handler import exception_handler
from app.shared.configuration.config import app_settings

app = FastAPI()

# Enable Swagger in development mode
if app_settings.app_mode == "development":
    from app.api.utils.custom_openapi import custom_openapi
    app.openapi = lambda: custom_openapi(app)

# Include API routes
app.include_router(router)

# Add middleware
app.middleware("http")(exception_handler)