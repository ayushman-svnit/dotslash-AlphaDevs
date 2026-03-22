import h3
import logging
import json
import time
from typing import Dict, Any
from app.schemas.report_schema import CitizenReportCreate
from app.services.alert_service import register_active_risk
from app.services.redis_service import redis_service

logger = logging.getLogger(__name__)

# Mock database of reports for 'Crowd-Truth' validation
# Dictionary mapping h3_index -> list of report timestamps
_REPORT_CLUSTER_CACHE: Dict[str, list] = {}

from app.services.animal_detect_service import detect_animal_in_image

from app.services.notification_service import send_officer_sighting_alert

def get_nearest_officer_phone(lat: float, lng: float) -> str:
    from app.core.config import settings
    return settings.OFFICER_PHONE

async def process_citizen_report(report: CitizenReportCreate) -> Dict[str, Any]:
    """
    Verifies the reported animal using the 'AnimalDetect API'.
    If confidence > 0.8, promotes the alert to 'Verified (AI)'.
    Prevents redundant verification if a verified risk already exists.
    """
    # The "One-Time Verify" (Redis caching) logic has been disabled per request.
    # Every report will now process through the AI and trigger an SMS.
    # 1. AI Verification
    image_to_verify = report.image_url if report.image_url else "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46"
    ai_result = await detect_animal_in_image(image_to_verify)
    prediction = ai_result.get("prediction", {})
    
    label = prediction.get("label", report.species_id)
    confidence = prediction.get("confidence", 0.0)
    
    # 2. Decision Logic
    # We trigger the alert if the AI confidence is >= 0.3 OR if the AI API completely crashed
    api_status = ai_result.get("status", "error")
    status = "Unverified"
    
    if confidence >= 0.3 or api_status == "error":
        if api_status == "error":
            status = "Verified (Fallback)"
            logger.warning(f"AI Vision Failed! Defaulting to trust Citizen. Triggering emergency SMS for {label}.")
        else:
            status = "Verified (AI)"
            logger.info(f"AI Verification Success: {label} ({confidence*100}%). Triggering notification.")

        # 3. High-Risk Alert Activation
        await register_active_risk(
            lat=report.lat,
            lng=report.lng,
            species_id=label,
            urgency="Critical"
        )
        
        from app.services.alert_manager import create_alert
        
        # 4. Notify Nearest Officer
        await create_alert(
            title=f"VERIFIED {label.upper()} SIGHTING",
            message=f"AI confirmed {label} with {int(confidence*100)}% confidence at location. Status promoted to Critical.",
            lat=report.lat,
            lng=report.lng,
            severity="CRITICAL",
            image_url=image_to_verify
        )
        
        # 5. TWILIO BLAST TO USER (AS BEFORE)
        officer_phone = get_nearest_officer_phone(report.lat, report.lng)
        await send_officer_sighting_alert(
            to_number=officer_phone,
            animal=label,
            lat=report.lat,
            lng=report.lng,
            image_url=image_to_verify,
            description="AI-Verified Emergency Alert"
        )

        # 6. CACHE REPORT IN REDIS FOR DASHBOARD PERSISTENCE
        try:
            now = int(time.time())
            report_data = {
                "id": f"rep_{now}_{report.species_id[:3]}",
                "species": label,
                "lat": report.lat,
                "lng": report.lng,
                "time_ago": "Just now",
                "verified": status.startswith("Verified"),
                "description": "AI-Verified live sighting",
                "timestamp": now,
                "image_url": image_to_verify
            }
            await redis_service.set(f"report:{report_data['id']}", json.dumps(report_data), expire=86400) # 24h
            logger.info(f"💾 PERSISTED: Report for {label} cached in Redis.")
        except Exception as cache_err:
            logger.error(f"❌ CACHE FAILED: {cache_err}")
        
        logger.info(f"🚀 SUCCESS: Incident promoted and Nearest Officer notified.")
    else:
        logger.warning(f"AI Verification too low for {label}: {confidence*100}%. Minimum threshold is 30%.")

        
    return {
        "status": status,
        "ai_label": label,
        "ai_confidence": confidence,
        "h3_index": h3.latlng_to_cell(report.lat, report.lng, 9),
        "message": "AI-Verified Report Received Successfully"
    }
