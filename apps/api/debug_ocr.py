import requests
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("ANIMAL_DETECT_API_KEY")
api_url = "https://www.animaldetect.com/api/v1/scan-image-text-url"
image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/1200px-African_Bush_Elephant.jpg"

print(f"Testing OCR API with URL: {image_url}")
response = requests.post(
    api_url,
    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    json={"url": image_url}
)

if response.status_code == 200:
    print("Response Status: 200")
    print("Full payload:", response.json())
else:
    print(f"Error {response.status_code}: {response.text}")
