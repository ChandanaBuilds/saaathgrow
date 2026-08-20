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

    existing_otp = (
        db.query(OTP)
        .filter(
            OTP.phone_number == request.phone_number
        )
        .first()
    )

    if existing_otp:
        existing_otp.otp = otp
    else:
        otp_row = OTP(
            phone_number=request.phone_number,
            otp=otp
        )

        db.add(otp_row)

    db.commit()

    # Check whether user already exists
    existing_user = (
        db.query(User)
        .filter(
            User.phone_number == request.phone_number
        )
        .first()
    )

    return {
        "success": True,
        "message": "OTP sent successfully",
        "otp": otp,
        "is_new_user": existing_user is None
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
                "phone_number": user.phone_number,
                "full_name": user.full_name,
                "email": user.email,
                "city": user.city,
                "state": user.state,
                "pincode": user.pincode,
                "vehicle_type": user.vehicle_type,
                "vehicle_number": user.vehicle_number,
                "is_approved": user.is_approved
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
async def upload_documents(
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
    print("======================================")
    print("DOCUMENT UPLOAD REQUEST")
    print("USER ID:", user_id)
    print("======================================")

    # --------------------------------------------------
    # CHECK USER
    # --------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:

        print("USER NOT FOUND:", user_id)

        return {
            "success": False,
            "message": "User account not found."
        }

    # --------------------------------------------------
    # CREATE UPLOAD DIRECTORY
    # --------------------------------------------------

    upload_directory = "uploads"

    os.makedirs(
        upload_directory,
        exist_ok=True
    )

    # --------------------------------------------------
    # CREATE DOCUMENT RECORD
    # --------------------------------------------------

    document = Document(
        user_id=user_id
    )

    # --------------------------------------------------
    # FILES
    # --------------------------------------------------

    files = {
        "profile_photo": profile_photo,

        "aadhaar_front": aadhaar_front,
        "aadhaar_back": aadhaar_back,

        "pan_card": pan_card,

        "driving_license_front":
            driving_license_front,

        "driving_license_back":
            driving_license_back,

        "vehicle_rc": vehicle_rc,

        "insurance": insurance,
    }

    uploaded_files = []

    # --------------------------------------------------
    # SAVE FILES
    # --------------------------------------------------

    for field_name, file in files.items():

        if file is None:
            continue

        print(
            "Uploading:",
            field_name,
            file.filename
        )

        # Prevent empty files
        if not file.filename:
            continue

        # Simple safe filename
        safe_filename = os.path.basename(
            file.filename
        )

        file_path = os.path.join(
            upload_directory,
            f"{user_id}_{safe_filename}"
        )

        try:

            with open(
                file_path,
                "wb"
            ) as buffer:

                shutil.copyfileobj(
                    file.file,
                    buffer
                )

        except Exception as error:

            print(
                "FILE SAVE ERROR:",
                error
            )

            return {
                "success": False,
                "message": (
                    f"Unable to save "
                    f"{field_name}."
                )
            }

        # Save path in database
        setattr(
            document,
            field_name,
            file_path
        )

        uploaded_files.append(
            field_name
        )

        print(
            "Saved:",
            file_path
        )

    # --------------------------------------------------
    # CHECK DOCUMENTS
    # --------------------------------------------------

    if not uploaded_files:

        return {
            "success": False,
            "message": (
                "Please upload at least "
                "one document."
            )
        }

    # --------------------------------------------------
    # SAVE DOCUMENT RECORD
    # --------------------------------------------------

    db.add(document)

    user.status = "pending_verification"

    db.commit()

    db.refresh(document)

    print(
        "DOCUMENTS SAVED SUCCESSFULLY"
    )

    print(
        "DOCUMENT ID:",
        document.id
    )

    print(
        "USER STATUS:",
        user.status
    )

    print("======================================")

    return {

        "success": True,

        "message":
            "Documents uploaded successfully.",

        "user_id":
            user_id,

        "document_id":
            document.id,

        "uploaded_files":
            uploaded_files
    }