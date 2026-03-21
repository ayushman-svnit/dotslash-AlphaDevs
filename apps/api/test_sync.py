import requests
import json

def test_sync():
    base_url = "http://127.0.0.1:8000"
    report_url = f"{base_url}/api/v1/report/"
    
    report1 = {
        "user_id": "test-user-sync",
        "lat": 10.05,
        "lng": 76.67,
        "species_id": "Elephant",
        "description": "Integration Test Sync",
        "image_url": "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46"
    }
    
    print("\n--- Sending Sync Report ---")
    try:
        resp = requests.post(report_url, json=report1, timeout=30.0)
        print(f"Code: {resp.status_code}")
        print(f"Body: {resp.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_sync()
