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

    clubs: Mapped[List["Club"]] = relationship(back_populates="city")


class Type(Help):
    __tablename__ = "types"

    clubs: Mapped[List["Club"]] = relationship(back_populates="type")


class Club(Base):
    __tablename__ = "clubs"

    id: Mapped[str] = mapped_column(primary_key=True)
    name: Mapped[str]
    city_id: Mapped[int] = mapped_column(ForeignKey("cities.id"), nullable=True)
    type_id: Mapped[int] = mapped_column(ForeignKey("types.id"), nullable=True)
    invitations: Mapped[int] = mapped_column(default=0)
    isPhotoAdded: Mapped[bool] = mapped_column(default=False)


    city: Mapped["City"] = relationship(back_populates="clubs")
    type: Mapped["Type"] = relationship(back_populates="clubs")
    members: Mapped[List["Member"]] = relationship(back_populates="club")


class Role(Help):
    __tablename__ = "roles"

    members: Mapped[List["Member"]] = relationship(back_populates="role")

class Member(Base):
    __tablename__ = "members"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(unique=True)
    club_id: Mapped[str] = mapped_column(ForeignKey("clubs.id"))
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=True)

    role: Mapped["Role"] = relationship(back_populates="members")
    club: Mapped["Club"] = relationship(back_populates="members")

