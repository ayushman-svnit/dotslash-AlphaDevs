import asyncio
import sys
import os

# Add the current directory so app modules can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.services.animal_detect_service import detect_animal_in_image
from app.core.config import settings

async def main():
    print("--- LIVE IMAGE DETECTION API TEST ---")
    print(f"API Endpoint: {settings.ANIMAL_DETECT_API_URL}")
    print(f"API Key active: {'Yes' if settings.ANIMAL_DETECT_API_KEY else 'NO (Check .env)'}\n")
    
    # We will test using a public image of an elephant
    test_image_url = "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46"
    print(f"Scanning image: {test_image_url}\n")
    
    print("Sending request to API... (Please wait)")
    try:
        result = await detect_animal_in_image(test_image_url)
        
        print("\n=== API RESULT ===")
        import json
        print(json.dumps(result, indent=2))
        
        if result.get("prediction", {}).get("is_mock", False):
            print("\n⚠️ WARNING: The API failed and hit the MOCK FALLBACK block.")
            print("This usually means the URL is wrong, the key is invalid, or you are disconnected.")
        elif result.get("status") == "success":
            print("\n✅ SUCCESS: The Live AI correctly processed the image!")
        else:
            print("\n❌ FAILED: The AI returned an error response.")
            
    except Exception as e:
        print(f"\n❌ FATAL CRASH: {e}")

if __name__ == "__main__":
    asyncio.run(main())
