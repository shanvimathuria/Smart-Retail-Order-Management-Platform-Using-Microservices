import os
import uuid

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user_id
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/orders", tags=["Orders"])

INVENTORY_SERVICE_URL = os.getenv(
    "INVENTORY_SERVICE_URL",
    "http://127.0.0.1:8003"
)

PAYMENT_SERVICE_URL = os.getenv(
    "PAYMENT_SERVICE_URL",
    "http://127.0.0.1:8001"
)

def _extract_service_error(response: httpx.Response) -> str:
    try:
        payload = response.json()
    except ValueError:
        return response.text or "Downstream service request failed"

    if isinstance(payload, dict):
        detail = payload.get("detail")
        if detail:
            return str(detail)

    return str(payload)


def _build_payment_reference(order_id: int) -> uuid.UUID:
    return uuid.uuid5(uuid.NAMESPACE_URL, f"order-service:{order_id}")


async def _get_order_for_user(
    order_id: int,
    user_id: int,
    db: AsyncSession
) -> models.Order:
    result = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .where(models.Order.id == order_id, models.Order.user_id == user_id)
    )
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    return order


async def _validate_and_price_items(
    order_items: list[schemas.OrderItemCreate],
    client: httpx.AsyncClient
) -> tuple[list[dict], float]:
    total_amount = 0.0
    validated_items = []

    for item in order_items:
        try:
            validation_response = await client.post(
                f"{INVENTORY_SERVICE_URL}/validate-stock",
                json={"product_id": item.product_id, "quantity": item.quantity}
            )
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Inventory service is unavailable"
            ) from exc

        if validation_response.status_code != status.HTTP_200_OK:
            raise HTTPException(
                status_code=validation_response.status_code,
                detail=_extract_service_error(validation_response)
            )

        validation_payload = validation_response.json()
        if not validation_payload.get("is_available"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product {item.product_id}"
            )

        try:
            product_response = await client.get(f"{INVENTORY_SERVICE_URL}/{item.product_id}")
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Inventory service is unavailable"
            ) from exc

        if product_response.status_code != status.HTTP_200_OK:
            raise HTTPException(
                status_code=product_response.status_code,
                detail=_extract_service_error(product_response)
            )

        product_payload = product_response.json()
        price = float(product_payload["price"])
        total_amount += price * item.quantity
        validated_items.append(
            {
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price": price,
            }
        )

    return validated_items, total_amount


async def _reduce_inventory(
    items: list[dict],
    client: httpx.AsyncClient,
    db: AsyncSession
) -> None:
    for item in items:
        try:
            reduce_response = await client.post(
                f"{INVENTORY_SERVICE_URL}/reduce-stock",
                json={"product_id": item["product_id"], "quantity": item["quantity"]}
            )
        except httpx.HTTPError as exc:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Inventory service is unavailable"
            ) from exc

        if reduce_response.status_code != status.HTTP_200_OK:
            await db.rollback()
            raise HTTPException(
                status_code=reduce_response.status_code,
                detail=_extract_service_error(reduce_response)
            )


@router.post("/place", response_model=schemas.OrderPlacementResponse, status_code=status.HTTP_201_CREATED)
async def place_order(
    order_data: schemas.OrderCreate,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    async with httpx.AsyncClient() as client:
        validated_items, total_amount = await _validate_and_price_items(order_data.items, client)

        new_order = models.Order(
            user_id=current_user_id,
            total_amount=total_amount,
            status="PENDING_PAYMENT" if order_data.payment_method == "ONLINE" else "CONFIRMED"
        )

        db.add(new_order)
        await db.flush()

        for item in validated_items:
            db.add(
                models.OrderItem(
                    order_id=new_order.id,
                    product_id=item["product_id"],
                    quantity=item["quantity"],
                    price=item["price"]
                )
            )

        payment_summary = None

        if order_data.payment_method == "ONLINE":
            provider_order_id = _build_payment_reference(new_order.id)

            try:
                payment_response = await client.post(
                    f"{PAYMENT_SERVICE_URL}/simulate",
                    json={
                        "order_id": str(provider_order_id),
                        "payment_method": order_data.payment_method,
                    }
                )
            except httpx.HTTPError as exc:
                await db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Payment service is unavailable"
                ) from exc

            if payment_response.status_code != status.HTTP_200_OK:
                await db.rollback()
                raise HTTPException(
                    status_code=payment_response.status_code,
                    detail=_extract_service_error(payment_response)
                )

            payment_payload = payment_response.json()
            payment_summary = schemas.PaymentSummary(
                payment_id=payment_payload.get("payment_id"),
                payment_status=payment_payload["payment_status"],
                payment_method=payment_payload["payment_method"],
                provider_order_id=provider_order_id,
            )

            if payment_summary.payment_status.lower() != "success":
                await db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail="Online payment failed. Order was not placed"
                )

            new_order.status = "CONFIRMED"

        await _reduce_inventory(validated_items, client, db)

    await db.commit()

    order = await _get_order_for_user(new_order.id, current_user_id, db)

    return schemas.OrderPlacementResponse(
        message="Order placed successfully",
        order=order,
        payment=payment_summary,
    )


@router.get("/me", response_model=list[schemas.OrderResponse])
async def get_my_orders(
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .where(models.Order.user_id == current_user_id)
        .order_by(models.Order.created_at.desc())
    )

    return result.scalars().all()


@router.get("/{order_id}", response_model=schemas.OrderResponse)
async def get_order_by_id(
    order_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    return await _get_order_for_user(order_id, current_user_id, db)
