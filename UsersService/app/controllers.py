import random
import time
from datetime import datetime
from uuid import uuid4

from sqlalchemy.orm import Session

from app import views
from app.models import User, Activation, UserSession, Profile, Qr
from app.schemas import RegisterUser, ProfileSchema


def create_user(session: Session, user_in: RegisterUser) -> User:
    user = User(id=str(uuid4()), **user_in.model_dump())
    session.add(user)
    session.commit()

    return user

def update_user_password(session: Session, user_id: str, user_password: bytes) -> User:
    user = views.get_user(session, user_id)

    if user:
        user.password = user_password
        session.commit()

    return user


def create_profile(session: Session, user: User) -> Profile:
    profile = Profile(id = user.id, name = str.split(user.email, '@')[0], birth_date=datetime.utcnow())
    session.add(profile)
    session.commit()

    return profile


def edit_profile(session: Session, user_id: str, new_profile: ProfileSchema) -> Profile | None:
    profile = views.get_profile(session, user_id)

    if profile:
        profile.name = new_profile.name

        session.commit()

    return profile


def profile_add_image(session: Session, user_id: str, image: bool) -> Profile | None:
    profile = views.get_profile(session, user_id)

    if profile:
        profile.isPhotoAdded = image

        session.commit()

    return profile



def activate_user(session: Session, user_id: str) -> User:
    user = views.get_user(session, user_id)

    if user:
        user.isActivated = True
        session.commit()

        create_profile(session, user)

    return user


def set_user_admin(session: Session, user_email: str) -> User:
    user = views.get_user_by_email(session, user_email)

    if user:
        user.isAdmin = True
        session.commit()

    return user


def generate_code(session: Session, user_id: str) -> Activation:
    activation = Activation(
        user_id = user_id,
        code = f"{random.randint(0, 999999):06d}",
        created_at = datetime.utcnow()
    )
    delete_codes(session, user_id)
    delete_sessions(session, user_id)
    session.add(activation)
    session.commit()

    return activation


def generate_qr(session: Session, user_id: str) -> Qr:
    qr = Qr(
        user_id = user_id,
        code = str(uuid4()),
        created_at = datetime.utcnow()
    )
    delete_qrs(session, user_id)
    session.add(qr)
    session.commit()

    return qr


def delete_codes(session: Session, user_id: str) -> None:
    session.query(Activation).where(Activation.user_id == user_id).delete()
    session.commit()


def delete_qrs(session: Session, user_id: str) -> None:
    session.query(Qr).where(Qr.user_id == user_id).delete()
    session.commit()


def delete_sessions(session: Session, user_id: str) -> None:
    session.query(UserSession).where(UserSession.user_id == user_id).delete()
    session.commit()


def delete_session(session: Session, refresh_token: str) -> None:
    session.query(UserSession).filter(UserSession.refresh_token == refresh_token).delete()
    session.commit()


def save_session(session: Session, user_id: str, refresh_token: str) -> UserSession:
    user_session = UserSession(
        user_id = user_id,
        refresh_token = refresh_token,
        created_at = datetime.utcnow()
    )
    session.add(user_session)
    session.commit()

    return user_session

