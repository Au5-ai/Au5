from pydantic import BaseModel

class ProxyRequest(BaseModel):
    proxy_url: str | None = None

class AssistantRequest(ProxyRequest):
    instructions: str
    name: str
    model: str = "gpt-4o"
    tools: list = [{"type": "code_interpreter"}]
