from fastapi import FastAPI
from app.database import engine
from sqlalchemy import text
from app.routers import products, categories
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(products.router)
app.include_router(categories.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Allow all domains
    allow_credentials=True,
    allow_methods=["*"],      # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],      # Allow all headers
)

@app.get("/")
def home():
    return {"message": "Inventory Service Running"}

@app.get("/health")
def health():
    return {"status": "Inventory Service Running"}

@app.get("/db-test")
async def test_db():
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT 1"))
        return {"db": "connected"}
