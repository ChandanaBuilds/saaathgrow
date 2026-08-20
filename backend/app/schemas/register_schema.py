from pydantic import BaseModel, EmailStr
from typing import Optional


class RegisterRequest(BaseModel):

    phone_number: str

    full_name: str

    email: EmailStr

    city: str

    state: str

    pincode: str

    vehicle_type: str

    vehicle_number: str