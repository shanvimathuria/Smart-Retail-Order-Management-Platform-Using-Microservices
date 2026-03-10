from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


async def get_category_or_404(category_id: int, db: AsyncSession) -> models.Category:
    result = await db.execute(
        select(models.Category).where(models.Category.id == category_id)
    )
    category = result.scalar_one_or_none()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    return category


@router.post("/", response_model=schemas.CategoryResponse)
async def create_category(
    category: schemas.CategoryCreate,
    db: AsyncSession = Depends(get_db)
):
    new_category = models.Category(**category.model_dump())
    db.add(new_category)
    await db.commit()
    await db.refresh(new_category)
    return new_category


@router.get("/", response_model=list[schemas.CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Category))
    return result.scalars().all()


@router.get("/{category_id}", response_model=schemas.CategoryResponse)
async def get_category(category_id: int, db: AsyncSession = Depends(get_db)):
    return await get_category_or_404(category_id, db)


@router.put("/{category_id}", response_model=schemas.CategoryResponse)
async def update_category(
    category_id: int,
    category_update: schemas.CategoryUpdate,
    db: AsyncSession = Depends(get_db)
):
    category = await get_category_or_404(category_id, db)

    for key, value in category_update.model_dump(exclude_unset=True).items():
        setattr(category, key, value)

    await db.commit()
    await db.refresh(category)
    return category


@router.delete("/{category_id}")
async def delete_category(category_id: int, db: AsyncSession = Depends(get_db)):
    category = await get_category_or_404(category_id, db)

    product_result = await db.execute(
        select(models.Product).where(models.Product.category_id == category_id)
    )
    linked_product = product_result.scalar_one_or_none()

    if linked_product:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete category with linked products"
        )

    await db.delete(category)
    await db.commit()

    return {"message": "Category deleted successfully"}