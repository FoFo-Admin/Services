import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent
env_path = f"{BASE_DIR}/.env"

if os.path.exists(env_path):
    load_dotenv(env_path)

class Settings(BaseSettings):
    host: str = os.getenv("HOST")
    port: int = os.getenv("PORT")
    connection_string: str = os.getenv("CONNECTION_STRING")
    private_key: str = os.getenv("PRIVATE_KEY")
    public_key: str = os.getenv("PUBLUC_KEY")
    algorithm: str = os.getenv("ALGORITHM")
    access_token_life_min: int = os.getenv("ACCESS_TOKEN_LIFE_MIN")
    refresh_token_life_day: int = os.getenv("REFRESH_TOKEN_LIFE_DAY")
    mail_name: str = os.getenv("MAIL_NAME")
    mail_password: str = os.getenv("MAIL_PASSWORD")
    mail_server: str = os.getenv("MAIL_SERVER")
    mq_host: str = os.getenv("MQ_HOST")
    mq_port: int = os.getenv("MQ_PORT")
    admin_email: str = os.getenv("ADMIN_EMAIL")
    front: str = os.getenv("FRONT")

settings = Settings()