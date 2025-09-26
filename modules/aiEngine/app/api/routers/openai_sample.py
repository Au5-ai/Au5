from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.shared.configuration.config import openai_settings
from app.shared.result import Result
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage

router = APIRouter()

class AskRequest(BaseModel):
    question: str

@router.post("/ask")
async def ask_openai(request: AskRequest):
    try:
        
        chat = ChatOpenAI(
            model=openai_settings.model, 
            openai_api_key=openai_settings.api_key,
            base_url=openai_settings.api_url,  # optional, only if you're using a custom endpoint
        )

        # Get response from OpenAI
        response = chat.invoke([HumanMessage(content=request.question)])

        # Return success result
        return Result.ok({
            "question": request.question,
            "answer": response.content
        })
    except Exception as e:
        return Result.fail(f"Error communicating with OpenAI: {str(e)}")
