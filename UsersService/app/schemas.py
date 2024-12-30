from pydantic import BaseModel, ConfigDict, EmailStr, field_validator
import uuid


class UserBase(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    def check_password(cls, value):
        if len(value) < 8 or \
            not any(c.isupper() for c in value) or \
            not any(c.islower() for c in value) or \
            not any(c.isdigit() for c in value):
            raise ValueError("Password must contain at least 8 symbols,"
                             " one upper symbol, one lower symbol and one digit")
        return value

class LoginForm(BaseModel):
    email:EmailStr
    password: str

class ActivationForm(BaseModel):
    code: str

class RegisterUser(UserBase):
    pass

class ProfileSchema(BaseModel):
    name: str

    @field_validator("name")
    def check_name(cls, value):
        if len(value) < 3 or len(value) > 20:
            raise ValueError("Name must be more than 3 symbols and less than 20")
        return value

    model_config = ConfigDict(from_attributes=True)

class User(UserBase):
    id: str

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"