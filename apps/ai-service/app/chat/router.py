from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import json

from app.chat.service import ChatService
from app.chat.models import ChatMessage, ChatResponse, ChatSession
from app.database.mongodb import get_database

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    user_id: str
    session_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class ChatHistoryRequest(BaseModel):
    user_id: str
    session_id: Optional[str] = None
    limit: Optional[int] = 50

@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """Send a message to the AI chat bot"""
    try:
        chat_service = ChatService()
        response = await chat_service.process_message(
            message=request.message,
            user_id=request.user_id,
            session_id=request.session_id,
            context=request.context
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@router.get("/history/{user_id}", response_model=List[ChatMessage])
async def get_chat_history(
    user_id: str,
    session_id: Optional[str] = None,
    limit: int = 50
):
    """Get chat history for a user"""
    try:
        chat_service = ChatService()
        history = await chat_service.get_chat_history(
            user_id=user_id,
            session_id=session_id,
            limit=limit
        )
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat history: {str(e)}")

@router.post("/session", response_model=ChatSession)
async def create_chat_session(user_id: str):
    """Create a new chat session"""
    try:
        chat_service = ChatService()
        session = await chat_service.create_session(user_id=user_id)
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating chat session: {str(e)}")

@router.delete("/session/{session_id}")
async def delete_chat_session(session_id: str, user_id: str):
    """Delete a chat session"""
    try:
        chat_service = ChatService()
        await chat_service.delete_session(session_id=session_id, user_id=user_id)
        return {"message": "Session deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting chat session: {str(e)}")

@router.get("/sessions/{user_id}", response_model=List[ChatSession])
async def get_user_sessions(user_id: str):
    """Get all chat sessions for a user"""
    try:
        chat_service = ChatService()
        sessions = await chat_service.get_user_sessions(user_id=user_id)
        return sessions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving user sessions: {str(e)}")

@router.post("/analytics/query")
async def analytics_query(request: ChatRequest):
    """Process analytics-specific queries"""
    try:
        chat_service = ChatService()
        response = await chat_service.process_analytics_query(
            message=request.message,
            user_id=request.user_id,
            session_id=request.session_id
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing analytics query: {str(e)}")

@router.get("/health")
async def chat_health():
    """Health check for chat service"""
    return {
        "status": "healthy",
        "service": "chat",
        "timestamp": datetime.utcnow().isoformat()
    }
