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
    
    # To fit BOTH URLs inside 122 characters (Trial Segment Limit):
    # 1. No Emojis (Forces UCS-2 encoding -> 70 char limit)
    # 2. Strip "https://" from Maps Link (phones auto-resolve it) to save 8 characters
    # 3. Super brief labels (L: = Location, P: = Photo)
    animal_short = animal.upper()[:8]
    map_short = f"maps.google.com/?q={lat},{lng}"
    
    # Format: ECO:ELEPHANT L:maps.google.com/?q=10.05,76.67 P:http://img.url
    message = f"ECO:{animal_short} L:{map_short} P:{image_url}"

    
    data = {
        "From": settings.TWILIO_PHONE_NUMBER,
        "To": officer_phone,
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
                logger.info(f"🚀 Twilio alert sent to officer {officer_phone} successfully.")
                return True
            else:
                resp_data = response.json()
                error_msg = resp_data.get("message", response.text)
                logger.error(f"❌ Twilio Error {response.status_code}: {error_msg}")
                return False
    except Exception as e:
        logger.error(f"Twilio connectivity fail: {e}")
        return False
