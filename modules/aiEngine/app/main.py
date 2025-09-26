from fastapi import FastAPI
from app.api.routes import router
from app.api.middlewares.exception_handler import exception_handler

app = FastAPI()

# Include API routes
app.include_router(router)

# Add middleware
app.middleware("http")(exception_handler)