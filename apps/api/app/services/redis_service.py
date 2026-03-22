import redis.asyncio as redis
from app.core.config import settings

class RedisService:
    def __init__(self):
        self._redis = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            decode_responses=True,
            socket_connect_timeout=2.0,
            socket_timeout=2.0,
            retry_on_timeout=False
        )
        self.is_available = True
        self._last_retry = 0

    @property
    def redis(self):
        return self._redis

    async def get(self, key: str):
        try:
            val = await self.redis.get(key)
            self.is_available = True
            return val
        except Exception as e:
            if self.is_available:
                import logging
                logging.getLogger(__name__).error(f"Redis READ FAULT: {e}")
            self.is_available = False
            return None # Fail gracefully and return nothing

    async def set(self, key: str, value: str, expire: int = None):
        try:
            await self.redis.set(key, value, ex=expire)
            self.is_available = True
        except Exception as e:
            if self.is_available:
                import logging
                logging.getLogger(__name__).error(f"Redis WRITE FAULT: {e}")
            self.is_available = False
            # Just log and continue, non-critical

redis_service = RedisService()
