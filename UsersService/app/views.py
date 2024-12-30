from datetime import datetime, timedelta
from typing import List

from sqlalchemy import select, and_
from sqlalchemy.engine import Result
from sqlalchemy.orm import Session

from app.models import User, UserSession, Activation, Profile, Qr
from settings import settings


def get_users(session: Session, skip: int = 0, limit: int = 100) -> List[User]:
    query = select(User).order_by(User.id).offset(skip).limit(limit)
    response: Result = session.execute(query)
    result = response.scalars().all()
    return list(result)


def get_user(session: Session, user_id: str) -> User | None:
    return session.get(User, user_id)

def get_profile(session: Session, user_id: str) -> Profile | None:
    return session.get(Profile, user_id)

def get_user_by_email(session: Session, user_email: str) -> User | None :
    query = select(User).where(User.email == user_email)
    response: Result = session.execute(query)
    result = response.scalar_one_or_none()
    return result


def get_sessions_by_user_id(session: Session, user_id: str) -> List[UserSession] | None :
    query = (select(UserSession.refresh_token)
             .where(and_(UserSession.user_id == user_id,
                    (UserSession.created_at + timedelta(minutes=settings.refresh_token_life_day*24*60)) > datetime.utcnow())
                    )
             )
    response: Result = session.execute(query)
    result = response.scalars().all()
    return list(result)


def get_activations_by_user_id(session: Session, user_id: str) -> List[Activation] | None :
    query = (select(Activation.code)
             .where(and_(Activation.user_id == user_id,
                    (Activation.created_at + timedelta(minutes=3)) > datetime.utcnow())
                    )
             )
    response: Result = session.execute(query)
    result = response.scalars().all()
    return list(result)


def get_qr_by_user_id(session: Session, user_id: str) -> List[Qr] | None :
    query = (select(Qr.code)
             .where(and_(Qr.user_id == user_id,
                    (Qr.created_at + timedelta(minutes=3)) > datetime.utcnow())
                    )
             )
    response: Result = session.execute(query)
    result = response.scalars().all()
    return list(result)


def test_get(session: Session):
    query = (select(Activation)
             .where(Activation.created_at > (datetime.utcnow()-timedelta(minutes=100000)))
             .order_by(Activation.created_at.desc()))
    response: Result = session.execute(query)
    result = response.scalars().all()
    return list(result)