import h3
import json
import logging
import asyncio
from typing import Dict, Any, List
from app.services.redis_service import redis_service

logger = logging.getLogger(__name__)

# In memory fallback if redis is unavailable
_ACTIVE_RISKS_CACHE = {}

async def register_active_risk(lat: float, lng: float, species_id: str, urgency: str = "Moderate"):
    """
    Spatially indexes a risk into an H3 cell (Resolution 9) and stores it in Redis.
    """
    try:
        # Get H3 index for Resolution 9
        h3_index = h3.latlng_to_cell(lat, lng, 9)
        risk_data = {
            "lat": lat,
            "lng": lng,
            "species_id": species_id,
            "urgency": urgency,
            "h3_index": h3_index
        }
        
        # Store in Redis (or memory) with an expiry (e.g., 30 minutes)
        key = f"risk:{h3_index}:{species_id}"
        await redis_service.set(key, json.dumps(risk_data), expire=1800)
        _ACTIVE_RISKS_CACHE[key] = risk_data
        
        logger.info(f"Registered active risk at {h3_index} for {species_id}")
        return h3_index
    except Exception as e:
        logger.error(f"Error registering risk: {e}")
        return None

async def check_user_intersection(user_id: str, lat: float, lng: float, speed_kmh: float) -> List[Dict[str, Any]]:
    """
    Is User_Cell == Animal_Cell OR Neighbor_Cell?
    """
    try:
        user_cell = h3.latlng_to_cell(lat, lng, 9)
        # Get cell and its immediate neighbors (k=1)
        k_ring = h3.grid_disk(user_cell, 1)
        
        alerts = []
        for cell in k_ring:
            # In a real app, query Redis for all keys matching `risk:{cell}:*`
            # Here we mock by checking our in-memory cache/redis pattern.
            # Using _ACTIVE_RISKS_CACHE as a fast fallback proxy for pattern matching.
            for key, risk_data in _ACTIVE_RISKS_CACHE.items():
                if f"risk:{cell}:" in key:
                    # Calculate Time-to-Collision (TTC) based on speed and distance
                    # Using Haversine or simple distance for mockup
                    distance_km = 0.5 # mock distance
                    ttc_sec = int((distance_km / speed_kmh) * 3600) if speed_kmh > 0 else 9999
                    
                    alerts.append({
                        "lat": risk_data["lat"],
                        "lng": risk_data["lng"],
                        "species_id": risk_data["species_id"],
                        "urgency_level": risk_data["urgency"] if ttc_sec > 10 else "Critical",
                        "time_to_collision_sec": ttc_sec,
                        "location_h3_index": cell
                    })
                    
        return alerts
    except Exception as e:
        logger.error(f"Intersection Engine Error: {e}")
        return []
