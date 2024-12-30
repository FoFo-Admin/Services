from datetime import datetime
from email.policy import default
from typing import List

from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    __abstract__ = True


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(unique=True)
    password: Mapped[bytes]
    isActivated: Mapped[bool] = mapped_column(default=False)
    isAdmin: Mapped[bool] = mapped_column(default=False)

    profile: Mapped["Profile"] = relationship(back_populates="user")
    activation: Mapped["Activation"] = relationship(back_populates="user")
    qr_code: Mapped["Qr"] = relationship(back_populates="user")
    sessions: Mapped[List["UserSession"]] = relationship(back_populates="user")


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(ForeignKey("users.id"), primary_key=True)
    name: Mapped[str]
    birth_date: Mapped[datetime]
    isPhotoAdded: Mapped[bool] = mapped_column(default=False)

    user: Mapped["User"] = relationship(back_populates="profile")


class Activation(Base):
    __tablename__ = "activations"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), primary_key=True)
    code: Mapped[str] = mapped_column(primary_key=True)
    created_at: Mapped[datetime]

    user: Mapped["User"] = relationship(back_populates="activation")


class Qr(Base):
    __tablename__ = "qr"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), primary_key=True)
    code: Mapped[str] = mapped_column(primary_key=True)
    created_at: Mapped[datetime]

    user: Mapped["User"] = relationship(back_populates="qr_code")


class UserSession(Base):
    __tablename__ = "sessions"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), primary_key=True)
    refresh_token: Mapped[str] = mapped_column(primary_key=True)
    created_at: Mapped[datetime]

    user: Mapped["User"] = relationship(back_populates="sessions")