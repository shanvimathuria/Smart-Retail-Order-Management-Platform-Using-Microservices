from fastapi import FastAPI
from app.database import engine
from sqlalchemy import text
from app.routers import products


app = FastAPI()

app.include_router(products.router)

@app.get("/")
def home():
    return {"message": "Inventory Service Running"}

@app.get("/")
def health():
    return {"status": "Inventory Service Running"}

@app.get("/db-test")
async def test_db():
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT 1"))
        return {"db": "connected"}
