from pydantic import BaseModel, EmailStr
from datetime import datetime

# Schema for User Registration / Login input
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# Schema for returning User data (hiding password!)
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

# Schema for Token Response
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"