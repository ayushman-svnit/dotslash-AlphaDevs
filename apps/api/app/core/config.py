from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Hackathon Starter"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    
    # Supabase / Firebase placeholders
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()
