from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# 🔹 CREATE PRODUCT
@router.post("/", response_model=schemas.ProductResponse)
async def create_product(
    product: schemas.ProductCreate,
    db: AsyncSession = Depends(get_db)
):
    new_product = models.Product(**product.dict())
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return new_product


# 🔹 GET ALL PRODUCTS
@router.get("/", response_model=list[schemas.ProductResponse])
async def get_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Product))
    products = result.scalars().all()
    return products


# 🔹 GET PRODUCT BY ID
@router.get("/{product_id}", response_model=schemas.ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Product).where(models.Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


# 🔹 UPDATE PRODUCT
@router.put("/{product_id}", response_model=schemas.ProductResponse)
async def update_product(
    product_id: int,
    product_update: schemas.ProductUpdate,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.Product).where(models.Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in product_update.dict(exclude_unset=True).items():
        setattr(product, key, value)

    await db.commit()
    await db.refresh(product)

    return product


# 🔹 DELETE PRODUCT
@router.delete("/{product_id}")
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Product).where(models.Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    await db.delete(product)
    await db.commit()

    return {"message": "Product deleted successfully"}


# 🔹 VALIDATE STOCK
@router.post("/validate-stock", response_model=schemas.StockValidationResponse)
async def validate_stock(
    request: schemas.StockRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.Product).where(models.Product.id == request.product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    is_available = product.stock_quantity >= request.quantity

    return schemas.StockValidationResponse(
        product_id=product.id,
        requested_quantity=request.quantity,
        available_quantity=product.stock_quantity,
        is_available=is_available
    )


# 🔹 REDUCE STOCK
@router.post("/reduce-stock", response_model=schemas.StockReductionResponse)
async def reduce_stock(
    request: schemas.StockRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.Product).where(models.Product.id == request.product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.stock_quantity < request.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    product.stock_quantity -= request.quantity

    await db.commit()
    await db.refresh(product)

    return schemas.StockReductionResponse(
        product_id=product.id,
        remaining_stock=product.stock_quantity
    )
