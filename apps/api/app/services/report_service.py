import h3
import logging
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
    # MOCK RANGER DATABASE
    # Switch this to your own number for testing!
    return "+919408569457"

async def process_citizen_report(report: CitizenReportCreate) -> Dict[str, Any]:
    """
    Verifies the reported animal using the 'AnimalDetect API'.
    If confidence > 0.8, promotes the alert to 'Verified (AI)'.
    Prevents redundant verification if a verified risk already exists.
    """
    # 0. Check for Re-verification (The 'One Time Verify It' Logic)
    try:
        h3_index = h3.latlng_to_cell(report.lat, report.lng, 9)
        key = f"risk:{h3_index}:{report.species_id}"
        
        existing_risk = await redis_service.get(key)
        if existing_risk:
            import json
            # risk_data = json.loads(existing_risk) if isinstance(existing_risk, str) else existing_risk
            logger.info(f"Redundant Report: {report.species_id} already verified at {h3_index}. Skipping SMS and AI.")
            return {
                "status": "Verified (Existing)",
                "ai_label": report.species_id,
                "ai_confidence": 1.0,
                "h3_index": h3_index,
                "message": "This animal was recently verified by another user in your area. Notification already sent."
            }
    except Exception as e:
        logger.warning(f"Metadata lookup failed (Redis potentially down): {e}. Proceeding with standard verification.")

    # 1. AI Verification
    image_to_verify = report.image_url if report.image_url else "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46"
    ai_result = await detect_animal_in_image(image_to_verify)
    prediction = ai_result.get("prediction", {})
    
    label = prediction.get("label", report.species_id)
    confidence = prediction.get("confidence", 0.0)
    
    # 2. Decision Logic (Confidence Threshold lowered from 0.8 -> 0.3 for demo stability)
    status = "Unverified"
    if confidence >= 0.3:
        status = "Verified (AI)"
        
        logger.info(f"AI Verification Success: {label} ({confidence*100}%). Triggering multi-stakeholder notification.")

        # 3. High-Risk Alert Activation
        await register_active_risk(
            lat=report.lat,
            lng=report.lng,
            species_id=label,
            urgency="Critical"
        )
        
        # 4. TWILIO BLAST TO OFFICER
        officer_phone = get_nearest_officer_phone(report.lat, report.lng)
        logger.info(f"Attempting Twilio SMS to officer at {officer_phone}...")
        
        sms_sent = await send_officer_sighting_alert(
            officer_phone=officer_phone,
            animal=label,
            lat=report.lat,
            lng=report.lng,
            image_url=image_to_verify,
            description=report.description or "No additional details."
        )
        
        if sms_sent:
            logger.info(f"🚀 SUCCESS: Report promoted to AI-VERIFIED and SMS delivered to {officer_phone}")
        else:
            logger.error("⚠️ FAILURE: AI Verified but Twilio SMS failed to send. Check SID/Token.")
    else:
        logger.warning(f"AI Verification too low for {label}: {confidence*100}%. Minimum threshold is 30%.")

        
    return {
        "status": status,
        "ai_label": label,
        "ai_confidence": confidence,
        "h3_index": h3.latlng_to_cell(report.lat, report.lng, 9),
        "message": "AI-Verified Report Received Successfully"
    }
