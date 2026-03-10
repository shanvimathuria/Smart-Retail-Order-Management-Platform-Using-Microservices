from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CategoryBase(BaseModel):
    category_name: str
    description: Optional[str] = None
    image_url: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    category_name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# -------- CREATE --------
class ProductCreate(BaseModel):
    product_name: str
    description: Optional[str] = None
    price: float
    stock_quantity: int
    category_id: int
    image_url: Optional[str] = None


# -------- UPDATE --------
class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock_quantity: Optional[int] = None
    category_id: Optional[int] = None
    image_url: Optional[str] = None


# -------- RESPONSE --------
class ProductResponse(BaseModel):
    id: int
    product_name: str
    description: Optional[str]
    price: float
    stock_quantity: int
    category_id: int
    image_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# -------- STOCK VALIDATION --------
class StockRequest(BaseModel):
    product_id: int
    quantity: int


class StockValidationResponse(BaseModel):
    product_id: int
    requested_quantity: int
    available_quantity: int
    is_available: bool

# -------- STOCK REDUCTION --------
class StockReductionResponse(BaseModel):
    product_id: int
    remaining_stock: int
