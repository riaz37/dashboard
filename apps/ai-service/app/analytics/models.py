from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

class MetricType(str, Enum):
    PAGE_VIEWS = "page_views"
    CONVERSION_RATE = "conversion_rate"
    REVENUE = "revenue"
    ACTIVE_USERS = "active_users"
    BOUNCE_RATE = "bounce_rate"
    SESSION_DURATION = "session_duration"
    CLICK_THROUGH_RATE = "click_through_rate"
    CUSTOMER_ACQUISITION_COST = "customer_acquisition_cost"
    LIFETIME_VALUE = "lifetime_value"
    CHURN_RATE = "churn_rate"

class TimeRange(str, Enum):
    HOUR = "1h"
    DAY = "1d"
    WEEK = "7d"
    MONTH = "30d"
    QUARTER = "90d"
    YEAR = "365d"

class AnalyticsData(BaseModel):
    id: Optional[str] = None
    metric_type: MetricType
    value: float
    user_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None

class MetricDetails(BaseModel):
    metric_type: MetricType
    current_value: float
    previous_value: Optional[float] = None
    change_percentage: Optional[float] = None
    trend: str  # "up", "down", "stable"
    data_points: List[AnalyticsData]
    summary: Optional[str] = None

class DashboardData(BaseModel):
    user_id: str
    metrics: List[MetricDetails]
    insights: List[str]
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    time_range: TimeRange = TimeRange.WEEK

class TrendAnalysis(BaseModel):
    metric_type: MetricType
    time_range: TimeRange
    trend_direction: str  # "increasing", "decreasing", "stable"
    trend_strength: float  # 0-1 scale
    forecast: Optional[List[Dict[str, Any]]] = None
    insights: List[str]
    recommendations: List[str]

class Insight(BaseModel):
    id: str
    type: str  # "trend", "anomaly", "recommendation", "alert"
    title: str
    description: str
    severity: str  # "low", "medium", "high", "critical"
    metric_type: Optional[MetricType] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    actionable: bool = True
    metadata: Optional[Dict[str, Any]] = None
