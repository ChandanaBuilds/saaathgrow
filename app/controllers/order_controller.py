from fastapi import APIRouter
from sqlalchemy.orm import Session
from fastapi import Depends

from app.dependencies import get_db
from app.models.order import Order

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

@router.get("/")
def get_orders(
    db: Session = Depends(get_db)
):
    return db.query(Order).filter(
        Order.status == "available"
    ).all()
@router.post("/{order_id}/accept")
def accept_order(
    order_id: int,
    driver_id: int,
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    order.driver_id = driver_id
    order.status = "accepted"

    db.commit()

    return {
        "message": "Order accepted"
    }