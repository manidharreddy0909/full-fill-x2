"""
FULFILL-X Core Rate Limiting Engine (Phase 3)
In-memory sliding window rate limiter for authentication endpoints and sensitive API operations.
"""
import time
import logging
from typing import Dict, List, Tuple
from fastapi import HTTPException, status

logger = logging.getLogger("fulfillx.rate_limit")


class SlidingWindowRateLimiter:
    """
    In-memory Sliding Window Rate Limiter.
    Limits requests per key (client IP or user ID) within a rolling time window.
    """

    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[float]] = {}

    def check(self, key: str) -> bool:
        now = time.time()
        cutoff = now - self.window_seconds

        if key not in self.requests:
            self.requests[key] = [now]
            return True

        # Evict timestamps outside rolling window
        timestamps = [ts for ts in self.requests[key] if ts > cutoff]
        self.requests[key] = timestamps

        if len(timestamps) >= self.max_requests:
            logger.warning(f"Rate limit exceeded for key '{key}': {len(timestamps)} requests in {self.window_seconds}s")
            return False

        self.requests[key].append(now)
        return True


# Global instances for critical routes
auth_rate_limiter = SlidingWindowRateLimiter(max_requests=10, window_seconds=60)
data_reset_rate_limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=60)
