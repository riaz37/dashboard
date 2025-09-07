import os
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
import asyncio

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from langchain.memory import ConversationBufferWindowMemory
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import ConversationChain

from app.chat.models import ChatMessage, ChatResponse, ChatSession, MessageType
from app.database.redis_client import get_redis_client
from app.services.backend_client import BackendClient

class ChatService:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0.7,
            max_output_tokens=2048
        )
        self.backend_client = BackendClient()
        
        # System prompt for analytics chat bot
        self.system_prompt = """
        You are an AI assistant specialized in analytics and data insights. You help users understand their data, create visualizations, and provide actionable insights.

        Your capabilities include:
        1. Answering questions about analytics data
        2. Creating charts and visualizations
        3. Providing data insights and recommendations
        4. Helping with dashboard management
        5. Setting up alerts and notifications

        Always be helpful, accurate, and provide clear explanations. When users ask for data, try to provide specific insights and actionable recommendations.

        If you need to access specific data, mention what data you would need and how it would help answer their question.
        """

    async def process_message(
        self, 
        message: str, 
        user_id: str, 
        session_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> ChatResponse:
        """Process a user message and generate AI response"""
        try:
            # Create session if not provided
            if not session_id:
                session = await self.create_session(user_id)
                session_id = session.id

            # Get conversation memory
            memory = await self._get_conversation_memory(session_id)
            
            # Create conversation chain
            prompt = ChatPromptTemplate.from_messages([
                ("system", self.system_prompt),
                MessagesPlaceholder(variable_name="history"),
                ("human", "{input}")
            ])
            
            conversation = ConversationChain(
                llm=self.llm,
                memory=memory,
                prompt=prompt,
                verbose=True
            )

            # Process the message
            response_text = await conversation.apredict(input=message)
            
            # Save messages to database
            await self._save_message(
                message=message,
                message_type=MessageType.USER,
                user_id=user_id,
                session_id=session_id
            )
            
            await self._save_message(
                message=response_text,
                message_type=MessageType.AI,
                user_id=user_id,
                session_id=session_id
            )

            # Generate suggestions based on the response
            suggestions = await self._generate_suggestions(message, response_text)

            return ChatResponse(
                message=response_text,
                session_id=session_id,
                suggestions=suggestions,
                metadata={
                    "model": "gemini-pro",
                    "context": context
                }
            )

        except Exception as e:
            error_response = f"I apologize, but I encountered an error processing your message: {str(e)}"
            return ChatResponse(
                message=error_response,
                message_type=MessageType.ERROR,
                session_id=session_id or "error",
                metadata={"error": str(e)}
            )

    async def process_analytics_query(
        self, 
        message: str, 
        user_id: str, 
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process analytics-specific queries with data integration"""
        try:
            # Analyze the query to determine what data is needed
            query_analysis = await self._analyze_analytics_query(message)
            
            # Get relevant data if needed
            data = None
            if query_analysis.get("needs_data"):
                data = await self.analytics_service.get_analytics_data(
                    user_id=user_id,
                    query_params=query_analysis.get("query_params", {})
                )

            # Create enhanced prompt with data context
            enhanced_prompt = f"""
            User Query: {message}
            
            Available Data Context: {json.dumps(data, default=str) if data else "No specific data requested"}
            
            Please provide a comprehensive response that includes:
            1. Direct answer to the user's question
            2. Key insights from the data (if available)
            3. Actionable recommendations
            4. Suggestions for further analysis
            """

            # Get conversation memory
            memory = await self._get_conversation_memory(session_id or "analytics")
            
            # Process with enhanced context
            prompt = ChatPromptTemplate.from_messages([
                ("system", self.system_prompt),
                MessagesPlaceholder(variable_name="history"),
                ("human", enhanced_prompt)
            ])
            
            conversation = ConversationChain(
                llm=self.llm,
                memory=memory,
                prompt=prompt,
                verbose=True
            )

            response_text = await conversation.apredict(input=enhanced_prompt)

            return {
                "query": message,
                "response": response_text,
                "data": data,
                "insights": await self._extract_insights(response_text),
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                "query": message,
                "response": f"Error processing analytics query: {str(e)}",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    async def _analyze_analytics_query(self, query: str) -> Dict[str, Any]:
        """Analyze the query to determine what data and actions are needed"""
        analysis_prompt = f"""
        Analyze this analytics query and determine:
        1. What type of data is being requested
        2. What time range is needed
        3. What metrics are relevant
        4. Whether visualization is needed
        
        Query: "{query}"
        
        Respond in JSON format with:
        {{
            "needs_data": boolean,
            "query_params": {{
                "metrics": ["list of metrics"],
                "time_range": "time range",
                "filters": {{"key": "value"}}
            }},
            "needs_visualization": boolean,
            "query_type": "type of query"
        }}
        """
        
        try:
            response = await self.llm.ainvoke(analysis_prompt)
            return json.loads(response.content)
        except:
            return {
                "needs_data": False,
                "query_params": {},
                "needs_visualization": False,
                "query_type": "general"
            }

    async def _get_conversation_memory(self, session_id: str) -> ConversationBufferWindowMemory:
        """Get or create conversation memory for a session"""
        redis = await get_redis_client()
        memory_key = f"chat_memory:{session_id}"
        
        # Try to load from Redis
        memory_data = await redis.get(memory_key)
        if memory_data:
            memory = ConversationBufferWindowMemory(
                k=10,  # Keep last 10 exchanges
                return_messages=True
            )
            # Restore memory from Redis data
            # This is a simplified version - in production, you'd want more robust serialization
            return memory
        
        return ConversationBufferWindowMemory(
            k=10,
            return_messages=True
        )

    async def _save_message(
        self, 
        message: str, 
        message_type: MessageType, 
        user_id: str, 
        session_id: str
    ):
        """Save message to database"""
        db = await get_database()
        chat_message = ChatMessage(
            message=message,
            message_type=message_type,
            user_id=user_id,
            session_id=session_id
        )
        
        await db.chat_messages.insert_one(chat_message.dict())

    async def _generate_suggestions(self, user_message: str, ai_response: str) -> List[str]:
        """Generate follow-up suggestions based on the conversation"""
        suggestions_prompt = f"""
        Based on this conversation, suggest 3 helpful follow-up questions or actions:
        
        User: {user_message}
        AI: {ai_response}
        
        Provide suggestions that would help the user dive deeper into analytics or explore related topics.
        Return as a JSON array of strings.
        """
        
        try:
            response = await self.llm.ainvoke(suggestions_prompt)
            suggestions = json.loads(response.content)
            return suggestions if isinstance(suggestions, list) else []
        except:
            return [
                "Show me more detailed data",
                "Create a visualization",
                "Set up an alert for this metric"
            ]

    async def _extract_insights(self, response: str) -> List[str]:
        """Extract key insights from AI response"""
        insights_prompt = f"""
        Extract the key insights from this analytics response. Return as a JSON array of insight strings:
        
        Response: {response}
        """
        
        try:
            response = await self.llm.ainvoke(insights_prompt)
            insights = json.loads(response.content)
            return insights if isinstance(insights, list) else []
        except:
            return []

    async def create_session(self, user_id: str) -> ChatSession:
        """Create a new chat session"""
        session_id = str(uuid.uuid4())
        session = ChatSession(
            id=session_id,
            user_id=user_id,
            title="New Chat Session"
        )
        
        db = await get_database()
        await db.chat_sessions.insert_one(session.dict())
        
        return session

    async def get_chat_history(
        self, 
        user_id: str, 
        session_id: Optional[str] = None, 
        limit: int = 50
    ) -> List[ChatMessage]:
        """Get chat history for a user"""
        db = await get_database()
        
        query = {"user_id": user_id}
        if session_id:
            query["session_id"] = session_id
        
        cursor = db.chat_messages.find(query).sort("timestamp", -1).limit(limit)
        messages = []
        
        async for doc in cursor:
            messages.append(ChatMessage(**doc))
        
        return list(reversed(messages))  # Return in chronological order

    async def get_user_sessions(self, user_id: str) -> List[ChatSession]:
        """Get all chat sessions for a user"""
        db = await get_database()
        cursor = db.chat_sessions.find({"user_id": user_id}).sort("updated_at", -1)
        
        sessions = []
        async for doc in cursor:
            sessions.append(ChatSession(**doc))
        
        return sessions

    async def delete_session(self, session_id: str, user_id: str):
        """Delete a chat session and its messages"""
        db = await get_database()
        
        # Delete session
        await db.chat_sessions.delete_one({
            "id": session_id,
            "user_id": user_id
        })
        
        # Delete messages
        await db.chat_messages.delete_many({
            "session_id": session_id,
            "user_id": user_id
        })
        
        # Clear Redis memory
        redis = await get_redis_client()
        await redis.delete(f"chat_memory:{session_id}")
