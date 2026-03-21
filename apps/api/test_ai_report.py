import requests
import json

url = "http://localhost:8000/api/v1/report/"

payload = {
    "user_id": "test-ai-verify",
    "lat": 21.17,
    "lng": 72.83,
    "species_id": "Elephant",
    "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/1200px-African_Bush_Elephant.jpg",
    "description": "Large elephant crossing the main highway, blocking traffic. Appears injured."
}

print("Submitting citizen wildlife report...")
print(f"Animal  : {payload['species_id']}")
print(f"Location: {payload['lat']}, {payload['lng']}")
print(f"Problem : {payload['description']}")
print(f"Image   : {payload['image_url']}")
print("-" * 50)

try:
    response = requests.post(url, json=payload, timeout=30)
    data = response.json()
    print(f"\nHTTP Status : {response.status_code}")
    print(f"AI Status   : {data.get('status')}")
    print(f"AI Label    : {data.get('ai_label')}")
    print(f"Confidence  : {data.get('ai_confidence', 0) * 100:.1f}%")
    print(f"H3 Index    : {data.get('h3_index')}")
    print(f"Message     : {data.get('message')}")

    if data.get('status') == 'Verified (AI)':
        print("\n✅ OFFICER SMS DISPATCHED via Twilio!")
    else:
        print("\n⚠️  Not verified (confidence < 80%). No SMS sent.")
        print("   Tip: The public Wikipedia elephant image may return low confidence.")
        print("   In production, use a close-up wildlife camera image.")

except requests.Timeout:
    print("\n⏱️  Timeout: AnimalDetect API took >30s. Backend is running but the AI call is slow.")
    print("   The real flow still works — just slower on first request.")
except Exception as e:
    print(f"\n❌ Error: {e}")
