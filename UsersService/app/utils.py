from datetime import  datetime, timedelta
from email.message import EmailMessage
import ssl
import smtplib

import jwt
import bcrypt
from fastapi import HTTPException, status
from jwt import InvalidTokenError
from sqlalchemy.orm import Session

from app import models, views
from settings import settings
from app.schemas import User

import glob
import os
import imghdr

from fastapi import UploadFile


def read_file(path: str):
    with open(path, mode='r') as f:
        return f.read()


def encode_jwt(payload: dict,
               key_path: str = settings.private_key,
               algorithm: str = settings.algorithm,
               expire_min: int = settings.access_token_life_min):
    to_encode = payload.copy()
    now = datetime.utcnow()
    to_encode.update(
        exp=now + timedelta(minutes=expire_min),
        iat=now
    )
    key = read_file(key_path)
    encoded = jwt.encode(to_encode, key, algorithm)
    return encoded


def decode_jwt(token: str | bytes,
               key_path: str = settings.public_key,
               algorithm: str = settings.algorithm):
    key = read_file(key_path)
    decoded = jwt.decode(token, key, [algorithm])
    return decoded


def create_token(user: User, type_str: str) -> str:
    jwt_payload = {
        "sub": user.email,
        "type": type_str
    }
    expire = settings.access_token_life_min if type_str == "access" else \
        settings.refresh_token_life_day*24*60 if type_str == "refresh" else 0
    return encode_jwt(jwt_payload, expire_min=expire)


def hash_password(password: str) -> bytes:
    salt = bcrypt.gensalt()
    pwd_bytes: bytes = password.encode()
    return bcrypt.hashpw(pwd_bytes, salt)


def validate_password(password: str, hashed_password: bytes) -> bool:
    return bcrypt.checkpw(password.encode(), hashed_password)


def get_user_by_token(
        token: str,
        session: Session,
        token_type: str) -> models.User:

    exp = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Prohibited"
    )

    try:
        payload = decode_jwt(token)
    except InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Prohibited token {e}"
        )

    if payload.get("type") != token_type:
        raise exp

    user = views.get_user_by_email(session, payload.get("sub"))

    if user is None:
        raise exp
    return user


def send_mail(to: str, code: str):
    subject = "Активація акаунту у програмі Ротарійська карта"
    body = f"Ваш одноразовий код активації - {code}"

    em = EmailMessage()
    em["From"] = settings.mail_name
    em["To"] = to
    em["Subject"] = subject
    em.set_content(body)

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(settings.mail_server, 465, context=context) as smtp:
        smtp.login(settings.mail_name, settings.mail_password)
        smtp.sendmail(settings.mail_name, to, em.as_string())


ALLOWED_FORMATS = {"jpeg", "jpg", "png"}

async def save_image(folder: str, file: UploadFile, item_id: str) -> None:
    contents = await file.read()
    image_type = imghdr.what(None, h=contents)

    if not image_type or image_type.lower() not in ALLOWED_FORMATS:
        raise ValueError("Unsupported filetype")

    delete_image(folder, item_id)

    os.makedirs(folder, exist_ok=True)

    extension = os.path.splitext(file.filename)[1]
    destination = os.path.join('.', folder, f"{item_id}{extension}")

    with open(destination, "wb") as out:
        out.write(contents)


def delete_image(folder: str, item_id: str) -> None:
    pattern = os.path.join('.', folder, f"{item_id}.*")
    for file_path in glob.glob(pattern):
        if os.path.exists(file_path):
            os.remove(file_path)


def get_image_path(folder: str, item_id: str) -> str:
    pattern = os.path.join('.', folder, f"{item_id}.*")
    for file_path in glob.glob(pattern):
        if os.path.exists(file_path):
            return file_path