import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db

from app.models.user import User
from app.models.email_otp import EmailOTP

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

@router.post("/verify-registration-otp")
def verify_registration_otp(

    email: str,

    otp: str,

    db: Session = Depends(get_db)
):
    """
    Verify the OTP sent during
    new user registration.
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
            == "registration"

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
                "Please check your email "
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
                "User account not found. "
                "Please register again."
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
                user.status
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