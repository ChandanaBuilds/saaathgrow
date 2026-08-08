from sqlalchemy import Column, Integer, String
from app.database import Base


class OTP(Base):
    __tablename__ = "otp_codes"

    id = Column(Integer, primary_key=True, index=True)

    phone_number = Column(String, index=True)

    otp = Column(String)