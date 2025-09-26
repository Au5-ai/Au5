from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.shared.config import Settings
from app.shared.result import Result
from langchain_community.chat_models import ChatOpenAI
from langchain.schema import HumanMessage

router = APIRouter()

class AskRequest(BaseModel):
    question: str

@router.post("/ask")
async def ask_openai(request: AskRequest):
    try:
        # Load settings
        settings = Settings()

        # Initialize OpenAI chat model
        chat = ChatOpenAI(openai_api_key=settings.openai_api_key, openai_api_base=settings.openai_api_url)

        # Get response from OpenAI
        response = chat([HumanMessage(content=request.question)])

        # Return success result
        return Result.ok({"question": request.question, "answer": response.content})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))