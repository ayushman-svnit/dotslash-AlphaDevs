import httpx
import logging
from typing import Dict, Any, List
from app.core.config import settings

logger = logging.getLogger(__name__)

# Loaded from .env via Settings
ML_ROUTING_API_URL = settings.ML_ROUTING_API_URL

async def call_ml_routing_model(source_lat: float, source_lng: float, target_lat: float, target_lng: float) -> Dict[str, Any]:
    """
    Hands over the coordinates to your friend's ML model to get the safest route.
    Wait for the GeoJSON list of coordinates.
    """
    try:
        # payload = {
        #     "source": {"lat": source_lat, "lng": source_lng},
        #     "target": {"lat": target_lat, "lng": target_lng}
        # }
        
        # async with httpx.AsyncClient() as client:
        #     response = await client.post(ML_ROUTING_API_URL, json=payload)
        #     return response.json()
        
        # MOCK FOR THE FRIEND'S HACKATHON MODEL
        return {
            "status": "success",
            "model_identifier": "EcoRoute-AI-v2",
            "is_ml_optimized": True
        }
    except Exception as e:
        logger.error(f"ML Model Predict Failure: {e}")
        return {
            "status": "error",
            "message": "AI model server unreachable"
        }
