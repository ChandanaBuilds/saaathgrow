import secrets
import os
import shutil

from datetime import datetime, timedelta

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form
)

from sqlalchemy.orm import Session

from app.dependencies import get_db

from app.models.user import User
from app.models.email_otp import EmailOTP
from app.models.document import Document

from app.schemas.register_schema import RegisterRequest

from app.services.email_service import send_otp_email

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================================================
# CONSTANTS
# =========================================================

OTP_EXPIRY_MINUTES = 5


# =========================================================
# OTP GENERATOR
# =========================================================

def generate_otp() -> str:
    """
    Generate a secure 6-digit OTP.
    """

    return str(
        secrets.randbelow(900000) + 100000
    )


# =========================================================
# HELPER - REMOVE OLD OTPs
# =========================================================

def remove_old_otps(
    db: Session,
    email: str,
    purpose: str
):
    """
    Remove previous OTP records for the same
    email and purpose.
    """

    db.query(EmailOTP).filter(
        EmailOTP.email == email,
        EmailOTP.purpose == purpose
    ).delete(
        synchronize_session=False
    )

    db.commit()


# =========================================================
# HELPER - CHECK OTP EXPIRY
# =========================================================

def is_otp_expired(
    otp_record: EmailOTP
) -> bool:

    if not otp_record.created_at:
        return True

    return (
        datetime.utcnow()
        - otp_record.created_at
        > timedelta(
            minutes=OTP_EXPIRY_MINUTES
        )
    )


# =========================================================
# NEW USER REGISTRATION
# =========================================================

@router.post("/register")
def register_user(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Stage 1 registration.

    User provides only:

    - Full name
    - Gmail
    - Phone number

    After successful registration,
    an OTP is sent to the provided email.
    """

    # -----------------------------------------------------
    # CLEAN INPUT
    # -----------------------------------------------------

    email = str(
        request.email
    ).lower().strip()

    phone_number = (
        request.phone_number
        .strip()
    )

    full_name = (
        request.full_name
        .strip()
    )


    # -----------------------------------------------------
    # CHECK PHONE NUMBER
    # -----------------------------------------------------

    existing_phone = (
        db.query(User)
        .filter(
            User.phone_number
            == phone_number
        )
        .first()
    )

    if existing_phone:

        return {
            "success": False,
            "field": "phone",
            "message": (
                "This mobile number is already "
                "registered. Please login."
            )
        }


    # -----------------------------------------------------
    # CHECK EMAIL
    # -----------------------------------------------------

    existing_email = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if existing_email:

        return {
            "success": False,
            "field": "email",
            "message": (
                "This email is already registered. "
                "Please login."
            )
        }


    # -----------------------------------------------------
    # CREATE USER
    #
    # IMPORTANT:
    # We only create the basic account here.
    #
    # Profile fields such as:
    # city
    # state
    # pincode
    # vehicle_type
    # vehicle_number
    #
    # will be completed later.
    # -----------------------------------------------------

    user = User(

        phone_number=phone_number,

        full_name=full_name,

        email=email,

        is_approved=False,

        email_verified=False,

        status="pending_email_verification"
    )


    db.add(user)

    db.commit()

    db.refresh(user)


    # -----------------------------------------------------
    # REMOVE OLD REGISTRATION OTPs
    # -----------------------------------------------------

    remove_old_otps(
        db=db,
        email=email,
        purpose="registration"
    )


    # -----------------------------------------------------
    # GENERATE OTP
    # -----------------------------------------------------

    otp = generate_otp()


    # -----------------------------------------------------
    # SAVE OTP
    # -----------------------------------------------------

    email_otp = EmailOTP(

        email=email,

        otp=otp,

        purpose="registration"
    )


    db.add(email_otp)

    db.commit()


    # -----------------------------------------------------
    # SEND OTP EMAIL
    # -----------------------------------------------------

    try:

        send_otp_email(

            recipient_email=email,

            otp=otp,

            purpose="registration"
        )

    except Exception as error:

        print(
            "REGISTRATION EMAIL ERROR:",
            error
        )


        # ---------------------------------------------
        # REMOVE OTP
        # ---------------------------------------------

        db.delete(email_otp)

        db.commit()


        # ---------------------------------------------
        # REMOVE USER
        # ---------------------------------------------

        db.delete(user)

        db.commit()


        return {

            "success": False,

            "field": "email",

            "message": (
                "We could not send an OTP to this "
                "email address. Please check your "
                "Gmail address and try again."
            )
        }


    # -----------------------------------------------------
    # SUCCESS RESPONSE
    # -----------------------------------------------------

    return {

        "success": True,

        "message": (
            "Registration successful. "
            "OTP has been sent to your email."
        ),

        "user_id": user.id,

        "email": email
    }


# =========================================================
# VERIFY REGISTRATION OTP
# =========================================================

# =========================================================
# VERIFY REGISTRATION OTP
# =========================================================

@router.post("/verify-registration-otp")
def verify_registration_otp(
    email: str,
    otp: str,
    db: Session = Depends(get_db)
):
    """
    Verify the latest OTP sent during registration.
    """

    # -----------------------------------------------------
    # CLEAN INPUT
    # -----------------------------------------------------

    email = str(email).lower().strip()
    otp = str(otp).strip()

    print("========================================")
    print("REGISTRATION OTP VERIFICATION")
    print("EMAIL RECEIVED:", repr(email))
    print("OTP RECEIVED:", repr(otp))
    print("========================================")


    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )


    if not user:

        print(
            "USER NOT FOUND:",
            repr(email)
        )

        return {
            "success": False,
            "message": (
                "User account not found. "
                "Please register again."
            )
        }


    print(
        "USER FOUND:",
        user.id,
        user.email
    )


    # -----------------------------------------------------
    # FIND LATEST REGISTRATION OTP
    # -----------------------------------------------------

    otp_record = (
        db.query(EmailOTP)
        .filter(
            EmailOTP.email == email,
            EmailOTP.purpose == "registration"
        )
        .order_by(
            EmailOTP.id.desc()
        )
        .first()
    )


    # -----------------------------------------------------
    # NO OTP FOUND
    # -----------------------------------------------------

    if not otp_record:

        print(
            "NO REGISTRATION OTP FOUND FOR:",
            repr(email)
        )

        return {
            "success": False,
            "message": (
                "No active OTP was found. "
                "Please request a new OTP."
            )
        }


    # -----------------------------------------------------
    # PRINT DATABASE OTP INFORMATION
    # -----------------------------------------------------

    stored_otp = str(
        otp_record.otp
    ).strip()


    print(
        "OTP RECORD ID:",
        otp_record.id
    )

    print(
        "OTP PURPOSE:",
        repr(otp_record.purpose)
    )

    print(
        "OTP CREATED AT:",
        otp_record.created_at
    )

    print(
        "OTP RECEIVED:",
        repr(otp)
    )

    print(
        "OTP STORED:",
        repr(stored_otp)
    )


    # -----------------------------------------------------
    # COMPARE OTP
    # -----------------------------------------------------

    if stored_otp != otp:

        print(
            "OTP MISMATCH"
        )

        return {
            "success": False,
            "message": (
                "Invalid OTP. "
                "Please use the latest OTP sent "
                "to your email."
            )
        }


    print(
        "OTP MATCHED SUCCESSFULLY"
    )


    # -----------------------------------------------------
    # CHECK EXPIRY
    # -----------------------------------------------------

    if is_otp_expired(
        otp_record
    ):

        print(
            "OTP EXPIRED"
        )

        db.delete(
            otp_record
        )

        db.commit()

        return {
            "success": False,
            "message": (
                "This OTP has expired. "
                "Please request a new OTP."
            )
        }


    # -----------------------------------------------------
    # VERIFY EMAIL
    # -----------------------------------------------------

    user.email_verified = True

    user.status = "pending_profile"


    # -----------------------------------------------------
    # DELETE USED OTP
    # -----------------------------------------------------

    db.delete(
        otp_record
    )

    db.commit()


    # -----------------------------------------------------
    # SUCCESS LOG
    # -----------------------------------------------------

    print(
        "EMAIL VERIFIED SUCCESSFULLY:",
        repr(email)
    )

    print(
        "USER STATUS:",
        user.status
    )

    print("========================================")


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "success": True,

        "message": (
            "Email verified successfully."
        ),

        "user": {
            "id": user.id,

            "phone_number":
                user.phone_number,

            "full_name":
                user.full_name,

            "email":
                user.email,

            "status":
                user.status,

            "email_verified":
                user.email_verified
        }
    }
    # =========================================================
# RESEND REGISTRATION OTP
# =========================================================

@router.post("/register/resend-otp")
def resend_registration_otp(

    email: str,

    db: Session = Depends(get_db)
):
    """
    Resend OTP for a new user registration.
    """

    email = (
        email
        .lower()
        .strip()
    )


    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    user = (

        db.query(User)

        .filter(
            User.email == email
        )

        .first()
    )


    if not user:

        return {

            "success": False,

            "message": (
                "No registration found "
                "with this email."
            )
        }


    # -----------------------------------------------------
    # ALREADY VERIFIED
    # -----------------------------------------------------

    if user.email_verified:

        return {

            "success": False,

            "message": (
                "This email is already verified."
            )
        }


    # -----------------------------------------------------
    # REMOVE OLD OTPs
    # -----------------------------------------------------

    remove_old_otps(

        db=db,

        email=email,

        purpose="registration"
    )


    # -----------------------------------------------------
    # GENERATE NEW OTP
    # -----------------------------------------------------

    otp = generate_otp()


    # -----------------------------------------------------
    # SAVE NEW OTP
    # -----------------------------------------------------

    email_otp = EmailOTP(

        email=email,

        otp=otp,

        purpose="registration"
    )


    db.add(
        email_otp
    )

    db.commit()


    # -----------------------------------------------------
    # SEND EMAIL
    # -----------------------------------------------------

    try:

        send_otp_email(

            recipient_email=email,

            otp=otp,

            purpose="registration"
        )

    except Exception as error:

        print(
            "RESEND REGISTRATION OTP ERROR:",
            error
        )


        db.delete(
            email_otp
        )

        db.commit()


        return {

            "success": False,

            "message": (
                "Unable to send OTP. "
                "Please check your email "
                "and try again."
            )
        }


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "success": True,

        "message": (
            "A new OTP has been sent "
            "to your email."
        )
    }


# =========================================================
# EXISTING USER LOGIN - SEND OTP
# =========================================================

@router.post("/login/send-otp")
def send_login_otp(

    email: str,

    db: Session = Depends(get_db)
):
    """
    Send login OTP to an existing
    verified user.
    """

    email = (
        email
        .lower()
        .strip()
    )


    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    user = (

        db.query(User)

        .filter(
            User.email == email
        )

        .first()
    )


    # -----------------------------------------------------
    # EMAIL NOT REGISTERED
    # -----------------------------------------------------

    if not user:

        return {

            "success": False,

            "field": "email",

            "message": (
                "No account was found "
                "with this email. "
                "Please register first."
            )
        }


    # -----------------------------------------------------
    # EMAIL NOT VERIFIED
    # -----------------------------------------------------

    if not user.email_verified:

        return {

            "success": False,

            "field": "email",

            "message": (
                "Your email has not been verified. "
                "Please complete registration first."
            )
        }


    # -----------------------------------------------------
    # REMOVE OLD LOGIN OTPs
    # -----------------------------------------------------

    remove_old_otps(

        db=db,

        email=email,

        purpose="login"
    )


    # -----------------------------------------------------
    # GENERATE OTP
    # -----------------------------------------------------

    otp = generate_otp()


    # -----------------------------------------------------
    # SAVE OTP
    # -----------------------------------------------------

    email_otp = EmailOTP(

        email=email,

        otp=otp,

        purpose="login"
    )


    db.add(
        email_otp
    )

    db.commit()


    # -----------------------------------------------------
    # SEND LOGIN OTP
    # -----------------------------------------------------

    try:

        send_otp_email(

            recipient_email=email,

            otp=otp,

            purpose="login"
        )

    except Exception as error:

        print(
            "LOGIN EMAIL ERROR:",
            error
        )


        db.delete(
            email_otp
        )

        db.commit()


        return {

            "success": False,

            "field": "email",

            "message": (
                "We could not send the login OTP. "
                "Please check your email "
                "and try again."
            )
        }


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "success": True,

        "message": (
            "Login OTP has been sent "
            "to your email."
        ),

        "email": email
    }


# =========================================================
# VERIFY LOGIN OTP
# =========================================================

@router.post("/login/verify-otp")
def verify_login_otp(

    email: str,

    otp: str,

    db: Session = Depends(get_db)
):
    """
    Verify login OTP and return
    user information.
    """

    email = (
        email
        .lower()
        .strip()
    )

    otp = otp.strip()


    # -----------------------------------------------------
    # FIND OTP
    # -----------------------------------------------------

    otp_record = (

        db.query(EmailOTP)

        .filter(

            EmailOTP.email == email,

            EmailOTP.otp == otp,

            EmailOTP.purpose
            == "login"

        )

        .order_by(
            EmailOTP.id.desc()
        )

        .first()
    )


    # -----------------------------------------------------
    # INVALID OTP
    # -----------------------------------------------------

    if not otp_record:

        return {

            "success": False,

            "message": (
                "Invalid OTP. "
                "Please check the OTP "
                "and try again."
            )
        }


    # -----------------------------------------------------
    # CHECK EXPIRY
    # -----------------------------------------------------

    if is_otp_expired(
        otp_record
    ):

        db.delete(
            otp_record
        )

        db.commit()


        return {

            "success": False,

            "message": (
                "This OTP has expired. "
                "Please request a new OTP."
            )
        }


    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    user = (

        db.query(User)

        .filter(
            User.email == email
        )

        .first()
    )


    if not user:

        db.delete(
            otp_record
        )

        db.commit()


        return {

            "success": False,

            "message": (
                "User account not found."
            )
        }


    # -----------------------------------------------------
    # DELETE USED OTP
    # -----------------------------------------------------

    db.delete(
        otp_record
    )

    db.commit()


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "success": True,

        "message": "Login successful.",

        "status": user.status,

        "user": {

            "id": user.id,

            "phone_number":
                user.phone_number,

            "full_name":
                user.full_name,

            "email":
                user.email,

            "city":
                user.city,

            "state":
                user.state,

            "pincode":
                user.pincode,

            "vehicle_type":
                user.vehicle_type,

            "vehicle_number":
                user.vehicle_number,

            "is_approved":
                user.is_approved,

            "email_verified":
                user.email_verified
        }
    }


# =========================================================
# OLD PHONE OTP ENDPOINT
# =========================================================

@router.post("/send-otp")
def old_phone_otp_endpoint():
    """
    Temporary compatibility endpoint.

    Phone OTP login has been replaced
    with email OTP login.
    """

    return {

        "success": False,

        "message": (
            "Phone OTP login is no longer supported. "
            "Please use email login."
        )
    }
# =========================================================
# DOCUMENT UPLOAD
# =========================================================

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

    # -----------------------------------------------------
    # CHECK USER
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:

        return {
            "success": False,
            "message": "User account not found."
        }


    # -----------------------------------------------------
    # CREATE UPLOAD DIRECTORY
    # -----------------------------------------------------

    upload_directory = "uploads"

    os.makedirs(
        upload_directory,
        exist_ok=True
    )


    # -----------------------------------------------------
    # CREATE DOCUMENT RECORD
    # -----------------------------------------------------

    document = Document(
        user_id=user_id
    )


    # -----------------------------------------------------
    # FILES
    # -----------------------------------------------------

    files = {

        "profile_photo":
            profile_photo,

        "aadhaar_front":
            aadhaar_front,

        "aadhaar_back":
            aadhaar_back,

        "pan_card":
            pan_card,

        "driving_license_front":
            driving_license_front,

        "driving_license_back":
            driving_license_back,

        "vehicle_rc":
            vehicle_rc,

        "insurance":
            insurance,
    }


    # -----------------------------------------------------
    # SAVE FILES
    # -----------------------------------------------------

    for field_name, file in files.items():

        if file is None:
            continue


        # Remove unsafe filename characters
        filename = os.path.basename(
            file.filename
        )


        # Create unique filename
        file_path = os.path.join(
            upload_directory,
            f"{user_id}_{field_name}_{filename}"
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


            # Save path in database
            setattr(
                document,
                field_name,
                file_path
            )


        except Exception as error:

            print(
                "FILE SAVE ERROR:",
                error
            )

            return {

                "success": False,

                "message":
                    f"Unable to save {field_name}."
            }


    # -----------------------------------------------------
    # SAVE DOCUMENT RECORD
    # -----------------------------------------------------

    db.add(document)


    # -----------------------------------------------------
    # UPDATE USER STATUS
    # -----------------------------------------------------

    user.status = "pending_verification"


    db.commit()

    db.refresh(document)


    # -----------------------------------------------------
    # SUCCESS
    # -----------------------------------------------------

    return {

        "success": True,

        "message":
            "Documents uploaded successfully.",

        "user_id":
            user_id,

        "status":
            user.status
    }