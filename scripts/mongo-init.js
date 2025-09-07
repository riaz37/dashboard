// MongoDB initialization script for AnalyticsAI Dashboard
db = db.getSiblingDB('analytics');

// Create collections with proper indexes
db.createCollection('users');
db.createCollection('analytics_data');
db.createCollection('dashboards');
db.createCollection('chat_messages');
db.createCollection('ai_insights');
db.createCollection('alerts');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

db.analytics_data.createIndex({ "timestamp": 1 });
db.analytics_data.createIndex({ "metric_type": 1 });
db.analytics_data.createIndex({ "user_id": 1 });
db.analytics_data.createIndex({ "timestamp": 1, "metric_type": 1 });

db.dashboards.createIndex({ "user_id": 1 });
db.dashboards.createIndex({ "is_public": 1 });
db.dashboards.createIndex({ "createdAt": 1 });

db.chat_messages.createIndex({ "user_id": 1 });
db.chat_messages.createIndex({ "timestamp": 1 });
db.chat_messages.createIndex({ "session_id": 1 });

db.ai_insights.createIndex({ "user_id": 1 });
db.ai_insights.createIndex({ "createdAt": 1 });
db.ai_insights.createIndex({ "insight_type": 1 });

db.alerts.createIndex({ "user_id": 1 });
db.alerts.createIndex({ "is_active": 1 });
db.alerts.createIndex({ "createdAt": 1 });

// Insert sample analytics data
db.analytics_data.insertMany([
  {
    metric_type: "page_views",
    value: 1250,
    timestamp: new Date("2024-01-15T10:00:00Z"),
    metadata: { page: "/dashboard", source: "web" }
  },
  {
    metric_type: "conversion_rate",
    value: 3.2,
    timestamp: new Date("2024-01-15T10:00:00Z"),
    metadata: { funnel: "signup" }
  },
  {
    metric_type: "revenue",
    value: 15420.50,
    timestamp: new Date("2024-01-15T10:00:00Z"),
    metadata: { currency: "USD", source: "subscriptions" }
  },
  {
    metric_type: "active_users",
    value: 890,
    timestamp: new Date("2024-01-15T10:00:00Z"),
    metadata: { period: "daily" }
  }
]);

print("AnalyticsAI Dashboard database initialized successfully!");
