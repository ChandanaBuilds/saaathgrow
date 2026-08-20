from pydantic import BaseModel
from typing import Optional


class RegisterRequest(BaseModel):
    phone_number: str
    full_name: str
    email: Optional[str] = None
    city: str
    state: str
    pincode: str
    vehicle_type: str
    vehicle_number: str