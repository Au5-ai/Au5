from fastapi import FastAPI
from app.api.routers.routes import router
from app.api.middlewares.exception_handler import exception_handler
from app.api.utils.custom_openapi import custom_openapi

app = FastAPI()

# Custom OpenAPI schema
app.openapi = lambda: custom_openapi(app)

# Include API routes
app.include_router(router)

# Add middleware
app.middleware("http")(exception_handler)