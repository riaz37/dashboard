import os
import redis.asyncio as redis
from typing import Optional

class RedisClient:
    client: Optional[redis.Redis] = None

redis_client = RedisClient()

async def get_redis_client():
    """Get Redis client instance"""
    if redis_client.client is None:
        await connect_to_redis()
    return redis_client.client

async def connect_to_redis():
    """Create Redis connection"""
    try:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        redis_client.client = redis.from_url(redis_url, decode_responses=True)
        
        # Test the connection
        await redis_client.client.ping()
        print("✅ Connected to Redis successfully")
        
    except Exception as e:
        print(f"❌ Failed to connect to Redis: {e}")
        raise e

async def close_redis_connection():
    """Close Redis connection"""
    if redis_client.client:
        await redis_client.client.close()
        print("🔌 Disconnected from Redis")
