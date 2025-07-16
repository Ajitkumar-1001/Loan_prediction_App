from pydantic import BaseModel
from pydantic import field_validator
from typing import Optional
import re
from datetime import datetime



class UserBase(BaseModel):
    FirstName: str
    MiddleName: Optional[str] = None
    LastName: str
    Email: str

    @field_validator('Email', mode='before')
    @classmethod
    def strip_space(cls, v: str) -> str:
        return v.strip()

    @field_validator('Email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        email_format = r'^[A-Za-z0-9.]+@gmail\.com$'
        if re.match(email_format, v):
            return v.lower()
        raise ValueError("Invalid Format, please enter the correct Gmail address.")

# ✅ For user registration: no isAdmin!
class CreateUser(UserBase):
    Password: str

    @field_validator("Password", mode='before')
    @classmethod
    def strip_space(cls, v: str) -> str:
        return v.strip()

    @field_validator("Password")
    @classmethod
    def pattern(cls, v: str) -> str:
        if len(v) != 16:
            raise ValueError("Password must be exactly 16 characters long.")
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must include at least one letter.")
        if not re.search(r"[0-9%&^#$@]", v):
            raise ValueError("Password must include at least one number or special symbol.")
        return v


class Users(UserBase):
    isAdmin: Optional[bool] = False

    
    
class Userlogin(BaseModel):
        
        Email : str
        Password : str 

        @field_validator("Email", mode='before')
        @classmethod
        def strip_space(cls, v: str) -> str:
            return v.strip()

        @field_validator("Email")
        @classmethod
        def validate_email(cls, v: str) -> str:
            email_format = r'^[A-Za-z0-9.]+@gmail\.com$'
            if re.match(email_format, v):
                return v.lower()
            raise ValueError("Invalid Format, please enter a valid Gmail address")

        @field_validator("Password", mode='before')
        @classmethod
        def strip_space(cls, v: str) -> str:
            return v.strip()

        @field_validator("Password")
        @classmethod
        def pattern(cls, v: str) -> str:
            if len(v) != 16:
                raise ValueError("Password must be exactly 16 characters long.")
            if not re.search(r"[A-Za-z]", v):
                raise ValueError("Password must include at least one letter.")
            if not re.search(r"[0-9%&^#$@]", v):
                raise ValueError("Password must include at least one number or special symbol.")
            return v


class UserinDB(UserBase):

    user_id : Optional[int] = None 
    hashed_password : str 
    date_created : datetime


