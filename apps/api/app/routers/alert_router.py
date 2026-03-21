import json
import logging
from typing import Dict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from app.services.alert_service import check_user_intersection
from app.services.notification_service import send_twilio_sms

logger = logging.getLogger(__name__)

router = APIRouter()

class ProximityRequest(BaseModel):
    user_id: str
    lat: float
    lng: float
    zone_type: str

@router.post("/proximity-sms")
async def send_proximity_sms(request: ProximityRequest):
    """
    Sends an SMS notification when a user enters a high-danger zone.
    """
    try:
        # Using the phone number provided by the user earlier: +919408569457
        target_phone = "+919408569457"
        
        # Format a brief alert message
        message_body = f"ECO ALERT: You entered a {request.zone_type} zone at {request.lat},{request.lng}. Stay alert!"
        
        success = await send_twilio_sms(
            to_number=target_phone,
            animal=request.zone_type,
            lat=request.lat,
            lng=request.lng,
            description=f"Entered {request.zone_type}",
            is_danger_zone=True
        )
        
        if success:
            return {"status": "success", "message": "SMS alert dispatched"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send SMS via Twilio")
            
    except Exception as e:
        logger.error(f"Error sending proximity SMS: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Connection manager for active WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_binary(self, message: bytes, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_binary(message) # Use built-in send_binary if available, or send_bytes

manager = ConnectionManager()

@router.websocket("/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Wait for client to send their current GPS and speed
            # Expected format: {"lat": 22.33, "lng": 80.61, "speed_kmh": 60}
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            lat = payload.get("lat")
            lng = payload.get("lng")
            speed = payload.get("speed_kmh", 0)
            
            if lat and lng:
                alerts = await check_user_intersection(user_id, lat, lng, speed)
                if alerts:
                    for alert in alerts:
                        binary_data = json.dumps(alert).encode('utf-8')
                        await websocket.send_bytes(binary_data)
                        
    except WebSocketDisconnect:
        manager.disconnect(user_id)
        logger.info(f"Client {user_id} disconnected from alerts.")
    except Exception as e:
        manager.disconnect(user_id)
        logger.error(f"WebSocket error for {user_id}: {e}")
