import httpx
import asyncio
import json

async def test_verification():
    base_url = "http://127.0.0.1:8000"
    report_url = f"{base_url}/api/v1/report/"
    
    # Report 1
    report1 = {
        "user_id": "test-user-1",
        "lat": 10.05,
        "lng": 76.67,
        "species_id": "Elephant",
        "description": "Integration Test Sighting 1",
        "image_url": "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46"
    }
    
    print("\n--- Sending Report 1 (Verified AI Expected) ---")
    try:
        async with httpx.AsyncClient() as client:
            resp1 = await client.post(report_url, json=report1, timeout=15.0)
            print(f"Response 1 Code: {resp1.status_code}")
            print(f"Response 1 Body: {resp1.text}")
    except Exception as e:
        print(f"Error Report 1:\n{repr(e)}")

    # Report 2
    report2 = {
        "user_id": "test-user-2",
        "lat": 10.051,
        "lng": 76.671,
        "species_id": "Elephant",
        "description": "Integration Test Sighting 2"
    }
    
    print("\n--- Sending Report 2 (Verified AI Expected) ---")
    try:
        async with httpx.AsyncClient() as client:
            resp2 = await client.post(report_url, json=report2, timeout=30.0)
            print(f"Response 2 Code: {resp2.status_code}")
            print(f"Response 2 Body: {resp2.text}")
    except Exception as e:
        print(f"Error Report 2:\n{repr(e)}")

if __name__ == "__main__":
    asyncio.run(test_verification())
