from fastapi import FastAPI
from sqlalchemy import text
from app.database import engine
from app.routers import users
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="User Service")

app.include_router(users.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Allow all domains
    allow_credentials=True,
    allow_methods=["*"],      # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],      # Allow all headers
)


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