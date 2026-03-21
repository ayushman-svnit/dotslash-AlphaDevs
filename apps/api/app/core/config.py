from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Hackathon Starter"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    
    # Supabase / Firebase placeholders
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    # AI Model Endpoints
    ANIMAL_DETECT_API_URL: str = "https://www.animaldetect.com/api/v1/detect-url"
    ANIMAL_DETECT_API_KEY: str = ""
    ML_ROUTING_API_URL: str = "http://localhost:8082/predict_route"

    # Twilio Notifications
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # Mapping/GIS
    NEXT_PUBLIC_GFW_API_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
