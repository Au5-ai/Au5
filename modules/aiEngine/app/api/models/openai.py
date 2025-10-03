from pydantic import BaseModel

class ProxyRequest(BaseModel):
    proxy_url: str | None = None
    apiKey: str | None = None


class ThreadMessage(BaseModel):
    role: str
    content: str

class Thread(BaseModel):
    messages: list[ThreadMessage]

class ThreadRunRequest(ProxyRequest):
    assistant_id: str
    thread: Thread
    stream: bool = True

class AssistantRequest(ProxyRequest):
    instructions: str
    name: str
    model: str = "gpt-4o"
    tools: list = [{"type": "code_interpreter"}]
