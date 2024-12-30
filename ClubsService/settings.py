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
    mq_host: str = os.getenv("MQ_HOST")
    mq_port: int = os.getenv("MQ_PORT")
    front: str = os.getenv("FRONT")

settings = Settings()