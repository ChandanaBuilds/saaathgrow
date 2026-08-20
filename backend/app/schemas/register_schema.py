from pydantic import BaseModel

from typing import Optional


class RegisterRequest(BaseModel):

    phone_number: str

    full_name: str

    email: str

    city: str

    state: str

    pincode: str

    vehicle_type: str

    vehicle_number: str