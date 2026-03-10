from sqlalchemy import Column, String, TIMESTAMP, text
from app.database import Base


class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = {"schema": "payment_service"}

    payment_id = Column(String, primary_key=True, index=True)
    order_id = Column(String)
    payment_status = Column(String)
    payment_method = Column(String)
    payment_time = Column(TIMESTAMP, server_default=text("now()"))