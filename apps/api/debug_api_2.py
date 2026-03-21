import requests
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("ANIMAL_DETECT_API_KEY")
api_url = "https://www.animaldetect.com/api/v1/detect-url"

# Let's try a different image, maybe one that's smaller or from a different source
image_url = "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46"

print(f"Testing DETECT API with URL: {image_url}")
response = requests.post(
    api_url,
    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    json={"url": image_url} # Let it use default threshold
)

if response.status_code == 200:
    print("Response Status: 200")
    print("Full payload:", response.json())
else:
    print(f"Error {response.status_code}: {response.text}")
