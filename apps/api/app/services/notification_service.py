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
    
    # Format message to stay within 160 characters (1 segment)
    # 4 decimal places = ~11m precision, enough for sightings
    map_link = f"google.com/maps?q={lat:.4f},{lng:.4f}"
    
    # Format message to stay within 160 characters (1 segment)
    # 3 decimal places = ~110m precision, enough for general sightings
    map_link = f"google.com/maps?q={lat:.3f},{lng:.3f}"
    
    if is_danger_zone:
        # Format 1: Danger Zone entry (~35 chars)
        message = f"W:{animal.upper()}! @{map_link}"
    else:
        # Format 2: Animal Detection (~110-120 chars)
        category = animal.upper()[:8]
        
        # Shorten Cloudinary URL by removing the version segment (v12345678/)
        img = image_url or "no-img"
        import re
        img = re.sub(r'/v\d+/', '/', img)
        
        message = f"S:{category} @{map_link} *{img}"



    data = {
        "From": settings.TWILIO_PHONE_NUMBER,
        "To": to_number,
        "Body": message[:160]
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
