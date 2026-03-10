from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


# -------- ORDER ITEM --------
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderItemResponse(BaseModel):
    product_id: int
    quantity: int
    price: float

    class Config:
        from_attributes = True


# -------- ORDER --------
class OrderCreate(BaseModel):
    items: List[OrderItemCreate] = Field(min_length=1)
    payment_method: str = "COD"

    @field_validator("payment_method")
    @classmethod
    def validate_payment_method(cls, value: str) -> str:
        normalized_value = value.strip().upper()

        if normalized_value == "UPI":
            return "ONLINE"

        allowed_methods = {"COD", "ONLINE"}

        if normalized_value not in allowed_methods:
            raise ValueError("payment_method must be either COD, UPI, or ONLINE")

        return normalized_value


class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True


class PaymentSummary(BaseModel):
    payment_id: Optional[UUID] = None
    payment_status: str
    payment_method: str
    provider_order_id: UUID


class OrderPlacementResponse(BaseModel):
    message: str
    order: OrderResponse
    payment: Optional[PaymentSummary] = None
