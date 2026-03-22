import httpx
import json
import time

BASE_URL = "http://127.0.0.1:8001/api/v1"
OFFICER_ID = "Ranger_Jaipur_99"

def test_flow():
    with httpx.Client(timeout=15.0) as client:
        # 1. Update Posting
        print(f"--- 📍 Setting Officer Posting: {OFFICER_ID} ---")
        try:
            r1 = client.post(
                f"{BASE_URL}/officer/posting", 
                json={
                    "officer_id": OFFICER_ID,
                    "name": "Ranger Tiger Eye",
                    "lat": 26.91,
                    "lng": 75.81
                }
            )
            print(f"Status: {r1.status_code}")
            print(f"Response: {r1.json()}")
        except Exception as e:
            print(f"FAILURE on POSTING: {e}")
            return

        # 2. Trigger Proximity Alert near Jaipur
        print(f"\n--- 🚨 Triggering Warning for User at (26.915, 75.815) ---")
        try:
            r2 = client.post(
                f"{BASE_URL}/alert/proximity-sms",
                json={
                    "user_id": "CIVILIAN_007",
                    "lat": 26.915,
                    "lng": 75.815,
                    "zone_type": "TIGER"
                }
            )
            print(f"Status: {r2.status_code}")
            print(f"Response: {r2.json()}")
        except Exception as e:
            print(f"FAILURE on ALERT: {e}")
            return

        time.sleep(1)

        # 3. Fetch Notifications for the Officer
        print(f"\n--- 📥 Checking Officer's Tactical Feed: {OFFICER_ID} ---")
        try:
            r3 = client.get(
                f"{BASE_URL}/officer/notifications",
                params={"officer_id": OFFICER_ID}
            )
            print(f"Status: {r3.status_code}")
            data = r3.json()
            notifs = data.get("notifications", [])
            print(f"Found {len(notifs)} alerts.")
            for n in notifs:
                print(f" - [{n['severity']}] {n['title']}: {n['message']} ({n['distance_km']}km away)")
        except Exception as e:
            print(f"FAILURE on NOTIFICATIONS: {e}")

if __name__ == "__main__":
    test_flow()
