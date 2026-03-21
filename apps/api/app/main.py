from fastapi import FastAPI
from app.routers import authority, officer, citizen
from app.core.config import settings
from app.services.redis_service import redis_service

app = FastAPI(
    title="Hackathon Starter API",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Include routers
app.include_router(authority.router, prefix="/api/v1/authority", tags=["authority"])
app.include_router(officer.router, prefix="/api/v1/officer", tags=["officer"])
app.include_router(citizen.router, prefix="/api/v1/citizen", tags=["citizen"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Hackathon Starter API"}

@app.get("/health")
async def health_check():
    try:
        await redis_service.set("health-check", "ok", expire=10)
        redis_status = await redis_service.get("health-check")
        return {"status": "healthy", "redis": redis_status}
    except Exception as e:
        return {"status": "partially_healthy", "redis_error": str(e)}
