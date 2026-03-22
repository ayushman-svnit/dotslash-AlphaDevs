import math
from typing import List, Dict, Tuple, Optional
import json
import logging
from app.services.redis_service import redis_service

logger = logging.getLogger(__name__)

OFFICERS_KEY = "active_officers_locations"

# Fallback In-Memory store if Redis is down
_OFFICER_BACKUP = {}

async def update_officer_posting(officer_id: str, name: str, lat: float, lng: float):
    """
    Updates the officer's current duty location in Redis (or in-memory fallback).
    """
    data = {"lat": lat, "lng": lng, "name": name, "officer_id": officer_id}
    try:
        await redis_service.redis.hset(OFFICERS_KEY, officer_id, json.dumps(data))
    except Exception:
        _OFFICER_BACKUP[officer_id] = data
    logger.info(f"📍 Officer {name} ({officer_id}) posted at {lat}, {lng}")

async def get_all_officers() -> List[Dict]:
    """Retrieves all active officers from Redis or fallback."""
    try:
        raw_data = await redis_service.redis.hgetall(OFFICERS_KEY)
        return [json.loads(v) for v in raw_data.values()]
    except Exception:
        return list(_OFFICER_BACKUP.values())

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine distance in KM."""
    R = 6371.0 # Radius of the Earth in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

async def get_nearest_officer(user_lat: float, user_lng: float) -> Optional[Dict]:
    """Finds the officer closest to the user's current location."""
    officers = await get_all_officers()
    if not officers:
        logger.warning("No officers found in the registry!")
        return None
    
    nearest = None
    min_dist = float('inf')
    
    for off in officers:
        dist = calculate_distance(user_lat, user_lng, off["lat"], off["lng"])
        if dist < min_dist:
            min_dist = dist
            nearest = off
            nearest["distance_km"] = round(dist, 2)
            
    return nearest
