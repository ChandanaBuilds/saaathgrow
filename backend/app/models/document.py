from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    profile_photo = Column(
        String,
        nullable=True
    )

    aadhaar_front = Column(
        String,
        nullable=True
    )

    aadhaar_back = Column(
        String,
        nullable=True
    )

    pan_card = Column(
        String,
        nullable=True
    )

    driving_license_front = Column(
        String,
        nullable=True
    )

    driving_license_back = Column(
        String,
        nullable=True
    )

    vehicle_rc = Column(
        String,
        nullable=True
    )

    insurance = Column(
        String,
        nullable=True
    )

    status = Column(
        String,
        default="pending"
    )