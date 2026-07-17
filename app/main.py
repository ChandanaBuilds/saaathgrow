from fastapi import FastAPI

from app.database import Base, engine

from app.models.user import User
from app.models.otp import OTP

from app.controllers.auth_controller import router as auth_router

from app.models.document import Document

from app.controllers.admin_controller import router as admin_router
from app.models.order import Order


from app.controllers.order_controller import router as order_router
from app.controllers.wallet_controller import router as wallet_router


# app/main.py


# Create tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Saath Grow Delivery API",
    version="1.0.0"
)

# Register routers
app.include_router(auth_router)

app.include_router(admin_router)
app.include_router(order_router)
app.include_router(wallet_router)



@app.get("/")
def health():
    return {
        "message": "Saath Grow Backend Running"
    }