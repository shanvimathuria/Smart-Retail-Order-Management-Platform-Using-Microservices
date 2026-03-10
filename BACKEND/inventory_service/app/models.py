from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class Category(Base):
    __tablename__ = "categories"
    __table_args__ = {"schema": "inventory_service"}

    id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Product(Base):
    __tablename__ = "products"
    __table_args__ = {"schema": "inventory_service"}  # IMPORTANT (your schema)

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, nullable=False)
    category_id = Column(Integer, ForeignKey("inventory_service.categories.id"), nullable=False)
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
