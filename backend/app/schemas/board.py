from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Card Schemas ---
class CardCreate(BaseModel):
    title: str
    description: Optional[str] = None
    position: Optional[int] = 0

class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = None
    list_id: Optional[int] = None  # To move cards between lists!

class CardResponse(BaseModel):
    id: int
    list_id: int
    title: str
    description: Optional[str]
    position: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- List Schemas ---
class ListCreate(BaseModel):
    title: str
    position: Optional[int] = 0

class ListResponse(BaseModel):
    id: int
    board_id: int
    title: str
    position: int
    cards: List[CardResponse] = []

    class Config:
        from_attributes = True

# --- Board Schemas ---
class BoardCreate(BaseModel):
    title: str

class BoardResponse(BaseModel):
    id: int
    title: str
    owner_id: int
    created_at: datetime
    lists: List[ListResponse] = []

    class Config:
        from_attributes = True