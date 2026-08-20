from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base
from sqlalchemy import Column, Integer, String, Boolean


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    phone_number = Column(
        String,
        unique=True,
        index=True
    )

    full_name = Column(String)
    email = Column(String)

    city = Column(String)
    state = Column(String)
    pincode = Column(String)

    vehicle_type = Column(String)
    vehicle_number = Column(String)

    is_approved = Column(
        Boolean,
        default=False
    )
    
    status = Column(
    String,
    default="pending_profile"
)
