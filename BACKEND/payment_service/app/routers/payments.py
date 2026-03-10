from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import random
import uuid

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


@router.post("/simulate", response_model=schemas.PaymentResponse)
def simulate_payment(
    payment: schemas.PaymentCreate,
    db: Session = Depends(get_db)
):

    status = random.choices(
    ["success", "failed"],
    weights=[80, 20]
)[0]

    payment_record = models.Payment(
        payment_id=str(uuid.uuid4()),
        order_id=str(payment.order_id),
        payment_status=status,
        payment_method=payment.payment_method
    )

    db.add(payment_record)
    db.commit()
    db.refresh(payment_record)

    return payment_record