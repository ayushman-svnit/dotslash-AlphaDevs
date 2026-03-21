import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

async def send_officer_sighting_alert(officer_phone: str, animal: str, lat: float, lng: float, image_url: str, description: str = "No additional details"):
    """
    Sends a rich SMS/MMS alert to the officer with location, photo, and problem context.
    """
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        logger.warning("Twilio credentials missing. Skipping SMS alert.")
        return False

    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
    maps_link = f"https://maps.google.com/?q={lat},{lng}"

    message = (
        f"🚨 WILDLIFE ALERT — ECO-ROUTE AI 🚨\n"
        f"Animal: {animal.upper()} (AI Verified)\n\n"
        f"📍 Location: {maps_link}\n"
        f"🗒 Situation: {description}\n"
        f"📸 Photo: {image_url}\n\n"
        f"⚡ Deploy corridor protection team immediately."
    )
    
    data = {
        "From": settings.TWILIO_PHONE_NUMBER,
        "To": officer_phone,
        "Body": message
    }
    
    # Optional: MediaUrl support for Twilio MMS
    if image_url:
        data["MediaUrl"] = image_url

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url, 
                data=data, 
                auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            )
            
            if response.status_code in [200, 201]:
                logger.info(f"Twilio alert sent to officer {officer_phone}")
                return True
            else:
                logger.error(f"Twilio failure: {response.text}")
                return False
    except Exception as e:
        logger.error(f"Twilio connectivity fail: {e}")
        return False
