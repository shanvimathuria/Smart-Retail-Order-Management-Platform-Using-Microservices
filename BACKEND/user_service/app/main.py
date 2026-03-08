from fastapi import FastAPI
from sqlalchemy import text
from app.database import engine
from app.routers import users

app = FastAPI(title="User Service")

app.include_router(users.router)


# ✅ DB Health Check Endpoint
@app.get("/health/db")
async def check_db_connection():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {
            "status": "success",
            "message": "Database connected successfully"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }