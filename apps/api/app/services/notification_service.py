import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

async def send_twilio_sms(to_number: str, animal: str, lat: float, lng: float, image_url: str = None, description: str = "No additional details", is_danger_zone: bool = False):
    """
    Sends a rich SMS/MMS alert to the target phone. Differentiates between Zone Entry and Animal Detection.
    """
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        logger.warning("Twilio credentials missing. Skipping SMS alert.")
        return False

    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
    
    # Format message based on alert type
    map_link = f"maps.google.com/?q={lat},{lng}"
    
    if is_danger_zone:
        # Format 1: Clear warning for Danger Zone entry (no picture)
        message = f"WARNING: You entered a {animal.upper()} zone! L:{map_link}"
    else:
        # Format 2: Dense format for Animal Detection (includes picture URL)
        category = animal.upper()[:8]
        img = image_url or "http://no-img.link"
        message = f"ECO:{category} L:{map_link} P:{img}"

    data = {
        "From": settings.TWILIO_PHONE_NUMBER,
        "To": to_number,
        "Body": message
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url, 
                data=data, 
                auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            )
            
            if response.status_code in [200, 201]:
                logger.info(f"🚀 Twilio alert sent to {to_number} successfully.")
                return True
            else:
                resp_data = response.json()
                error_msg = resp_data.get("message", response.text)
                logger.error(f"❌ Twilio Error {response.status_code}: {error_msg}")
                return False
    except Exception as e:
        logger.error(f"Twilio connectivity fail: {e}")
        return False

# Legacy Alias for existing reporting logic
send_officer_sighting_alert = send_twilio_sms
