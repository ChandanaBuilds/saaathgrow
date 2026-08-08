from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.wallet import Wallet

router = APIRouter(
    prefix="/wallet",
    tags=["Wallet"]
)

@router.get("/{user_id}")
def get_wallet(
    user_id: int,
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(
        Wallet.user_id == user_id
    ).first()

    if not wallet:
        return {
            "balance": 0,
            "total_earnings": 0,
            "pending_amount": 0
        }

    return wallet