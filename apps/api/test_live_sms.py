import asyncio
import os
import sys

# Add the current directory so app modules can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
# Load .env variables so settings has access to the keys
load_dotenv()

from app.services.notification_service import send_officer_sighting_alert
from app.core.config import settings

async def main():
    phone_number = "+919408569457"
    print(f"Testing Live Twilio SMS to {phone_number}...")
    print(f"Sending from Twilio Number: {settings.TWILIO_PHONE_NUMBER}")
    
    success = await send_officer_sighting_alert(
        officer_phone=phone_number,
        animal="Elephant",
        lat=10.05,
        lng=76.67,
        image_url="https://images.unsplash.com/photo-1557050543-4d5f4e07ef46",
        description="TEST: Live integration test for Twilio SMS Verification."
    )
    
    if success:
        print("\n✅ SUCCESS: Twilio SMS actually sent! Please check your phone.")
    else:
        print("\n❌ FAILED: SMS was not sent. This is usually because:")
        print("  1. The Twilio credentials in your .env are incorrect.")
        print("  2. You are using a Twilio Trial account, and your phone number is NOT added to 'Verified Caller IDs' in the Twilio Console.")

if __name__ == "__main__":
    asyncio.run(main())
