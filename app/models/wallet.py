from sqlalchemy import Column, Integer, Float, ForeignKey
from app.database import Base

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    balance = Column(Float, default=0)

    total_earnings = Column(Float, default=0)

    pending_amount = Column(Float, default=0)