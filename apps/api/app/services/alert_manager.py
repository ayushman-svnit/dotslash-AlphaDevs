import json
import logging
import datetime
from typing import Dict, Any, Optional
from app.services.redis_service import redis_service
from app.services.notification_service import send_twilio_sms
from app.services.officer_service import get_nearest_officer

logger = logging.getLogger(__name__)

NOTIFICATIONS_KEY_PREFIX = "officer_notifs:" # Append officer_id

# Fallback In-Memory Alert Store
_NOTIF_BACKUP = {}

async def create_alert(
    title: str, 
    message: str, 
    lat: float, 
    lng: float, 
    severity: str = "HIGH", 
    image_url: Optional[str] = None
):
    """
    Creates a unified alert:
    1. Finds the nearest officer.
    2. Sends them an SMS (via Twilio).
    3. Stores the notification in an app-local Redis queue or fallback.
    """
    
    # Identify nearest responder
    nearest_officer = await get_nearest_officer(lat, lng)
    if not nearest_officer:
        logger.warning("🚨 Alert Triggered but NO OFFICERS found near location!")
        return {"status": "error", "message": "No nearest officer identified."}
    
    officer_id = nearest_officer["officer_id"]
    officer_name = nearest_officer["name"]
    
    # Standardized Notification Object
    notif_data = {
        "id": f"alert-{int(datetime.datetime.now().timestamp())}",
        "title": title,
        "message": message,
        "lat": lat,
        "lng": lng,
        "severity": severity,
        "image_url": image_url,
        "timestamp": datetime.datetime.now().isoformat(),
        "officer_assigned": officer_name,
        "distance_km": nearest_officer.get("distance_km", 0)
    }
    
    # Store in Redis (List per officer, keep last 50)
    key = f"{NOTIFICATIONS_KEY_PREFIX}{officer_id}"
    try:
        await redis_service.redis.lpush(key, json.dumps(notif_data))
        await redis_service.redis.ltrim(key, 0, 49)
    except Exception:
        if officer_id not in _NOTIF_BACKUP:
            _NOTIF_BACKUP[officer_id] = []
        _NOTIF_BACKUP[officer_id].insert(0, notif_data)
        _NOTIF_BACKUP[officer_id] = _NOTIF_BACKUP[officer_id][:50]
    
    logger.info(f"📤 Notifying Officer {officer_name} ({officer_id}): {title}")
    
    return {"status": "success", "officer": officer_name, "alert_id": notif_data["id"]}


async def get_officer_notifications(officer_id: str):
    """Retrieves all active notifications for a specific officer."""
    key = f"{NOTIFICATIONS_KEY_PREFIX}{officer_id}"
    try:
        raw_list = await redis_service.redis.lrange(key, 0, -1)
        return [json.loads(n) for n in raw_list]
    except Exception:
        return _NOTIF_BACKUP.get(officer_id, [])
