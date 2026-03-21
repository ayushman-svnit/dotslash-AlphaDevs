import { useState, useEffect, useRef } from 'react';

export interface WildlifeAlertPayload {
  lat: number;
  lng: number;
  species_id: string;
  urgency_level: string;
  time_to_collision_sec: number;
  location_h3_index: string;
}

export const useAlertWebSocket = (userId: string) => {
  const [activeAlerts, setActiveAlerts] = useState<WildlifeAlertPayload[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const locationRef = useRef<{ lat: number; lng: number } | null>(null);

  // Track real GPS position
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => { locationRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }; },
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleIncomingAlert = (alert: WildlifeAlertPayload) => {
    setActiveAlerts((prev) => {
      // Avoid duplicates based on h3 index and species
      const exists = prev.find(a => a.location_h3_index === alert.location_h3_index && a.species_id === alert.species_id);
      if (exists) {
        return prev.map(a => a.location_h3_index === alert.location_h3_index ? alert : a);
      }
      return [...prev, alert];
    });

    // Auto-remove alert after 15 seconds if it's no longer pertinent
    setTimeout(() => {
      setActiveAlerts((prev) => 
        prev.filter(a => !(a.location_h3_index === alert.location_h3_index && a.species_id === alert.species_id))
      );
    }, 15000);
  };

  useEffect(() => {
    if (!userId) return;

    // Connect to FastAPI WebSocket backend
    const wsUrl = `ws://localhost:8000/ws/alerts/${userId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    // Because we mock protobuf binary with JSON encoded to bytes in the backend,
    // we instruct the browser to treat received data as Blob/ArrayBuffer
    ws.binaryType = "blob"; 

    ws.onopen = () => {
      console.log('Connected to Wildlife Alerts WebSocket');
      
      // Simulate pushing user's current GPS Location periodically
      // In a real app, this integrates with Geolocation API
      const locationInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          const loc = locationRef.current ?? { lat: 22.335, lng: 80.615 };
          ws.send(JSON.stringify({
            lat: loc.lat,
            lng: loc.lng,
            speed_kmh: 40
          }));
        }
      }, 5000);

      // Store interval on the connection object for cleanup
      // @ts-ignore
      ws._locationInterval = locationInterval;
    };

    ws.onmessage = async (event) => {
      try {
        // If it's a blob (our binary mockup), convert to text then parse
        if (event.data instanceof Blob) {
          const text = await event.data.text();
          const alert: WildlifeAlertPayload = JSON.parse(text);
          handleIncomingAlert(alert);
        } else {
          const alert: WildlifeAlertPayload = JSON.parse(event.data);
          handleIncomingAlert(alert);
        }
      } catch (error) {
        console.error("Error decoding binary WS payload:", error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from Alerts WS');
      // @ts-ignore
      if (ws._locationInterval) clearInterval(ws._locationInterval);
    };

    return () => {
      ws.close();
    };
  }, [userId]);

  return { activeAlerts };
};
