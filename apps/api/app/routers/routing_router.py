from fastapi import APIRouter, Query, HTTPException
from typing import Any, Dict
from app.services.routing_service import get_eco_safe_route
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/eco-safe", response_model=Dict[str, Any])
async def eco_safe_route(
    source_lat: float = Query(..., description="Latitude of the origin"),
    source_lng: float = Query(..., description="Longitude of the origin"),
    target_lat: float = Query(..., description="Latitude of the destination"),
    target_lng: float = Query(..., description="Longitude of the destination"),
    vehicle_type: str = Query("car", description="Type of vehicle (car, bike, truck)")
):
    """
    Returns the shortest path minimizing the dynamic wildlife 'eco_cost'.
    """
    try:
        result = get_eco_safe_route(source_lat, source_lng, target_lat, target_lng, vehicle_type)
        if result.get("status") == "error":
            raise HTTPException(status_code=404, detail=result.get("message"))
        return result
    except Exception as e:
        logger.error(f"Error calculating eco-safe route: {e}")
        raise HTTPException(status_code=500, detail=f"Error calculating route: {str(e)}")
