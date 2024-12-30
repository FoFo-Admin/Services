from typing import List

from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    __abstract__ = True


class Help(Base):
    __abstract__ = True

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(unique=True)


class City(Help):
    __tablename__ = "cities"

    businesses: Mapped[List["Business"]] = relationship(back_populates="city")


class Category(Help):
    __tablename__ = "categories"

    businesses: Mapped[List["Business"]] = relationship(back_populates="category")


class Business(Base):
    __tablename__ = "businesses"

    id: Mapped[str] = mapped_column(primary_key=True)
    name: Mapped[str]
    city_id: Mapped[int] = mapped_column(ForeignKey("cities.id"), nullable=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=True)
    address: Mapped[str] = mapped_column(nullable=True)
    description: Mapped[str] = mapped_column(nullable=True)
    owner_email: Mapped[str]
    isLogoAdded: Mapped[bool] = mapped_column(default=False)
    isPhotoAdded: Mapped[bool] = mapped_column(default=False)
    isPublic: Mapped[bool] = mapped_column(default=False)


    city: Mapped["City"] = relationship(back_populates="businesses")
    category: Mapped["Category"] = relationship(back_populates="businesses")
    contacts: Mapped[List["Contact"]] = relationship(back_populates="business")
    products: Mapped[List["Product"]] = relationship(back_populates="business")


class Type(Help):
    __tablename__ = "types"

    contacts: Mapped[List["Contact"]] = relationship(back_populates="type")


class Contact(Base):
    __tablename__ = "contacts"

    id: Mapped[str] = mapped_column(primary_key=True)
    value: Mapped[str]
    type_id: Mapped[int] = mapped_column(ForeignKey("types.id"), nullable=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"))

    type: Mapped[List["Type"]] = relationship(back_populates="contacts")
    business: Mapped["Business"] = relationship(back_populates="contacts")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(primary_key=True)
    name: Mapped[str]
    description: Mapped[str] = mapped_column(nullable=True)
    price: Mapped[float]
    discount: Mapped[float]
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"))
    isPhotoAdded: Mapped[bool] = mapped_column(default=False)

    business: Mapped["Business"] = relationship(back_populates="products")

