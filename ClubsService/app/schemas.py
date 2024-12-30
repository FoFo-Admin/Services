from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

class ClubBase(BaseModel):
    name: str
    city_id: int
    type_id: int

    @field_validator("name")
    def check_name(cls, value):
        if len(value.strip()) < 3:
            raise ValueError("Name must contain at least 3 characters")
        return value

    model_config = ConfigDict(from_attributes=True)