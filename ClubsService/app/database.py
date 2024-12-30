from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from settings import settings

class DatabaseHelper:
    def __init__(self):
        self.engine = create_engine(settings.connection_string)
        self.session_factory = sessionmaker(
            bind = self.engine,
            autoflush=False,
            autocommit=False,
            expire_on_commit=False
        )
    def get_session(self) -> Session:
        with self.session_factory() as session:
            yield session
            session.close()

db_helper = DatabaseHelper()