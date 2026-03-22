import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

async def send_twilio_sms(to_number: str, animal: str, lat: float, lng: float, image_url: str = None, description: str = "No additional details", is_danger_zone: bool = False):
    """
    Sends a rich SMS/MMS alert to the target phone. Differentiates between Zone Entry and Animal Detection.
    Strictly optimized to fit within ONE GSM-7 segment (160 characters).
    """
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        logger.warning("Twilio credentials missing. Skipping SMS alert.")
        return False

    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
    
    # g.co/maps?q= saves 6 chars over google.com/maps?q=
    map_link = f"g.co/maps?q={lat:.3f},{lng:.3f}"
    
    # ASCII normalized components
    animal_clean = animal.upper().encode('ascii', 'ignore').decode('ascii')
    img_raw = image_url or "no-img"
    import re
    img_clean = re.sub(r'/v\d+/', '/', img_raw)
    img_clean = img_clean.replace("https://res.cloudinary.com/", "res.cloudinary.com/").replace("http://res.cloudinary.com/", "res.cloudinary.com/")

    if is_danger_zone:
        # Format 1: Danger Zone entry (~35-45 chars)
        label_limit = 155 - len(map_link) - 5
        animal_label = animal_clean[:label_limit]
        message = f"W:{animal_label}! @{map_link}"
    else:
        # Format 2: Animal Detection
        # Priority: map_link > img_clean > category
        base_str = f"S: @ {map_link} *"
        remaining = 158 - len(base_str)
        # Allocate rest to image and category
        category = animal_clean[:10]
        img_final = img_clean[:max(0, remaining - len(category))]
        message = f"S:{category} @{map_link} *{img_final}"

    # Strict Guarantee: One Segment (160 Chars)
    final_body = message[:159]
    logger.info(f"📏 SMS Segment: {len(final_body)} ch | {final_body}")

    data = {
        "From": settings.TWILIO_PHONE_NUMBER,
        "To": to_number,
        "Body": final_body
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
