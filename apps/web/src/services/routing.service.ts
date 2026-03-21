export interface GeoJSONPath {
  type: 'Feature';
  geometry: {
    type: 'LineString';
    coordinates: number[][];
  };
  properties: any;
}

export const getEcoSafeRoute = async (
  sourceLat: number,
  sourceLng: number,
  targetLat: number,
  targetLng: number,
  vehicleType: string = 'car'
): Promise<GeoJSONPath | null> => {
  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/routing/eco-safe?source_lat=${sourceLat}&source_lng=${sourceLng}&target_lat=${targetLat}&target_lng=${targetLng}&vehicle_type=${vehicleType}`
    );
    if (!response.ok) throw new Error("Failed to fetch route");
    const data = await response.json();
    return data.geojson;
  } catch (error) {
    console.error("Error getting eco-safe route:", error);
    return null;
  }
};
