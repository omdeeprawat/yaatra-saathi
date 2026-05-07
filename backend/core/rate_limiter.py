import redis
from fastapi import HTTPException, status
from core.config import settings
from typing import Optional
import logging
import time
from uuid import uuid4

logger = logging.getLogger(__name__)

# Initialize Redis client
_redis_client: Optional[redis.Redis] = None


def get_redis_client() -> redis.Redis:
  #redis client
  global _redis_client
  if _redis_client is None:
    _redis_client = redis.from_url(
      settings.REDIS_URL,
      decode_responses=True
    )
  return _redis_client


class RateLimiter:
    
  def __init__(self, max_requests: int, window_seconds: int, name: str = "default"):
      
    self.max_requests = max_requests
    self.window_seconds = window_seconds
    self.name = name

  _SLIDING_WINDOW_LUA = """
local key = KEYS[1]
local now_ms = tonumber(ARGV[1])
local window_ms = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]

local min_score = now_ms - window_ms
redis.call('ZREMRANGEBYSCORE', key, 0, min_score)

local count = redis.call('ZCARD', key)
if count >= limit then
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local retry_after_ms = window_ms
  if oldest[2] then
    retry_after_ms = math.max(0, window_ms - (now_ms - tonumber(oldest[2])))
  end
  return {0, count, retry_after_ms}
end

redis.call('ZADD', key, now_ms, member)
redis.call('PEXPIRE', key, window_ms)
return {1, count + 1, 0}
"""

  async def check_rate_limit(self, user_id: int) -> None:
    # Atomic sliding-window rate limit with Redis sorted sets
    try:
      redis_client = get_redis_client()
      key = f"rate_limit:{self.name}:{user_id}"
      now_ms = int(time.time() * 1000)
      window_ms = self.window_seconds * 1000
      member = f"{now_ms}-{uuid4()}"

      allowed, count_after, retry_after_ms = redis_client.eval(
        self._SLIDING_WINDOW_LUA,
        1,
        key,
        now_ms,
        window_ms,
        self.max_requests,
        member,
      )

      allowed = int(allowed)
      count_after = int(count_after)
      retry_after_ms = int(retry_after_ms)

      if allowed == 0:
        retry_after_seconds = max(1, (retry_after_ms + 999) // 1000)
        logger.warning(
          "Rate limit exceeded for user %s on %s. Count: %s/%s",
          user_id,
          self.name,
          count_after,
          self.max_requests,
        )
        raise HTTPException(
          status_code=status.HTTP_429_TOO_MANY_REQUESTS,
          detail=(
            f"Rate limit exceeded. Maximum {self.max_requests} requests "
            f"per {self.window_seconds} seconds. Try again in {retry_after_seconds} seconds."
          ),
          headers={
            "Retry-After": str(retry_after_seconds),
            "X-RateLimit-Limit": str(self.max_requests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Window": str(self.window_seconds),
          },
        )

      remaining = max(0, self.max_requests - count_after)
      logger.debug(
        "Rate limit ok user=%s name=%s remaining=%s",
        user_id,
        self.name,
        remaining,
      )
        
    except redis.RedisError as e: 
      logger.error(f"Redis error in rate limiter: {str(e)}")
      raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Rate limiter unavailable. Please try again.",
      )
  
  def reset_limit(self, user_id: int) -> None:
    # manually resetting rate limit
    try:
      redis_client = get_redis_client()
      key = f"rate_limit:{self.name}:{user_id}"
      redis_client.delete(key)
      logger.info(f"Rate limit reset for user {user_id} on {self.name}")
    except redis.RedisError as e:
      logger.error(f"Redis error resetting rate limit: {str(e)}")
  
  def get_remaining(self, user_id: int) -> tuple[int, int]:
      # remaining requests in current sliding window + seconds to reset
      try:
        redis_client = get_redis_client()
        key = f"rate_limit:{self.name}:{user_id}"

        now_ms = int(time.time() * 1000)
        window_ms = self.window_seconds * 1000
        min_score = now_ms - window_ms
        redis_client.zremrangebyscore(key, 0, min_score)

        current_count = redis_client.zcard(key)
        remaining = max(0, self.max_requests - current_count)

        pttl = redis_client.pttl(key)
        ttl_seconds = 0 if pttl is None or pttl < 0 else int((pttl + 999) // 1000)

        return remaining, ttl_seconds
      
      except redis.RedisError:
        return self.max_requests, 0


# pre-configured rate limits for endpoints
chat_rate_limiter = RateLimiter(
  max_requests=20,
  window_seconds=60,
  name="chat"
)

image_upload_limiter = RateLimiter(
  max_requests=5,
  window_seconds=60,
  name="image_upload"
)

post_creation_limiter = RateLimiter(
  max_requests=10,
  window_seconds=60,
  name="post_creation"
)

otp_resend_limiter = RateLimiter(
  max_requests=3,
  window_seconds=300,  
  name="otp_resend"
)