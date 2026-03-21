import httpx
import json
import logging
import asyncio
from typing import Dict, Any

logger = logging.getLogger(__name__)

SPACE_BASE = "https://nikhilpat-eco-route-model.hf.space"

async def call_ml_routing_model(source_lat: float, source_lng: float, target_lat: float, target_lng: float) -> Dict[str, Any]:
    """
    Calls the Eco-Route Gradio Space via its REST /api/predict endpoint.
    Returns a GeoJSON-ready dict with prediction_points as coordinates.
    """
    try:
        logger.info(f"🌿 Calling Gradio Space REST API: ({source_lat},{source_lng}) -> ({target_lat},{target_lng})")
        
        payload = {
            "data": [source_lat, source_lng, target_lat, target_lng],
            "fn_index": 0
        }
        
        async with httpx.AsyncClient(timeout=120.0, verify=False) as client:
            response = await client.post(
                f"{SPACE_BASE}/api/predict",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
        
        if response.status_code != 200:
            raise Exception(f"Gradio returned {response.status_code}: {response.text[:200]}")
        
        result = response.json()
        
        # Gradio wraps the result: { "data": ["<json-string>"] }
        raw = result.get("data", [None])[0]
        if raw is None:
            raise Exception("Gradio returned empty data array")
        
        model_output = json.loads(raw) if isinstance(raw, str) else raw
        
        points = model_output.get("prediction_points", [])
        meta   = model_output.get("metadata", {})
        
        if not points:
            raise Exception("Model returned 0 prediction_points")
        
        logger.info(f"✅ Eco-Route: {len(points)} points, {meta.get('total_route_distance_m', 0):.0f}m")
        
        # Build coordinate list: GeoJSON is [lng, lat], Leaflet uses [lat, lng]
        coordinates = [[p["longitude"], p["latitude"]] for p in points]  # GeoJSON [lng, lat]
        positions   = [[p["latitude"],  p["longitude"]] for p in points]  # Leaflet [lat, lng]
        
        return {
            "status": "success",
            "model_identifier": "EcoRoute-AI-v2",
            "is_ml_optimized": True,
            "metadata": meta,
            "positions": positions,   # Direct [lat,lng] array for Leaflet
            "geojson": {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": coordinates
                },
                "properties": {
                    "description": "Eco-Safe AI Predicted Route",
                    "best_overall_zone": meta.get("best_overall_zone"),
                    "composite_score": meta.get("best_composite_score"),
                    "total_distance_m": meta.get("total_route_distance_m")
                }
            }
        }

    except Exception as e:
        logger.error(f"❌ Eco-Route ML call failed: {e}")
        return {
            "status": "error",
            "message": str(e)
        }
