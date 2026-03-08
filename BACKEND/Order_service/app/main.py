from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.database import get_db
from app.routers import orders

app = FastAPI(
    title="Order Service",
    version="1.0.0"
)

# Include order router
app.include_router(orders.router, prefix="/orders", tags=["Orders"])


@app.get("/")
def root():
    return {"message": "Order Service Running"}

# ✅ Database Health Check
@app.get("/db-check")
async def check_database(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("SELECT 1"))
        return {
            "status": "Database Connected",
            "result": result.scalar()
        }
    except Exception as e:
        return {
            "status": "Database Connection Failed",
            "error": str(e)
        }

