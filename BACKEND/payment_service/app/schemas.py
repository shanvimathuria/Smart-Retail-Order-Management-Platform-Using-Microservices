from pydantic import BaseModel
from uuid import UUID


class PaymentCreate(BaseModel):
    order_id: UUID
    payment_method: str


class PaymentResponse(BaseModel):
    payment_id: UUID
    order_id: UUID
    payment_status: str
    payment_method: str