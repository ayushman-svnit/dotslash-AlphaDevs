from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CitizenReportCreate(BaseModel):
    user_id: str = Field(..., description="ID of the reporting user")
    lat: float = Field(..., description="Latitude of sighting")
    lng: float = Field(..., description="Longitude of sighting")
    species_id: str = Field(..., description="Category or species observed")
    heading_deg: Optional[float] = Field(None, description="Compass heading of device")
    speed_kmh: Optional[float] = Field(None, description="Speed of user at time of report")
    # Sighting Data
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    image_url: Optional[str] = Field(None, description="URL of uploaded animal photo for AI verification")
    description: Optional[str] = Field("No immediate threat", description="The problem context (e.g. Injured, blocking road)")
