import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
from app.services.alert_service import check_user_intersection

logger = logging.getLogger(__name__)

router = APIRouter()

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
            await self.active_connections[user_id].send_bytes(message)

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
                    # In a production environment with protoc compiled, we would do:
                    # alert_msg = WildlifeAlert(...)
                    # binary_data = alert_msg.SerializeToString()
                    # Here we serialize to JSON and encode to bytes as a binary protocol mockup
                    for alert in alerts:
                        binary_data = json.dumps(alert).encode('utf-8')
                        await manager.send_binary(binary_data, user_id)
                        
    except WebSocketDisconnect:
        manager.disconnect(user_id)
        logger.info(f"Client {user_id} disconnected from alerts.")
    except Exception as e:
        manager.disconnect(user_id)
        logger.error(f"WebSocket error for {user_id}: {e}")
