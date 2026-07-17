from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.user import User

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/pending-drivers")
def pending_drivers(
    db: Session = Depends(get_db)
):
    users = (
        db.query(User)
        .filter(
            User.status == "pending_verification"
        )
        .all()
    )

    return users
@router.post("/approve-driver/{user_id}")
def approve_driver(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    user.status = "approved"

    db.commit()

    return {
        "message": "Driver approved"
    }
@router.post("/reject-driver/{user_id}")
def reject_driver(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    user.status = "rejected"

    db.commit()

    return {
        "message": "Driver rejected"
    }