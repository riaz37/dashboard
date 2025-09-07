from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

class MessageType(str, Enum):
    USER = "user"
    AI = "ai"
    SYSTEM = "system"
    ERROR = "error"

class ChatMessage(BaseModel):
    id: Optional[str] = None
    message: str
    message_type: MessageType
    user_id: str
    session_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    message: str
    message_type: MessageType = MessageType.AI
    session_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None
    suggestions: Optional[List[str]] = None

class ChatSession(BaseModel):
    id: str
    user_id: str
    title: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    message_count: int = 0
    is_active: bool = True

class AnalyticsQuery(BaseModel):
    query: str
    user_id: str
    session_id: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None
    time_range: Optional[Dict[str, str]] = None

class AnalyticsResponse(BaseModel):
    query: str
    response: str
    data: Optional[Dict[str, Any]] = None
    chart_config: Optional[Dict[str, Any]] = None
    insights: Optional[List[str]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
