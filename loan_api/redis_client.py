"""
Redis Client Manager
Provides connection pooling and utility functions for Redis caching
"""
import redis
import json
import os
from typing import Optional, Any, List
from datetime import timedelta
from config.config import logger


class RedisClient:
    """Redis client with connection pooling and helper methods"""

    def __init__(self):
        """Initialize Redis connection pool"""
        redis_host = os.getenv("REDIS_HOST", "redis")
        redis_port = int(os.getenv("REDIS_PORT", 6379))
        redis_db = int(os.getenv("REDIS_DB", 0))
        redis_password = os.getenv("REDIS_PASSWORD", None)

        try:
            self.client = redis.Redis(
                host=redis_host,
                port=redis_port,
                db=redis_db,
                password=redis_password,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_keepalive=True,
                health_check_interval=30
            )
            # Test connection
            self.client.ping()
            logger.info(f"✅ Redis connected: {redis_host}:{redis_port}")
        except redis.ConnectionError as e:
            logger.warning(f"⚠️ Redis connection failed: {e}. Caching disabled.")
            self.client = None
        except Exception as e:
            logger.error(f"❌ Redis initialization error: {e}")
            self.client = None

    def is_available(self) -> bool:
        """Check if Redis is available"""
        if not self.client:
            return False
        try:
            self.client.ping()
            return True
        except:
            return False

    # ============ Basic Operations ============

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """
        Set a key-value pair in Redis

        Args:
            key: Redis key
            value: Value to store (will be JSON serialized)
            ttl: Time to live in seconds (optional)

        Returns:
            True if successful, False otherwise
        """
        if not self.is_available():
            return False

        try:
            serialized = json.dumps(value)
            if ttl:
                self.client.setex(key, ttl, serialized)
            else:
                self.client.set(key, serialized)
            return True
        except Exception as e:
            logger.error(f"Redis SET error for key '{key}': {e}")
            return False

    def get(self, key: str) -> Optional[Any]:
        """
        Get value from Redis

        Args:
            key: Redis key

        Returns:
            Deserialized value or None
        """
        if not self.is_available():
            return None

        try:
            value = self.client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Redis GET error for key '{key}': {e}")
            return None

    def delete(self, *keys: str) -> int:
        """
        Delete one or more keys

        Args:
            keys: Redis keys to delete

        Returns:
            Number of keys deleted
        """
        if not self.is_available():
            return 0

        try:
            return self.client.delete(*keys)
        except Exception as e:
            logger.error(f"Redis DELETE error: {e}")
            return 0

    def exists(self, key: str) -> bool:
        """Check if key exists"""
        if not self.is_available():
            return False

        try:
            return bool(self.client.exists(key))
        except Exception as e:
            logger.error(f"Redis EXISTS error for key '{key}': {e}")
            return False

    def expire(self, key: str, ttl: int) -> bool:
        """Set expiration on a key"""
        if not self.is_available():
            return False

        try:
            return bool(self.client.expire(key, ttl))
        except Exception as e:
            logger.error(f"Redis EXPIRE error for key '{key}': {e}")
            return False

    # ============ List Operations ============

    def lpush(self, key: str, *values: Any) -> int:
        """Push values to the left of a list"""
        if not self.is_available():
            return 0

        try:
            serialized = [json.dumps(v) for v in values]
            return self.client.lpush(key, *serialized)
        except Exception as e:
            logger.error(f"Redis LPUSH error for key '{key}': {e}")
            return 0

    def rpush(self, key: str, *values: Any) -> int:
        """Push values to the right of a list"""
        if not self.is_available():
            return 0

        try:
            serialized = [json.dumps(v) for v in values]
            return self.client.rpush(key, *serialized)
        except Exception as e:
            logger.error(f"Redis RPUSH error for key '{key}': {e}")
            return 0

    def lrange(self, key: str, start: int = 0, end: int = -1) -> List[Any]:
        """Get a range of values from a list"""
        if not self.is_available():
            return []

        try:
            values = self.client.lrange(key, start, end)
            return [json.loads(v) for v in values]
        except Exception as e:
            logger.error(f"Redis LRANGE error for key '{key}': {e}")
            return []

    def ltrim(self, key: str, start: int, end: int) -> bool:
        """Trim a list to the specified range"""
        if not self.is_available():
            return False

        try:
            return bool(self.client.ltrim(key, start, end))
        except Exception as e:
            logger.error(f"Redis LTRIM error for key '{key}': {e}")
            return False

    # ============ Hash Operations ============

    def hset(self, name: str, key: str, value: Any) -> int:
        """Set hash field"""
        if not self.is_available():
            return 0

        try:
            return self.client.hset(name, key, json.dumps(value))
        except Exception as e:
            logger.error(f"Redis HSET error for hash '{name}': {e}")
            return 0

    def hget(self, name: str, key: str) -> Optional[Any]:
        """Get hash field"""
        if not self.is_available():
            return None

        try:
            value = self.client.hget(name, key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Redis HGET error for hash '{name}': {e}")
            return None

    def hgetall(self, name: str) -> dict:
        """Get all hash fields"""
        if not self.is_available():
            return {}

        try:
            data = self.client.hgetall(name)
            return {k: json.loads(v) for k, v in data.items()}
        except Exception as e:
            logger.error(f"Redis HGETALL error for hash '{name}': {e}")
            return {}

    def hdel(self, name: str, *keys: str) -> int:
        """Delete hash fields"""
        if not self.is_available():
            return 0

        try:
            return self.client.hdel(name, *keys)
        except Exception as e:
            logger.error(f"Redis HDEL error for hash '{name}': {e}")
            return 0

    # ============ Pattern Operations ============

    def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching a pattern"""
        if not self.is_available():
            return 0

        try:
            keys = list(self.client.scan_iter(match=pattern))
            if keys:
                return self.client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Redis DELETE_PATTERN error for pattern '{pattern}': {e}")
            return 0

    def keys(self, pattern: str = "*") -> List[str]:
        """Get all keys matching pattern"""
        if not self.is_available():
            return []

        try:
            return list(self.client.scan_iter(match=pattern))
        except Exception as e:
            logger.error(f"Redis KEYS error for pattern '{pattern}': {e}")
            return []

    # ============ Cache Helpers ============

    def cache_get_or_set(self, key: str, func, ttl: Optional[int] = None) -> Any:
        """
        Get from cache or compute and cache the result

        Args:
            key: Cache key
            func: Function to call if cache miss
            ttl: Time to live in seconds

        Returns:
            Cached or computed value
        """
        # Try to get from cache
        cached = self.get(key)
        if cached is not None:
            logger.debug(f"Cache HIT: {key}")
            return cached

        # Cache miss - compute value
        logger.debug(f"Cache MISS: {key}")
        value = func()

        # Cache the result
        self.set(key, value, ttl)
        return value

    def invalidate_cache(self, *patterns: str):
        """Invalidate cache entries matching patterns"""
        for pattern in patterns:
            deleted = self.delete_pattern(pattern)
            if deleted:
                logger.info(f"Invalidated {deleted} cache entries for pattern: {pattern}")

    # ============ Health Check ============

    def health_check(self) -> dict:
        """Get Redis health status"""
        if not self.is_available():
            return {
                "status": "unhealthy",
                "error": "Redis not available"
            }

        try:
            info = self.client.info()
            return {
                "status": "healthy",
                "version": info.get("redis_version"),
                "used_memory": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients"),
                "uptime_days": info.get("uptime_in_days")
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }


# Global Redis client instance
redis_client = RedisClient()


# ============ Cache Key Generators ============

class CacheKeys:
    """Cache key generators for different data types"""

    # Document caching
    @staticmethod
    def documents_list() -> str:
        return "documents:list:active"

    @staticmethod
    def document(doc_id: str) -> str:
        return f"documents:doc:{doc_id}"

    # User caching
    @staticmethod
    def user(email: str) -> str:
        return f"users:user:{email}"

    @staticmethod
    def user_by_id(user_id: int) -> str:
        return f"users:user:id:{user_id}"

    # Chat session caching
    @staticmethod
    def chat_session(session_id: str) -> str:
        return f"chat:session:{session_id}"

    @staticmethod
    def chat_history(session_id: str) -> str:
        return f"chat:history:{session_id}"

    # Authentication caching
    @staticmethod
    def auth_token(token: str) -> str:
        return f"auth:token:{token[:20]}"  # Use hash for security

    @staticmethod
    def user_sessions(email: str) -> str:
        return f"auth:sessions:{email}"


# ============ TTL Constants ============

class CacheTTL:
    """Time-to-live constants for different cache types"""

    MINUTE = 60
    HOUR = 3600
    DAY = 86400
    WEEK = 604800

    # Specific TTLs
    DOCUMENTS_LIST = 5 * MINUTE  # 5 minutes
    DOCUMENT = 15 * MINUTE        # 15 minutes
    USER = 30 * MINUTE             # 30 minutes
    CHAT_SESSION = 3 * MINUTE      # 3 minutes (same as localStorage)
    CHAT_HISTORY = 30 * MINUTE     # 30 minutes
    AUTH_TOKEN = 60 * MINUTE       # 1 hour
