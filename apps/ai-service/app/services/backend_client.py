import os
import httpx
from typing import Dict, Any, List, Optional
import json

class BackendClient:
    def __init__(self):
        self.base_url = os.getenv("NESTJS_API_URL", "http://localhost:3001")
        self.client = httpx.AsyncClient(timeout=30.0)

    async def get_analytics_data(
        self, 
        user_id: str, 
        query_params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Get analytics data from Nest.js backend"""
        try:
            response = await self.client.get(
                f"{self.base_url}/api/analytics/data",
                params={"user_id": user_id, **query_params}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e), "data": []}

    async def get_user_metrics(
        self,
        user_id: str,
        metric_types: Optional[List[str]] = None,
        time_range: str = "7d"
    ) -> List[Dict[str, Any]]:
        """Get user metrics from backend"""
        try:
            params = {"user_id": user_id, "time_range": time_range}
            if metric_types:
                params["metric_types"] = ",".join(metric_types)
            
            response = await self.client.get(
                f"{self.base_url}/api/analytics/metrics",
                params=params
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return []

    async def get_dashboard_data(self, user_id: str) -> Dict[str, Any]:
        """Get dashboard data from backend"""
        try:
            response = await self.client.get(
                f"{self.base_url}/api/dashboard/{user_id}"
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}

    async def save_chat_message(
        self,
        message: str,
        user_id: str,
        session_id: str,
        message_type: str = "user"
    ) -> Dict[str, Any]:
        """Save chat message to backend"""
        try:
            response = await self.client.post(
                f"{self.base_url}/api/chat/messages",
                json={
                    "message": message,
                    "user_id": user_id,
                    "session_id": session_id,
                    "message_type": message_type
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}

    async def get_chat_history(
        self,
        user_id: str,
        session_id: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get chat history from backend"""
        try:
            params = {"user_id": user_id, "limit": limit}
            if session_id:
                params["session_id"] = session_id
            
            response = await self.client.get(
                f"{self.base_url}/api/chat/history",
                params=params
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return []

    async def create_chart(
        self,
        user_id: str,
        chart_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a chart via backend"""
        try:
            response = await self.client.post(
                f"{self.base_url}/api/charts/create",
                json={
                    "user_id": user_id,
                    "config": chart_config
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}

    async def set_alert(
        self,
        user_id: str,
        alert_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Set up an alert via backend"""
        try:
            response = await self.client.post(
                f"{self.base_url}/api/alerts/create",
                json={
                    "user_id": user_id,
                    "config": alert_config
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
