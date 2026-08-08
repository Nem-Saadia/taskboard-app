from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from app.db.session import get_db
from app.db.models import User, Board, BoardList, Card
from app.schemas.board import (
    BoardCreate, BoardResponse, 
    ListCreate, ListResponse, 
    CardCreate, CardResponse, CardUpdate
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/boards", tags=["Boards & Tasks"])

# --- BOARD ENDPOINTS ---
@router.post("", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
async def create_board(
    board_in: BoardCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    board = Board(title=board_in.title, owner_id=current_user.id)
    db.add(board)
    await db.commit()
    await db.refresh(board)
    return board

@router.get("", response_model=List[BoardResponse])
async def get_my_boards(
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Board)
        .where(Board.owner_id == current_user.id)
        .options(selectinload(Board.lists).selectinload(BoardList.cards))
    )
    return result.scalars().all()

# --- LIST ENDPOINTS ---
@router.post("/{board_id}/lists", response_model=ListResponse, status_code=status.HTTP_201_CREATED)
async def create_list(
    board_id: int, 
    list_in: ListCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    new_list = BoardList(board_id=board_id, title=list_in.title, position=list_in.position)
    db.add(new_list)
    await db.commit()
    await db.refresh(new_list)
    return new_list

# --- CARD ENDPOINTS ---
@router.post("/lists/{list_id}/cards", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
async def create_card(
    list_id: int, 
    card_in: CardCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    new_card = Card(
        list_id=list_id, 
        title=card_in.title, 
        description=card_in.description, 
        position=card_in.position
    )
    db.add(new_card)
    await db.commit()
    await db.refresh(new_card)
    return new_card

@router.patch("/cards/{card_id}", response_model=CardResponse)
async def update_card(
    card_id: int, 
    card_update: CardUpdate, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Card).where(Card.id == card_id))
    card = result.scalars().first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    for field, value in card_update.dict(exclude_unset=True).items():
        setattr(card, field, value)

    await db.commit()
    await db.refresh(card)
    return card

# --- DELETE BOARD ---
@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_board(
    board_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Board).where(Board.id == board_id, Board.owner_id == current_user.id)
    )
    board = result.scalars().first()
    
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
        
    await db.delete(board)
    await db.commit()
    return None
# --- MOVE CARD TO DIFFERENT LIST ---
@router.put("/cards/{card_id}/move")
async def move_card(
    card_id: int,
    target_list_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Card).where(Card.id == card_id))
    card = result.scalars().first()
    
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
        
    card.list_id = target_list_id
    await db.commit()
    await db.refresh(card)
    return card

# --- DELETE CARD ---
@router.delete("/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_card(
    card_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Card).where(Card.id == card_id))
    card = result.scalars().first()
    
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
        
    await db.delete(card)
    await db.commit()
    return None