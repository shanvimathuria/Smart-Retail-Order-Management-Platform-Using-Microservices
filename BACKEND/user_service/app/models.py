from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "user_service"}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())