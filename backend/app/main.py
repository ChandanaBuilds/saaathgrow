from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import inspect, text

from app.database import Base, engine


# =========================================================
# IMPORT ALL MODELS
# =========================================================

from app.models.user import User
from app.models.otp import OTP
from app.models.email_otp import EmailOTP
from app.models.document import Document
from app.models.order import Order
from app.models.wallet import Wallet


# =========================================================
# DATABASE SETUP
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# DATABASE MIGRATION
# =========================================================

def migrate_database():

    inspector = inspect(engine)

    tables = inspector.get_table_names()

    # =====================================================
    # USERS TABLE
    # =====================================================

    if "users" in tables:

        columns = [
            column["name"]
            for column in inspector.get_columns("users")
        ]

        if "email_verified" not in columns:

            print(
                "Adding email_verified column to users table..."
            )

            try:

                with engine.begin() as connection:

                    connection.execute(
                        text(
                            """
                            ALTER TABLE users
                            ADD COLUMN email_verified
                            BOOLEAN DEFAULT FALSE
                            """
                        )
                    )

                print(
                    "email_verified column added successfully."
                )

            except Exception as error:

                print(
                    "Migration error:",
                    error
                )

        else:

            print(
                "email_verified column already exists."
            )

    # =====================================================
    # EMAIL OTP TABLE
    # =====================================================

    inspector = inspect(engine)

    tables = inspector.get_table_names()

    if "email_otps" not in tables:

        print(
            "Creating email_otps table..."
        )

        EmailOTP.__table__.create(
            bind=engine,
            checkfirst=True
        )

        print(
            "email_otps table created successfully."
        )


# =========================================================
# RUN DATABASE MIGRATION
# =========================================================

migrate_database()


# =========================================================
# CREATE FASTAPI APP
# =========================================================

app = FastAPI(

    title="Saath Groww Delivery API",

    version="2.0.0"

)


# =========================================================
# CORS CONFIGURATION
# =========================================================
#
# IMPORTANT:
# Keep ONLY ONE CORSMiddleware.
#
# This allows:
#
# Expo Web
# localhost:8081
# localhost:8082
# localhost:3000
#
# 127.0.0.1 variants
# =========================================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=[
        "http://localhost:8081",
        "http://localhost:8082",
        "http://localhost:3000",

        "http://127.0.0.1:8081",
        "http://127.0.0.1:8082",
        "http://127.0.0.1:3000",
    ],

    allow_credentials=True,

    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],

    allow_headers=[
        "Accept",
        "Authorization",
        "Content-Type",
    ],

    expose_headers=[
        "Content-Length",
    ],
)


# =========================================================
# ROUTERS
# =========================================================

from app.controllers.auth_controller import (
    router as auth_router
)

from app.controllers.admin_controller import (
    router as admin_router
)

from app.controllers.order_controller import (
    router as order_router
)

from app.controllers.wallet_controller import (
    router as wallet_router
)


# =========================================================
# REGISTER ROUTERS
# =========================================================

app.include_router(
    auth_router
)

app.include_router(
    admin_router
)

app.include_router(
    order_router
)

app.include_router(
    wallet_router
)


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/")
def health():

    return {

        "success": True,

        "message":
            "Saath Groww Backend Running",

        "version":
            "2.0.0"

    }