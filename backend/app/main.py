from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

from app.models.user import User
from app.models.otp import OTP
from app.models.document import Document
from app.models.order import Order

from app.controllers.auth_controller import router as auth_router
from app.controllers.admin_controller import router as admin_router
from app.controllers.order_controller import router as order_router
from app.controllers.wallet_controller import router as wallet_router


# Create tables
Base.metadata.create_all(bind=engine)


# Create FastAPI app
app = FastAPI(
    title="Saath Groww Delivery API",
    version="1.0.0"
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

origins = [
    "http://localhost:8081",
    "http://localhost:8082",
    "http://localhost:3000",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:8082",
    "http://127.0.0.1:3000",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# REGISTER ROUTERS
# =========================================================

app.include_router(auth_router)

app.include_router(admin_router)

app.include_router(order_router)

app.include_router(wallet_router)


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/")
def health():
    return {
        "message": "Saath Groww Backend Running"
    }