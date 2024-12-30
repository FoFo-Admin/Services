from sqlalchemy.orm import Session
from sqlalchemy import select, delete, Result
from typing import List

from app.models import Help


class InfoHandler:
    @staticmethod
    def read_all(session: Session, subclass: Help) -> List:
        query = select(subclass).order_by(subclass.name)
        response: Result = session.execute(query)
        result = response.scalars().all()
        return list(result)

    @staticmethod
    def read_by_id(session: Session, subclass: Help, subclass_id: int):
        return session.get(subclass, subclass_id)

    @staticmethod
    def create(session: Session, subclass: Help, name: str):
        obj = subclass(name = name)
        session.add(obj)
        session.commit()

        return obj

    @staticmethod
    def update(session: Session, subclass: Help, name: str, obj_id: int):
        obj = session.get(subclass, obj_id)

        if obj:
            obj.name = name
            session.commit()

        return obj

    @staticmethod
    def delete(session: Session, subclass: Help, obj_id: int):
        obj = session.get(subclass, obj_id)

        session.delete(obj)
        session.commit()