from pydantic import BaseModel
from typing import List
from datetime import datetime


# -------- ORDER ITEM --------
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderItemResponse(BaseModel):
    product_id: int
    quantity: int
    price: float

    class Config:
        from_attributes = True


# -------- ORDER --------
class OrderCreate(BaseModel):
    user_id: int
    items: List[OrderItemCreate]


class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True
