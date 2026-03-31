import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool

# Load .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise Exception("DATABASE_URL not found in environment variables")

# Create async engine with NullPool for Supabase session mode
# NullPool creates a new connection for each request and doesn't pool
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    poolclass=NullPool,
    connect_args={
        "server_settings": {"jit": "off"},
        "timeout": 30,
    },
)

# Create session factory
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()

# Dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
