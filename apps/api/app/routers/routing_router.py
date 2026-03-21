from fastapi import APIRouter, Query, HTTPException
from typing import Any, Dict
from app.services.routing_service import get_eco_safe_route
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/eco-safe")
async def eco_safe_route(
    source_lat: float = Query(...),
    source_lng: float = Query(...),
    target_lat: float = Query(...),
    target_lng: float = Query(...),
    vehicle_type: str = Query("car")
):
    """
    Calls ML Eco-Route model (Gradio Space) for the safest path prediction.
    Falls back to OSMnx graph-based routing if model is unavailable.
    """
    try:
        result = await get_eco_safe_route(source_lat, source_lng, target_lat, target_lng, vehicle_type)
        if result.get("status") == "error":
            raise HTTPException(status_code=500, detail=result.get("message", "Routing failed"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Routing error: {e}")
        raise HTTPException(status_code=500, detail=f"Error calculating route: {str(e)}")

