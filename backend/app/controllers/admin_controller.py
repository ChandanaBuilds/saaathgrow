from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from app.dependencies import get_db

from app.models.user import User

from app.schemas.admin_schema import AdminLoginRequest

from app.services.admin_auth_service import (
    verify_admin_credentials,
    create_admin_token,
    verify_admin_token
)


# =========================================================
# ADMIN ROUTER
# =========================================================

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# =========================================================
# SECURITY
# =========================================================

security = HTTPBearer()


# =========================================================
# ADMIN LOGIN
# =========================================================

@router.post("/login")
def admin_login(
    request: AdminLoginRequest
):

    email = request.email.lower().strip()

    password = request.password

    # -----------------------------------------------------
    # VERIFY ADMIN CREDENTIALS
    # -----------------------------------------------------

    if not verify_admin_credentials(
        email=email,
        password=password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid admin email or password."
        )

    # -----------------------------------------------------
    # CREATE ADMIN JWT
    # -----------------------------------------------------

    access_token = create_admin_token()

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "success": True,

        "message": "Admin login successful.",

        "access_token": access_token,

        "token_type": "bearer",

        "admin": {

            "email": email,

            "role": "admin"

        }

    }


# =========================================================
# ADMIN AUTHENTICATION
# =========================================================

def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    )
):

    token = credentials.credentials

    admin = verify_admin_token(
        token
    )

    if not admin:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired admin token."
        )

    return admin


# =========================================================
# ADMIN PROFILE
# =========================================================

@router.get("/me")
def admin_me(
    admin=Depends(get_current_admin)
):

    return {

        "success": True,

        "admin": admin

    }


# =========================================================
# GET PENDING DRIVERS
# =========================================================

@router.get("/pending-drivers")
def pending_drivers(
    db: Session = Depends(get_db),

    admin=Depends(get_current_admin)
):

    users = (

        db.query(User)

        .filter(
            User.status == "pending_verification"
        )

        .all()

    )

    return {

        "success": True,

        "count": len(users),

        "users": [

            {

                "id": user.id,

                "full_name": user.full_name,

                "email": user.email,

                "phone_number":
                    user.phone_number,

                "city":
                    getattr(user, "city", None),

                "state":
                    getattr(user, "state", None),

                "vehicle_type":
                    getattr(user, "vehicle_type", None),

                "vehicle_number":
                    getattr(user, "vehicle_number", None),

                "status":
                    user.status,

                "is_approved":
                    user.is_approved,

                "email_verified":
                    user.email_verified

            }

            for user in users

        ]

    }


# =========================================================
# GET ALL USERS
# =========================================================

@router.get("/all-users")
def all_users(
    db: Session = Depends(get_db),

    admin=Depends(get_current_admin)
):

    users = db.query(User).all()

    return {

        "success": True,

        "count": len(users),

        "users": [

            {

                "id": user.id,

                "full_name": user.full_name,

                "email": user.email,

                "phone_number":
                    user.phone_number,

                "city":
                    getattr(user, "city", None),

                "state":
                    getattr(user, "state", None),

                "vehicle_type":
                    getattr(user, "vehicle_type", None),

                "vehicle_number":
                    getattr(user, "vehicle_number", None),

                "status":
                    user.status,

                "is_approved":
                    user.is_approved,

                "email_verified":
                    user.email_verified

            }

            for user in users

        ]

    }


# =========================================================
# GET APPROVED DRIVERS
# =========================================================

@router.get("/approved-drivers")
def approved_drivers(
    db: Session = Depends(get_db),

    admin=Depends(get_current_admin)
):

    users = (

        db.query(User)

        .filter(
            User.status == "approved",
            User.is_approved == True
        )

        .all()

    )

    return {

        "success": True,

        "count": len(users),

        "drivers": [

            {

                "id": user.id,

                "full_name": user.full_name,

                "email": user.email,

                "phone_number":
                    user.phone_number,

                "city":
                    getattr(user, "city", None),

                "state":
                    getattr(user, "state", None),

                "vehicle_type":
                    getattr(user, "vehicle_type", None),

                "vehicle_number":
                    getattr(user, "vehicle_number", None),

                "status":
                    user.status,

                "is_approved":
                    user.is_approved,

                "email_verified":
                    user.email_verified

            }

            for user in users

        ]

    }


# =========================================================
# GET REJECTED DRIVERS
# =========================================================

@router.get("/rejected-drivers")
def rejected_drivers(
    db: Session = Depends(get_db),

    admin=Depends(get_current_admin)
):

    users = (

        db.query(User)

        .filter(
            User.status == "rejected"
        )

        .all()

    )

    return {

        "success": True,

        "count": len(users),

        "drivers": [

            {

                "id": user.id,

                "full_name": user.full_name,

                "email": user.email,

                "phone_number":
                    user.phone_number,

                "city":
                    getattr(user, "city", None),

                "state":
                    getattr(user, "state", None),

                "vehicle_type":
                    getattr(user, "vehicle_type", None),

                "vehicle_number":
                    getattr(user, "vehicle_number", None),

                "status":
                    user.status,

                "is_approved":
                    user.is_approved,

                "email_verified":
                    user.email_verified

            }

            for user in users

        ]

    }


# =========================================================
# GET DRIVER BY ID
# =========================================================

@router.get("/driver/{user_id}")
def get_driver(
    user_id: int,

    db: Session = Depends(get_db),

    admin=Depends(get_current_admin)
):

    user = (

        db.query(User)

        .filter(
            User.id == user_id
        )

        .first()

    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="Driver not found."
        )

    return {

        "success": True,

        "driver": {

            "id": user.id,

            "full_name": user.full_name,

            "email": user.email,

            "phone_number":
                user.phone_number,

            "city":
                getattr(user, "city", None),

            "state":
                getattr(user, "state", None),

            "vehicle_type":
                getattr(user, "vehicle_type", None),

            "vehicle_number":
                getattr(user, "vehicle_number", None),

            "status":
                user.status,

            "is_approved":
                user.is_approved,

            "email_verified":
                user.email_verified

        }

    }


# =========================================================
# APPROVE DRIVER
# =========================================================

@router.post("/approve-driver/{user_id}")
def approve_driver(
    user_id: int,

    db: Session = Depends(get_db),

    admin=Depends(get_current_admin)
):

    user = (

        db.query(User)

        .filter(
            User.id == user_id
        )

        .first()

    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="Driver not found."
        )

    # -----------------------------------------------------
    # UPDATE DRIVER STATUS
    # -----------------------------------------------------

    user.status = "approved"

    user.is_approved = True

    db.commit()

    db.refresh(user)

    return {

        "success": True,

        "message":
            "Driver approved successfully.",

        "user_id":
            user.id,

        "status":
            user.status,

        "is_approved":
            user.is_approved

    }


# =========================================================
# REJECT DRIVER
# =========================================================

@router.post("/reject-driver/{user_id}")
def reject_driver(
    user_id: int,

    db: Session = Depends(get_db),

    admin=Depends(get_current_admin)
):

    user = (

        db.query(User)

        .filter(
            User.id == user_id
        )

        .first()

    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="Driver not found."
        )

    # -----------------------------------------------------
    # UPDATE DRIVER STATUS
    # -----------------------------------------------------

    user.status = "rejected"

    user.is_approved = False

    db.commit()

    db.refresh(user)

    return {

        "success": True,

        "message":
            "Driver rejected successfully.",

        "user_id":
            user.id,

        "status":
            user.status,

        "is_approved":
            user.is_approved

    }