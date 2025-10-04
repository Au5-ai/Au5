from pydantic import BaseModel, Field
from app.core.features.openai.proxy_request import ProxyRequest

class ThreadMessage(BaseModel):
    role: str
    content: str

class Thread(BaseModel):
    messages: list[ThreadMessage]

class RunThreadRequest(BaseModel):
    assistant_id: str
    thread: Thread
    stream: bool = Field(default=True, description="Whether to stream the response")