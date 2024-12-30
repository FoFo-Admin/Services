from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

class BusinessBase(BaseModel):
    name: str
    city_id: int
    category_id: int
    owner_email: EmailStr

    @field_validator("name")
    def check_name(cls, value):
        if len(value.strip()) < 3 :
            raise ValueError("Name must contain at least 3 characters")
        return value

    model_config = ConfigDict(from_attributes=True)


class BusinessUpdate(BusinessBase):
    address: str
    description: str
    isPublic: bool


class ProductSchema(BaseModel):
    name: str
    description: str
    price: float
    discount: float

    @field_validator("name")
    def check_name(cls, value):
        if len(value.strip()) < 3 :
            raise ValueError("Name must contain at least 3 characters")
        return value

    @field_validator("price")
    def check_price(cls, value):
        if value <= 0:
            raise ValueError("Price must be greater than 0")
        return value

    @field_validator("discount")
    def check_discount(cls, value):
        if not (0 <= value <= 100):
            raise ValueError("Discount must be between 0 and 100")
        return value

    model_config = ConfigDict(from_attributes=True)