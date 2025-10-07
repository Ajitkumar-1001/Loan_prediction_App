from jose import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os
from pathlib import Path
from dotenv import load_dotenv
import sys


sys.path.append(str(Path(__file__).resolve().parent.parent))

# Import Redis client for token caching
try:
    from redis_client import redis_client, CacheKeys, CacheTTL
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False


env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 5


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ✅ Create JWT token
def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# ✅ Decode JWT token with Redis caching
def decode_access_token(token: str) -> str:
    """Decode JWT token and return email (with Redis caching)"""
    # Try to get from cache first
    if REDIS_AVAILABLE and redis_client.is_available():
        cache_key = CacheKeys.auth_token(token)
        cached_email = redis_client.get(cache_key)
        if cached_email:
            return cached_email

    # Cache miss or Redis unavailable - decode token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")

        # Cache the result
        if REDIS_AVAILABLE and redis_client.is_available() and email:
            cache_key = CacheKeys.auth_token(token)
            redis_client.set(cache_key, email, CacheTTL.AUTH_TOKEN)

        return email
    except jwt.JWTError:
        return None
