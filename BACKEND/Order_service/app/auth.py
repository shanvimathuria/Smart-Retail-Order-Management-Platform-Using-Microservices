import os

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

load_dotenv()

bearer_scheme = HTTPBearer(bearerFormat="JWT")

SECRET_KEY_ENV_VARS = (
    "ORDER_SERVICE_SECRET_KEY",
    "JWT_SECRET_KEY",
    "USER_SERVICE_SECRET_KEY",
    "SECRET_KEY",
)

ALGORITHM_ENV_VARS = (
    "ORDER_SERVICE_JWT_ALGORITHM",
    "JWT_ALGORITHM",
    "ALGORITHM",
)


def _get_jwt_settings() -> tuple[str | None, str]:
    secret_key = next((os.getenv(name) for name in SECRET_KEY_ENV_VARS if os.getenv(name)), None)
    algorithm = next((os.getenv(name) for name in ALGORITHM_ENV_VARS if os.getenv(name)), "HS256")
    return secret_key, algorithm


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> int:
    secret_key, algorithm = _get_jwt_settings()
    token = credentials.credentials

    if not secret_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "JWT configuration is missing for order service. "
                f"Set one of: {', '.join(SECRET_KEY_ENV_VARS)}"
            )
        )

    try:
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        ) from exc

    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload does not contain user_id",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        return int(user_id)
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token user_id is invalid",
            headers={"WWW-Authenticate": "Bearer"}
        ) from exc