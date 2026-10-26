from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import ChatMessage
from app.services.ai_advisor import AIAdvisorService
from app.schemas.domain import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/v1", tags=["AI Advisor"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_advisor(req: ChatRequest, db: Session = Depends(get_db)):
    # Persist user message
    user_msg = ChatMessage(conversation_id=req.conversation_id, role="user", content=req.message)
    db.add(user_msg)
    db.commit()

    # Generate response from configured provider or quantitative reasoning engine
    result = await AIAdvisorService.generate_response(req.message, current_symbol=req.current_symbol)
    assistant_content = result["content"]

    # Persist assistant message
    asst_msg = ChatMessage(conversation_id=req.conversation_id, role="assistant", content=assistant_content)
    db.add(asst_msg)
    db.commit()

    return ChatResponse(
        conversation_id=req.conversation_id,
        role="assistant",
        content=assistant_content,
        detected_symbols=result["detected_symbols"],
        created_at=datetime.now(timezone.utc).isoformat()
    )
