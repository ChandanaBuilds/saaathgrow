import random

from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.otp import OTP
from app.models.user import User
from app.schemas.auth_schema import (
    SendOTPRequest,
    VerifyOTPRequest
)
from app.schemas.register_schema import RegisterRequest

from app.models.document import Document

from fastapi import UploadFile
from fastapi import File
from fastapi import Form
import shutil
import os

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/send-otp")
def send_otp(
    request: SendOTPRequest,
    db: Session = Depends(get_db)
):
    otp = "123456"

    existing = (
        db.query(OTP)
        .filter(
            OTP.phone_number == request.phone_number
        )
        .first()
    )

    if existing:
        existing.otp = otp
    else:
        otp_row = OTP(
            phone_number=request.phone_number,
            otp=otp
        )

        db.add(otp_row)

    db.commit()

    return {
        "message": "OTP sent successfully",
        "otp": otp
    }


@router.post("/verify-otp")
def verify_otp(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db)
):
    otp_record = (
        db.query(OTP)
        .filter(
            OTP.phone_number == request.phone_number,
            OTP.otp == request.otp
        )
        .first()
    )

    if not otp_record:
        return {
            "success": False,
            "message": "Invalid OTP"
        }

    user = (
        db.query(User)
        .filter(
            User.phone_number == request.phone_number
        )
        .first()
    )

    if user:
       return {
    "success": True,
    "is_new_user": False,
    "status": user.status,
    "user": {
        "id": user.id,
        "phone_number": user.phone_number
    }
}

    return {
        "success": True,
        "is_new_user": True
    }
@router.post("/register")
def register_user(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(User)
        .filter(
            User.phone_number == request.phone_number
        )
        .first()
    )

    if existing_user:
        return {
            "success": False,
            "message": "User already exists"
        }

    user = User(
        phone_number=request.phone_number,
        full_name=request.full_name,
        email=request.email,
        city=request.city,
        state=request.state,
        pincode=request.pincode,
        vehicle_type=request.vehicle_type,
        vehicle_number=request.vehicle_number,
       is_approved=False,
    status="pending_documents"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "Registration completed successfully",
        "user_id": user.id
    }
    
@router.post("/upload-documents")
def upload_documents(
    user_id: int = Form(...),
    profile_photo: UploadFile = File(None),
    aadhaar_front: UploadFile = File(None),
    aadhaar_back: UploadFile = File(None),
    pan_card: UploadFile = File(None),
    driving_license_front: UploadFile = File(None),
    driving_license_back: UploadFile = File(None),
    vehicle_rc: UploadFile = File(None),
    insurance: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    os.makedirs("uploads", exist_ok=True)

    document = Document(
        user_id=user_id
    )

    files = {
        "profile_photo": profile_photo,
        "aadhaar_front": aadhaar_front,
        "aadhaar_back": aadhaar_back,
        "pan_card": pan_card,
        "driving_license_front": driving_license_front,
        "driving_license_back": driving_license_back,
        "vehicle_rc": vehicle_rc,
        "insurance": insurance,
    }

    for field_name, file in files.items():
        if file:
            file_path = f"uploads/{user_id}_{file.filename}"

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(
                    file.file,
                    buffer
                )

            setattr(
                document,
                field_name,
                file_path
            )

    db.add(document)
    user = db.query(User).filter(
    User.id == user_id
    ).first()
    user.status = "pending_verification"
    db.commit()
    db.refresh(document)

    return {
        "success": True,
        "message": "Documents uploaded successfully"
    }