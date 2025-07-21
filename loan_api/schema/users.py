from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional
from datetime import datetime
import re


# Shared Base
class UserBase(BaseModel):
    firstname: str
    middlename: Optional[str] = None
    lastname: str
    email: str

    @field_validator('email', mode='before')
    @classmethod
    def strip_space(cls, v: str) -> str:
        return v.strip()

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        email_format = r'^[A-Za-z0-9.]+@gmail\.com$'
        if re.match(email_format, v):
            return v.lower()
        raise ValueError("Invalid Format, please enter the correct Gmail address.")


# Signup Input
class CreateUser(UserBase):
    password: str

    @field_validator("password", mode='before')
    @classmethod
    def strip_space(cls, v: str) -> str:
        return v.strip()

    @field_validator("password")
    @classmethod
    def pattern(cls, v: str) -> str:
        if len(v) != 16:
            raise ValueError("Password must be exactly 16 characters long.")
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must include at least one letter.")
        if not re.search(r"[0-9%&^#$@]", v):
            raise ValueError("Password must include at least one number or special symbol.")
        return v


# Output Response
class Users(UserBase):
    isAdmin: Optional[bool] = False
    role: Optional[str] = "user"

    @model_validator(mode="after")
    def sync_admin_flag(self):
        if self.role and self.role.lower() == "admin":
            self.isAdmin = True
        else:
            self.isAdmin = False
        return self


# Login Input
class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator("email", mode='before')
    @classmethod
    def strip_space(cls, v: str) -> str:
        return v.strip()

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        email_format = r'^[A-Za-z0-9.]+@gmail\.com$'
        if re.match(email_format, v):
            return v.lower()
        raise ValueError("Invalid Format, please enter a valid Gmail address")

    @field_validator("password", mode='before')
    @classmethod
    def strip_space(cls, v: str) -> str:
        return v.strip()

    @field_validator("password")
    @classmethod
    def pattern(cls, v: str) -> str:
        if len(v) != 16:
            raise ValueError("Password must be exactly 16 characters long.")
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must include at least one letter.")
        if not re.search(r"[0-9%&^#$@]", v):
            raise ValueError("Password must include at least one number or special symbol.")
        return v


# Internal Usage
class UserInDB(UserBase):
    user_id: Optional[int] = None
    password: str  # This matches your SQLAlchemy model
    date_created: datetime

    class Config:
        from_attributes = True
