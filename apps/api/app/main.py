from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.routers import authority, officer, citizen, routing_router, alert_router, report_router
from app.core.config import settings
from app.core.security import get_current_user
from app.services.redis_service import redis_service

app = FastAPI(
    title="Hackathon Starter API",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers — authority + officer are JWT-protected
app.include_router(authority.router, prefix="/api/v1/authority", tags=["authority"],
                   dependencies=[Depends(get_current_user)])
app.include_router(officer.router, prefix="/api/v1/officer", tags=["officer"],
                   dependencies=[Depends(get_current_user)])
app.include_router(citizen.router, prefix="/api/v1/citizen", tags=["citizen"])
app.include_router(routing_router.router, prefix="/api/v1/routing", tags=["routing"])
app.include_router(alert_router.router, prefix="/ws/alerts", tags=["alerts"])
app.include_router(report_router.router, prefix="/api/v1/report", tags=["reports"])

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
