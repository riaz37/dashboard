import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import json
import statistics

from langchain_google_genai import ChatGoogleGenerativeAI

from app.analytics.models import (
    AnalyticsData, MetricDetails, DashboardData, 
    TrendAnalysis, Insight, MetricType, TimeRange
)
from app.database.mongodb import get_database
from app.database.redis_client import get_redis_client

class AnalyticsService:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0.3,
            max_output_tokens=1024
        )

    async def get_analytics_data(
        self, 
        user_id: str, 
        query_params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Get analytics data based on query parameters"""
        try:
            db = await get_database()
            
            # Build query based on parameters
            query = {"user_id": user_id}
            
            if "metrics" in query_params:
                query["metric_type"] = {"$in": query_params["metrics"]}
            
            if "time_range" in query_params:
                time_range = self._parse_time_range(query_params["time_range"])
                query["timestamp"] = {"$gte": time_range}
            
            # Execute query
            cursor = db.analytics_data.find(query).sort("timestamp", -1)
            data = []
            
            async for doc in cursor:
                data.append(AnalyticsData(**doc))
            
            return {
                "data": [item.dict() for item in data],
                "count": len(data),
                "query_params": query_params
            }
            
        except Exception as e:
            return {"error": str(e), "data": []}

    async def get_metrics(
        self,
        user_id: str,
        metric_types: Optional[List[str]] = None,
        time_range: str = "7d",
        limit: int = 100
    ) -> List[AnalyticsData]:
        """Get metrics for a user"""
        try:
            db = await get_database()
            
            query = {"user_id": user_id}
            
            if metric_types:
                query["metric_type"] = {"$in": metric_types}
            
            # Apply time range filter
            time_filter = self._parse_time_range(time_range)
            query["timestamp"] = {"$gte": time_filter}
            
            cursor = db.analytics_data.find(query).sort("timestamp", -1).limit(limit)
            metrics = []
            
            async for doc in cursor:
                metrics.append(AnalyticsData(**doc))
            
            return metrics
            
        except Exception as e:
            return []

    async def get_metric_details(
        self,
        metric_type: str,
        user_id: str,
        time_range: str = "7d"
    ) -> MetricDetails:
        """Get detailed information for a specific metric"""
        try:
            db = await get_database()
            
            # Get current data
            time_filter = self._parse_time_range(time_range)
            current_query = {
                "user_id": user_id,
                "metric_type": metric_type,
                "timestamp": {"$gte": time_filter}
            }
            
            cursor = db.analytics_data.find(current_query).sort("timestamp", -1)
            data_points = []
            
            async for doc in cursor:
                data_points.append(AnalyticsData(**doc))
            
            if not data_points:
                return MetricDetails(
                    metric_type=MetricType(metric_type),
                    current_value=0,
                    data_points=[],
                    trend="stable"
                )
            
            # Calculate metrics
            current_value = data_points[0].value if data_points else 0
            previous_value = data_points[1].value if len(data_points) > 1 else None
            
            change_percentage = None
            if previous_value and previous_value != 0:
                change_percentage = ((current_value - previous_value) / previous_value) * 100
            
            # Determine trend
            trend = "stable"
            if change_percentage:
                if change_percentage > 5:
                    trend = "up"
                elif change_percentage < -5:
                    trend = "down"
            
            # Generate summary using AI
            summary = await self._generate_metric_summary(metric_type, data_points)
            
            return MetricDetails(
                metric_type=MetricType(metric_type),
                current_value=current_value,
                previous_value=previous_value,
                change_percentage=change_percentage,
                trend=trend,
                data_points=data_points,
                summary=summary
            )
            
        except Exception as e:
            return MetricDetails(
                metric_type=MetricType(metric_type),
                current_value=0,
                data_points=[],
                trend="stable",
                summary=f"Error retrieving data: {str(e)}"
            )

    async def get_dashboard_data(self, user_id: str) -> DashboardData:
        """Get comprehensive dashboard data for a user"""
        try:
            # Get all metric types
            metric_types = [metric.value for metric in MetricType]
            
            # Get metrics for each type
            metrics = []
            for metric_type in metric_types:
                metric_details = await self.get_metric_details(metric_type, user_id)
                if metric_details.data_points:  # Only include metrics with data
                    metrics.append(metric_details)
            
            # Generate insights
            insights = await self.generate_insights(user_id, "7d")
            
            return DashboardData(
                user_id=user_id,
                metrics=metrics,
                insights=insights,
                time_range=TimeRange.WEEK
            )
            
        except Exception as e:
            return DashboardData(
                user_id=user_id,
                metrics=[],
                insights=[f"Error loading dashboard: {str(e)}"],
                time_range=TimeRange.WEEK
            )

    async def generate_insights(self, user_id: str, time_range: str) -> List[str]:
        """Generate AI-powered insights from user's data"""
        try:
            # Get recent data
            metrics = await self.get_metrics(user_id, time_range=time_range, limit=50)
            
            if not metrics:
                return ["No data available for insights generation"]
            
            # Prepare data for AI analysis
            data_summary = self._prepare_data_summary(metrics)
            
            # Generate insights using AI
            insights_prompt = f"""
            Analyze this analytics data and provide 3-5 key insights and recommendations:
            
            Data Summary: {json.dumps(data_summary, default=str)}
            
            Please provide:
            1. Key trends and patterns
            2. Performance highlights
            3. Areas for improvement
            4. Actionable recommendations
            
            Format as a JSON array of insight strings.
            """
            
            response = await self.llm.ainvoke(insights_prompt)
            insights = json.loads(response.content)
            
            return insights if isinstance(insights, list) else [
                "Data analysis completed",
                "Review your metrics regularly",
                "Consider setting up automated alerts"
            ]
            
        except Exception as e:
            return [f"Error generating insights: {str(e)}"]

    async def analyze_trends(
        self, 
        user_id: str, 
        metric_type: str, 
        time_range: str
    ) -> TrendAnalysis:
        """Analyze trends for a specific metric"""
        try:
            # Get data points
            metrics = await self.get_metrics(
                user_id=user_id,
                metric_types=[metric_type],
                time_range=time_range,
                limit=100
            )
            
            if not metrics:
                return TrendAnalysis(
                    metric_type=MetricType(metric_type),
                    time_range=TimeRange(time_range),
                    trend_direction="stable",
                    trend_strength=0.0,
                    insights=["No data available for trend analysis"],
                    recommendations=["Start collecting data for this metric"]
                )
            
            # Calculate trend
            values = [m.value for m in metrics]
            trend_direction, trend_strength = self._calculate_trend(values)
            
            # Generate forecast
            forecast = await self._generate_forecast(values)
            
            # Generate insights and recommendations
            insights = await self._generate_trend_insights(metric_type, values, trend_direction)
            recommendations = await self._generate_trend_recommendations(metric_type, trend_direction)
            
            return TrendAnalysis(
                metric_type=MetricType(metric_type),
                time_range=TimeRange(time_range),
                trend_direction=trend_direction,
                trend_strength=trend_strength,
                forecast=forecast,
                insights=insights,
                recommendations=recommendations
            )
            
        except Exception as e:
            return TrendAnalysis(
                metric_type=MetricType(metric_type),
                time_range=TimeRange(time_range),
                trend_direction="stable",
                trend_strength=0.0,
                insights=[f"Error analyzing trends: {str(e)}"],
                recommendations=["Please try again later"]
            )

    async def create_metric(self, data: AnalyticsData) -> Dict[str, Any]:
        """Create a new analytics metric"""
        try:
            db = await get_database()
            result = await db.analytics_data.insert_one(data.dict())
            
            return {
                "id": str(result.inserted_id),
                "message": "Metric created successfully",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {"error": str(e)}

    def _parse_time_range(self, time_range: str) -> datetime:
        """Parse time range string to datetime"""
        now = datetime.utcnow()
        
        if time_range == "1h":
            return now - timedelta(hours=1)
        elif time_range == "1d":
            return now - timedelta(days=1)
        elif time_range == "7d":
            return now - timedelta(days=7)
        elif time_range == "30d":
            return now - timedelta(days=30)
        elif time_range == "90d":
            return now - timedelta(days=90)
        elif time_range == "365d":
            return now - timedelta(days=365)
        else:
            return now - timedelta(days=7)  # Default to 7 days

    def _prepare_data_summary(self, metrics: List[AnalyticsData]) -> Dict[str, Any]:
        """Prepare data summary for AI analysis"""
        summary = {}
        
        # Group by metric type
        for metric in metrics:
            metric_type = metric.metric_type
            if metric_type not in summary:
                summary[metric_type] = []
            summary[metric_type].append(metric.value)
        
        # Calculate basic statistics
        for metric_type, values in summary.items():
            summary[metric_type] = {
                "count": len(values),
                "average": statistics.mean(values),
                "min": min(values),
                "max": max(values),
                "latest": values[0] if values else 0
            }
        
        return summary

    def _calculate_trend(self, values: List[float]) -> tuple:
        """Calculate trend direction and strength"""
        if len(values) < 2:
            return "stable", 0.0
        
        # Simple linear regression
        n = len(values)
        x = list(range(n))
        
        # Calculate slope
        x_mean = sum(x) / n
        y_mean = sum(values) / n
        
        numerator = sum((x[i] - x_mean) * (values[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
        
        if denominator == 0:
            return "stable", 0.0
        
        slope = numerator / denominator
        
        # Determine direction and strength
        if slope > 0.1:
            return "increasing", min(abs(slope) / max(values), 1.0)
        elif slope < -0.1:
            return "decreasing", min(abs(slope) / max(values), 1.0)
        else:
            return "stable", 0.0

    async def _generate_forecast(self, values: List[float]) -> List[Dict[str, Any]]:
        """Generate simple forecast using AI"""
        try:
            forecast_prompt = f"""
            Based on this time series data, provide a 7-day forecast:
            Data: {values[-10:]}  # Last 10 values
            
            Return as JSON array with format:
            [{{"day": 1, "value": predicted_value, "confidence": 0.8}}]
            """
            
            response = await self.llm.ainvoke(forecast_prompt)
            forecast = json.loads(response.content)
            
            return forecast if isinstance(forecast, list) else []
            
        except:
            return []

    async def _generate_metric_summary(self, metric_type: str, data_points: List[AnalyticsData]) -> str:
        """Generate AI summary for a metric"""
        try:
            values = [dp.value for dp in data_points]
            latest = values[0] if values else 0
            average = statistics.mean(values) if values else 0
            
            summary_prompt = f"""
            Provide a brief summary for {metric_type}:
            Latest value: {latest}
            Average: {average}
            Data points: {len(values)}
            
            Keep it concise and actionable.
            """
            
            response = await self.llm.ainvoke(summary_prompt)
            return response.content
            
        except:
            return f"Current {metric_type}: {latest}"

    async def _generate_trend_insights(self, metric_type: str, values: List[float], trend: str) -> List[str]:
        """Generate insights about trends"""
        try:
            insights_prompt = f"""
            Provide 2-3 insights about the {metric_type} trend:
            Trend: {trend}
            Recent values: {values[-5:]}
            
            Return as JSON array of insight strings.
            """
            
            response = await self.llm.ainvoke(insights_prompt)
            insights = json.loads(response.content)
            
            return insights if isinstance(insights, list) else [
                f"{metric_type} is showing a {trend} trend",
                "Monitor this metric closely"
            ]
            
        except:
            return [f"{metric_type} trend analysis completed"]

    async def _generate_trend_recommendations(self, metric_type: str, trend: str) -> List[str]:
        """Generate recommendations based on trends"""
        try:
            recommendations_prompt = f"""
            Provide 2-3 actionable recommendations for {metric_type} with {trend} trend:
            
            Return as JSON array of recommendation strings.
            """
            
            response = await self.llm.ainvoke(recommendations_prompt)
            recommendations = json.loads(response.content)
            
            return recommendations if isinstance(recommendations, list) else [
                "Continue monitoring this metric",
                "Consider setting up alerts"
            ]
            
        except:
            return ["Review your strategy for this metric"]
