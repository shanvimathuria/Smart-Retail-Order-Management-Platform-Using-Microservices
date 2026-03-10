from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.routers import payments
from app.database import get_db

app = FastAPI(
    title="Payment Service",
    version="1.0"
)

app.include_router(payments.router)


@app.get("/")
def root():
    return {"message": "Payment Service Running"}


@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {
            "database": "connected",
            "service": "payment_service"
        }
    except Exception as e:
        return {
            "database": "not connected",
            "error": str(e)
        }