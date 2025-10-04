from pydantic import BaseModel, Field
from app.core.features.openai.proxy_request import ProxyRequest

class ThreadMessage(BaseModel):
    role: str = Field(..., description="Role: user or assistant")
    content: str = Field(..., description="Message content")

class Thread(BaseModel):
    messages: list[ThreadMessage] = Field(..., description="Initial messages")
    
    def to_openai_params(self):
        return [{"role": msg.role, "content": msg.content} for msg in self.messages]
    

class RunThreadRequest(ProxyRequest): 
    assistant_id: str
    thread: Thread
    
    def to_openai_params(self):
        return {
            "assistant_id": self.assistant_id,
            "thread": {
                "messages": self.thread.to_openai_params()
            }
        }