from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import requests as _requests
import os

bearer_scheme = HTTPBearer(auto_error=False)

# ── Custom JWT (internal use) ──────────────────────────────────────────────
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-hackathon-super-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

# ── Firebase ID Token verification (no Admin SDK) ─────────────────────────
FIREBASE_PROJECT_ID = os.getenv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "dotslash-de720")
FIREBASE_JWKS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"

_jwks_cache: dict = {}

def _get_firebase_public_keys() -> dict:
    global _jwks_cache
    try:
        resp = _requests.get(FIREBASE_JWKS_URL, timeout=5)
        if resp.ok:
            _jwks_cache = resp.json()
    except Exception:
        pass
    return _jwks_cache

def verify_firebase_token(id_token: str) -> Optional[dict]:
    """Verify a Firebase ID token using Google's public keys."""
    try:
        keys = _get_firebase_public_keys()
        header = jwt.get_unverified_header(id_token)
        kid = header.get("kid")
        public_key = keys.get(kid)
        if not public_key:
            return None
        payload = jwt.decode(
            id_token,
            public_key,
            algorithms=["RS256"],
            audience=FIREBASE_PROJECT_ID,
            issuer=f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
        )
        return payload
    except Exception:
        return None

# ── FastAPI dependency ─────────────────────────────────────────────────────
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    """
    Accepts either a Firebase ID token or an internal JWT.
    Returns the decoded payload on success.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials

    # Try Firebase first
    payload = verify_firebase_token(token)
    if payload:
        return payload

    # Fall back to internal JWT
    payload = decode_access_token(token)
    if payload:
        return payload

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
