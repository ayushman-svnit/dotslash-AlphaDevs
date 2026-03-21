import h3
import logging
from typing import Dict, Any
from app.schemas.report_schema import CitizenReportCreate
from app.services.alert_service import register_active_risk

logger = logging.getLogger(__name__)

# Mock database of reports for 'Crowd-Truth' validation
# Dictionary mapping h3_index -> list of report timestamps
_REPORT_CLUSTER_CACHE: Dict[str, list] = {}

from app.services.animal_detect_service import detect_animal_in_image

from app.services.notification_service import send_officer_sighting_alert

def get_nearest_officer_phone(lat: float, lng: float) -> str:
    # MOCK RANGER DATABASE
    # Switch this to your own number for testing!
    return "+919558450146"

async def process_citizen_report(report: CitizenReportCreate) -> Dict[str, Any]:
    """
    Verifies the reported animal using the 'AnimalDetect API'.
    If confidence > 0.8, promotes the alert to 'Verified (AI)'.
    """
    # 1. AI Verification
    image_to_verify = report.image_url if report.image_url else "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46"
    ai_result = await detect_animal_in_image(image_to_verify)
    prediction = ai_result.get("prediction", {})
    
    label = prediction.get("label", report.species_id)
    confidence = prediction.get("confidence", 0.0)
    
    # 2. Decision Logic (Confidence Threshold of 0.8)
    status = "Unverified"
    if confidence >= 0.8:
        status = "Verified (AI)"
        
        # 3. High-Risk Alert Activation
        await register_active_risk(
            lat=report.lat,
            lng=report.lng,
            species_id=label,
            urgency="Critical"
        )
        
        # 4. TWILIO BLAST TO OFFICER
        officer_phone = get_nearest_officer_phone(report.lat, report.lng)
        await send_officer_sighting_alert(
            officer_phone=officer_phone,
            animal=label,
            lat=report.lat,
            lng=report.lng,
            image_url=image_to_verify,
            description=report.description or "No additional details."
        )
        
        logger.info(f"Report promoted to AI-VERIFIED: {label} ({confidence*100}%) and SMS SENT.")

        
    return {
        "status": status,
        "ai_label": label,
        "ai_confidence": confidence,
        "h3_index": h3.latlng_to_cell(report.lat, report.lng, 9),
        "message": "AI-Verified Report Received Successfully"
    }
