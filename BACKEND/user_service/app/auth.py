from datetime import datetime, timedelta
import os

import bcrypt
from jose import jwt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

MAX_BCRYPT_PASSWORD_BYTES = 72


def _encode_password(password: str) -> bytes:
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > MAX_BCRYPT_PASSWORD_BYTES:
        raise ValueError("Password must be at most 72 bytes when UTF-8 encoded")
    return password_bytes


def hash_password(password: str) -> str:
    password_bytes = _encode_password(password)
    hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed_password.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        password_bytes = _encode_password(plain_password)
    except ValueError:
        return False

    return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)