from pydantic import BaseModel, EmailStr
from enum import Enum

class UserRole(str, Enum):
    AUTHORITY = "AUTHORITY"
    OFFICER = "OFFICER"
    CITIZEN = "CITIZEN"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.CITIZEN

class UserLogin(BaseModel):
    email: EmailStr
    password: str
