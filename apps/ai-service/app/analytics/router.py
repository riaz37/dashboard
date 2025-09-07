from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json

from app.analytics.service import AnalyticsService
from app.analytics.models import AnalyticsData, MetricType, TimeRange

router = APIRouter()

@router.get("/metrics", response_model=List[AnalyticsData])
async def get_metrics(
    user_id: str = Query(..., description="User ID"),
    metric_types: Optional[List[str]] = Query(None, description="List of metric types"),
    time_range: Optional[str] = Query("7d", description="Time range (1d, 7d, 30d, 90d)"),
    limit: int = Query(100, description="Maximum number of records")
):
    """Get analytics metrics for a user"""
    try:
        analytics_service = AnalyticsService()
        metrics = await analytics_service.get_metrics(
            user_id=user_id,
            metric_types=metric_types,
            time_range=time_range,
            limit=limit
        )
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving metrics: {str(e)}")

@router.get("/metrics/{metric_type}")
async def get_metric_details(
    metric_type: str,
    user_id: str = Query(..., description="User ID"),
    time_range: str = Query("7d", description="Time range")
):
    """Get detailed data for a specific metric"""
    try:
        analytics_service = AnalyticsService()
        data = await analytics_service.get_metric_details(
            metric_type=metric_type,
            user_id=user_id,
            time_range=time_range
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving metric details: {str(e)}")

@router.post("/metrics")
async def create_metric(data: AnalyticsData):
    """Create a new analytics metric"""
    try:
        analytics_service = AnalyticsService()
        result = await analytics_service.create_metric(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating metric: {str(e)}")

@router.get("/dashboard/{user_id}")
async def get_dashboard_data(user_id: str):
    """Get dashboard data for a user"""
    try:
        analytics_service = AnalyticsService()
        dashboard_data = await analytics_service.get_dashboard_data(user_id)
        return dashboard_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving dashboard data: {str(e)}")

@router.get("/insights/{user_id}")
async def get_insights(
    user_id: str,
    time_range: str = Query("7d", description="Time range for insights")
):
    """Get AI-generated insights for a user's data"""
    try:
        analytics_service = AnalyticsService()
        insights = await analytics_service.generate_insights(user_id, time_range)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating insights: {str(e)}")

@router.get("/trends/{user_id}")
async def get_trends(
    user_id: str,
    metric_type: str = Query(..., description="Metric type to analyze"),
    time_range: str = Query("30d", description="Time range for trend analysis")
):
    """Get trend analysis for a specific metric"""
    try:
        analytics_service = AnalyticsService()
        trends = await analytics_service.analyze_trends(user_id, metric_type, time_range)
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing trends: {str(e)}")

@router.get("/health")
async def analytics_health():
    """Health check for analytics service"""
    return {
        "status": "healthy",
        "service": "analytics",
        "timestamp": datetime.utcnow().isoformat()
    }
