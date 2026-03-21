import requests
import json
import os

# Pointing to the new port 8080
URL = "http://127.0.0.1:8080/api/v1/report/"

# Sample report that should trigger verified flow
# Using high confidence close-up image
payload = {
    "user_id": "test-citizen",
    "lat": 10.081,
    "lng": 76.685,
    "species_id": "Elephant",
    "image_url": "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46",
    "description": "TEST: Twilio Verification in Citizen Side."
}

print(f"Submitting Citizen Report to {URL}...")
try:
    response = requests.post(URL, json=payload, timeout=15)
    data = response.json()
    print(f"Response: {data}")
except Exception as e:
    print(f"Error: {e}")
