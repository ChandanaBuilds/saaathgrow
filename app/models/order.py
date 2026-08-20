from sqlalchemy import Column, Integer, String
from app.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    pickup_location = Column(String)
    drop_location = Column(String)

    amount = Column(Integer)

    distance = Column(String)

    status = Column(
        String,
        default="available"
    )

    driver_id = Column(
        Integer,
        nullable=True
    )