from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database import Base


class EmailOTP(Base):
    __tablename__ = "email_otps"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(
        String,
        index=True,
        nullable=False
    )

    otp = Column(
        String,
        nullable=False
    )

    purpose = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )