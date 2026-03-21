import httpx
import logging
from typing import Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

async def detect_animal_in_image(image_url: str) -> Dict[str, Any]:
    """
    Connects to the visual recognition API.
    If it fails, it returns an error status safely so the Emergency SMS protocol handles it.
    """
    logger.info(f"Initiating LIVE AI Visual Scan on: {image_url}")
    
    try:
        headers = {
            "Authorization": f"Bearer {settings.ANIMAL_DETECT_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "url": image_url,
            "threshold": 0.2
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.ANIMAL_DETECT_API_URL, 
                json=payload, 
                headers=headers,
                timeout=5.0
            )
            
            if response.status_code != 200:
                logger.error(f"AnimalDetect Error/404: {response.text}")
                return {"status": "error", "prediction": {}}

            data = response.json()
            annotations = data.get("annotations", [])
            
            if not annotations:
                return {
                    "status": "success",
                    "prediction": {"label": "None", "confidence": 0.0, "verified": False}
                }

            # Extract the top prediction
            top_prediction = annotations[0]
            return {
                "status": "success",
                "prediction": {
                    "label": top_prediction.get("label", "Unknown"),
                    "confidence": top_prediction.get("confidence", 0.0),
                    "verified": True
                }
            }

    except Exception as e:
        logger.error(f"Vision Engine Connectivity Failure: {e}")
        return {"status": "error", "prediction": {}}
