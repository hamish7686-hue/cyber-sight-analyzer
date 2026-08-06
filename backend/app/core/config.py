from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Malware Detection API"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY_CHANGE_THIS_IN_PRODUCTION"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/malware_db"
    
    # Celery & Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # External APIs
    VIRUSTOTAL_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()
