from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.user import User
from app.models.document import Document


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# =========================================================
# PENDING DRIVERS
# =========================================================

@router.get("/pending-drivers")
def pending_drivers(
    db: Session = Depends(get_db)
):
    """
    Get all users whose documents are waiting
    for admin verification.
    """

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
                "phone_number": user.phone_number,
                "status": user.status,
                "is_approved": user.is_approved
            }
            for user in users
        ]
    }


# =========================================================
# ALL USERS
# =========================================================

@router.get("/all-users")
def all_users(
    db: Session = Depends(get_db)
):
    """
    Get all registered users.
    """

    users = db.query(User).all()

    return {
        "success": True,
        "count": len(users),
        "users": [
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "phone_number": user.phone_number,
                "status": user.status,
                "is_approved": user.is_approved
            }
            for user in users
        ]
    }


# =========================================================
# GET USER DETAILS
# =========================================================

@router.get("/driver/{user_id}")
def get_driver(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get complete driver information.
    """

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:
        return {
            "success": False,
            "message": "Driver not found."
        }

    return {
        "success": True,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "city": user.city,
            "state": user.state,
            "pincode": user.pincode,
            "vehicle_type": user.vehicle_type,
            "vehicle_number": user.vehicle_number,
            "status": user.status,
            "is_approved": user.is_approved,
            "email_verified": user.email_verified
        }
    }


# =========================================================
# GET DRIVER DOCUMENTS
# =========================================================

@router.get("/driver/{user_id}/documents")
def get_driver_documents(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get the documents uploaded by a driver.

    Current frontend uploads:

    1. Aadhaar
    2. PAN Card
    3. Driving License

    These are stored as:

    Aadhaar          -> aadhaar_front
    PAN Card         -> pan_card
    Driving License  -> driving_license_front
    """

    # -----------------------------------------------------
    # CHECK USER
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:

        return {
            "success": False,
            "message": "Driver not found."
        }

    # -----------------------------------------------------
    # GET LATEST DOCUMENT RECORD
    # -----------------------------------------------------

    document = (
        db.query(Document)
        .filter(
            Document.user_id == user_id
        )
        .order_by(
            Document.id.desc()
        )
        .first()
    )

    if not document:

        return {
            "success": False,
            "message": "No documents found for this driver."
        }

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "success": True,

        "user_id": user_id,

        "document_id": document.id,

        "status": document.status,

        "documents": {

            "aadhaar": document.aadhaar_front,

            "pan_card": document.pan_card,

            "driving_license":
                document.driving_license_front
        }
    }


# =========================================================
# APPROVE DRIVER
# =========================================================

@router.post("/approve-driver/{user_id}")
def approve_driver(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Approve a driver's application.
    """

    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:

        return {
            "success": False,
            "message": "Driver not found."
        }

    # -----------------------------------------------------
    # CHECK DOCUMENTS
    # -----------------------------------------------------

    document = (
        db.query(Document)
        .filter(
            Document.user_id == user_id
        )
        .order_by(
            Document.id.desc()
        )
        .first()
    )

    if not document:

        return {
            "success": False,
            "message": (
                "Cannot approve driver. "
                "Documents have not been uploaded."
            )
        }

    # -----------------------------------------------------
    # APPROVE
    # -----------------------------------------------------

    user.status = "approved"
    user.is_approved = True

    document.status = "approved"

    db.commit()

    db.refresh(user)
    db.refresh(document)

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "success": True,
        "message": "Driver approved successfully.",
        "user_id": user.id,
        "status": user.status,
        "is_approved": user.is_approved,
        "document_status": document.status
    }


# =========================================================
# REJECT DRIVER
# =========================================================

@router.post("/reject-driver/{user_id}")
def reject_driver(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Reject a driver's application.
    """

    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:

        return {
            "success": False,
            "message": "Driver not found."
        }

    # -----------------------------------------------------
    # GET DOCUMENT
    # -----------------------------------------------------

    document = (
        db.query(Document)
        .filter(
            Document.user_id == user_id
        )
        .order_by(
            Document.id.desc()
        )
        .first()
    )

    # -----------------------------------------------------
    # REJECT USER
    # -----------------------------------------------------

    user.status = "rejected"
    user.is_approved = False

    if document:
        document.status = "rejected"

    db.commit()

    db.refresh(user)

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "success": True,
        "message": "Driver rejected successfully.",
        "user_id": user.id,
        "status": user.status,
        "is_approved": user.is_approved
    }