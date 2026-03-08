from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app import models, schemas
import httpx

router = APIRouter(prefix="/orders", tags=["Orders"])

INVENTORY_SERVICE_URL = "http://127.0.0.1:8001/products"


@router.post("/", response_model=schemas.OrderResponse)
async def create_order(
    order_data: schemas.OrderCreate,
    db: AsyncSession = Depends(get_db)
):

    total_amount = 0
    validated_items = []

    async with httpx.AsyncClient() as client:

        # 1️⃣ VALIDATE STOCK + GET PRICE
        for item in order_data.items:

            # Validate stock
            response = await client.post(
                f"{INVENTORY_SERVICE_URL}/validate-stock",
                json={
                    "product_id": item.product_id,
                    "quantity": item.quantity
                }
            )

            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Stock validation failed")

            data = response.json()

            if not data.get("is_available"):
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for product {item.product_id}"
                )

            # Get product price
            product_response = await client.get(
                f"{INVENTORY_SERVICE_URL}/{item.product_id}"
            )

            if product_response.status_code != 200:
                raise HTTPException(status_code=400, detail="Product not found")

            product_data = product_response.json()
            price = product_data["price"]

            total_amount += price * item.quantity

            validated_items.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price": price
            })

        # 2️⃣ CREATE ORDER
        new_order = models.Order(
            user_id=order_data.user_id,
            total_amount=total_amount,
            status="CONFIRMED"
        )

        db.add(new_order)
        await db.flush()  # Generate order ID

        # 3️⃣ CREATE ORDER ITEMS
        for item in validated_items:
            db.add(
                models.OrderItem(
                    order_id=new_order.id,
                    product_id=item["product_id"],
                    quantity=item["quantity"],
                    price=item["price"]
                )
            )

        # 4️⃣ REDUCE STOCK
        for item in validated_items:
            reduce_response = await client.post(
                f"{INVENTORY_SERVICE_URL}/reduce-stock",
                json={
                    "product_id": item["product_id"],
                    "quantity": item["quantity"]
                }
            )

            if reduce_response.status_code != 200:
                await db.rollback()
                raise HTTPException(status_code=400, detail="Stock reduction failed")

    await db.commit()

    # 5️⃣ RELOAD ORDER WITH ITEMS (CRITICAL FIX FOR ASYNC)
    result = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .where(models.Order.id == new_order.id)
    )

    order = result.scalar_one()

    return order
