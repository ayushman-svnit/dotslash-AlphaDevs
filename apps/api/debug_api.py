import requests
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("ANIMAL_DETECT_API_KEY")
api_url = "https://www.animaldetect.com/api/v1/detect-url"
image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/1200px-African_Bush_Elephant.jpg"

print(f"Testing API with URL: {image_url}")
response = requests.post(
    api_url,
    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    json={"url": image_url, "threshold": 0.1}
)

if response.status_code == 200:
    data = response.json()
    print("Response Status: 200")
    annotations = data.get("annotations", [])
    if annotations:
        print(f"Found {len(annotations)} annotations.")
        first = annotations[0]
        print("First annotation keys:", first.keys())
        for key in ["confidence", "score", "conf", "probability", "value"]:
            if key in first:
                print(f"Found key '{key}': {first[key]}")
    else:
        print("No annotations found.")
    print("Full payload for reference:", data)
else:
    print(f"Error {response.status_code}: {response.text}")
