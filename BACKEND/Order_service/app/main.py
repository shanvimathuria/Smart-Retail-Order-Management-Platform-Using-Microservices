from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import get_db, engine
from app.routers import orders

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown - dispose engine to close all connections
    await engine.dispose()

app = FastAPI(
    title="Order Service",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Allow all domains
    allow_credentials=True,
    allow_methods=["*"],      # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],      # Allow all headers
)

# Include order router
app.include_router(orders.router)


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

