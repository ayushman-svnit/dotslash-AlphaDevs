"""
Test script: calls the Eco-Route Gradio Space and saves the output JSON.
Run from: d:\coding\Alpha-Devs\apps\api
"""
from gradio_client import Client
import json

SPACE_ID = "Nikhilpat/eco-route-model"
OUTPUT_FILE = "eco_route_test_output.json"

start_lat = 25.13
start_lon = 76.27
end_lat   = 25.11
end_lon   = 76.35

print(f"Connecting to {SPACE_ID}...")
client = Client(SPACE_ID)

print(f"Calling /predict with start=({start_lat},{start_lon}) end=({end_lat},{end_lon})...")
raw_result = client.predict(
    start_lat=start_lat,
    start_lon=start_lon,
    end_lat=end_lat,
    end_lon=end_lon,
    api_name="/predict"
)

data = json.loads(raw_result)

meta   = data.get("metadata", {})
points = data.get("prediction_points", [])

print(f"\n=== MODEL OUTPUT ===")
print(f"Total Points: {meta.get('total_points')}")
print(f"Interval: {meta.get('interval_meters')} m")
print(f"Total Distance: {meta.get('total_route_distance_m', 0):.2f} m")
print(f"Best Zone: {meta.get('best_overall_zone', 'N/A')}")
print(f"Composite Score: {meta.get('best_composite_score', 'N/A')}")

if points:
    print(f"\nFirst 3 points:")
    for p in points[:3]:
        print(f"  lat={p['latitude']:.6f}, lng={p['longitude']:.6f}, risk={p['predicted_risk']:.4f}")
    print(f"Last point: lat={points[-1]['latitude']:.6f}, lng={points[-1]['longitude']:.6f}")

with open(OUTPUT_FILE, "w") as f:
    json.dump(data, f, indent=2)

print(f"\nFull output saved to: {OUTPUT_FILE}")
print("Keys in output:", list(data.keys()))
