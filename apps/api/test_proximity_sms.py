import requests
import json

def test_proximity_sms():
    url = "http://localhost:8001/ws/alerts/proximity-sms"
    
    payload = {
        "user_id": "test-user-999",
        "lat": 10.05,
        "lng": 76.67,
        "zone_type": "TEST CRITICAL ZONE"
    }
    
    headers = {
        "Content-Type": "application/json"
    }

    print(f"Testing Proximity SMS to Twilio via {url}...")
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        
        if response.status_code == 200:
            print("✅ SUCCESS: Backend accepted the alert!")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ FAILED: Status Code {response.status_code}")
            print(f"Error Body: {response.text}")
            
    except Exception as e:
        print(f"🚨 Connection Error: {e}")

if __name__ == "__main__":
    test_proximity_sms()
