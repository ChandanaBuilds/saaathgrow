import os

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt


# =========================================================
# ADMIN CONFIGURATION
# =========================================================

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

JWT_ALGORITHM = "HS256"

ADMIN_TOKEN_EXPIRY_MINUTES = 60 * 24


# =========================================================
# VALIDATE ENVIRONMENT VARIABLES
# =========================================================

if not ADMIN_EMAIL:
    raise RuntimeError(
        "ADMIN_EMAIL environment variable is not set."
    )


if not ADMIN_PASSWORD:
    raise RuntimeError(
        "ADMIN_PASSWORD environment variable is not set."
    )


if not JWT_SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY environment variable is not set."
    )


# =========================================================
# VERIFY ADMIN CREDENTIALS
# =========================================================

def verify_admin_credentials(
    email: str,
    password: str
) -> bool:

    email = email.lower().strip()

    return (
        email == ADMIN_EMAIL.lower().strip()
        and password == ADMIN_PASSWORD
    )


# =========================================================
# CREATE ADMIN JWT TOKEN
# =========================================================

def create_admin_token() -> str:

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ADMIN_TOKEN_EXPIRY_MINUTES
        )
    )

    payload = {
        "sub": ADMIN_EMAIL,
        "role": "admin",
        "exp": expire
    }

    token = jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )

    return token


# =========================================================
# VERIFY ADMIN JWT TOKEN
# =========================================================

def verify_admin_token(
    token: str
):

    try:

        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        email = payload.get("sub")
        role = payload.get("role")

        if not email:
            return None

        if role != "admin":
            return None

        return {
            "email": email,
            "role": role
        }

    except JWTError:

        return None