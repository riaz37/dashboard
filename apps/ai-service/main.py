from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import json
import os
from datetime import datetime
from typing import List, Dict, Any
import uvicorn

from app.chat.router import chat_router
from app.analytics.router import analytics_router
from app.websocket.connection_manager import ConnectionManager
from app.database.redis_client import get_redis_client
from app.services.backend_client import BackendClient

# Initialize FastAPI app
app = FastAPI(
    title="AnalyticsAI Chat Bot Service",
    description="AI-powered chat bot for analytics dashboard Q&A",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router, prefix="/api/chat", tags=["chat"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["analytics"])

# WebSocket connection manager
manager = ConnectionManager()

@app.on_event("startup")
async def startup_event():
    """Initialize connections on startup"""
    try:
        # Initialize Redis connection
        await get_redis_client()
        print("✅ Redis connected successfully")
        
        # Initialize backend client
        app.state.backend_client = BackendClient()
        print("✅ Backend client initialized")
        
        print("🚀 AnalyticsAI Chat Bot Service started successfully!")
    except Exception as e:
        print(f"❌ Error during startup: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up connections on shutdown"""
    print("🛑 Shutting down AnalyticsAI Chat Bot Service...")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "AnalyticsAI Chat Bot Service is running!",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Check Redis connection
        redis = await get_redis_client()
        await redis.ping()
        redis_status = "healthy"
    except Exception as e:
        redis_status = f"unhealthy: {str(e)}"
    
    try:
        # Check backend connection
        backend_client = app.state.backend_client
        response = await backend_client.client.get(f"{backend_client.base_url}/health")
        backend_status = "healthy" if response.status_code == 200 else "unhealthy"
    except Exception as e:
        backend_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy" if redis_status == "healthy" and backend_status == "healthy" else "unhealthy",
        "services": {
            "redis": redis_status,
            "backend": backend_status
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time chat"""
    await manager.connect(websocket)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Process the message
            response = await process_chat_message(message_data)
            
            # Send response back to client
            await manager.send_personal_message(response, websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        await manager.send_personal_message({
            "type": "error",
            "message": "An error occurred while processing your message"
        }, websocket)

async def process_chat_message(message_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process incoming chat message and generate AI response"""
    try:
        user_message = message_data.get("message", "")
        user_id = message_data.get("user_id", "anonymous")
        session_id = message_data.get("session_id", "default")
        
        # For now, return a simple response
        # This will be enhanced with actual AI processing
        response = {
            "type": "ai_response",
            "message": f"I received your message: '{user_message}'. I'm processing your analytics query...",
            "timestamp": datetime.utcnow().isoformat(),
            "session_id": session_id
        }
        
        return response
        
    except Exception as e:
        return {
            "type": "error",
            "message": f"Error processing message: {str(e)}",
            "timestamp": datetime.utcnow().isoformat()
        }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
