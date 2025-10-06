from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.core.features.openai.proxy_request import ProxyRequest


class CreateAssistantRequest(ProxyRequest):
    name: str = Field(..., description="Assistant name")
    instructions: str = Field(..., description="System instructions")
    model: str = Field(default="gpt-4o", description="Model to use")
    tools: Optional[List[Dict[str, Any]]] = Field(default=[{"type": "code_interpreter"}], description="Tools")


    def to_openai_params(self) -> Dict[str, Any]:
        params = {
            "name": self.name,
            "instructions": self.instructions,
            "model": self.model,
        }
        if self.tools:
            params["tools"] = self.tools
        return params
    


class CreateAssistantResponse(BaseModel):
    assistant_id: str
