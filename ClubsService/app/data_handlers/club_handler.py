import uuid

from sqlalchemy.orm import Session
from sqlalchemy import select, delete, Result, and_
from typing import List

from app.data_handlers import InfoHandler
from app.models import Club, Type, City, Role, Member
from app import schemas, utils


class ClubHandler:
    @staticmethod
    def checkInfoExistance(session: Session, info: str, info_id: int) -> bool:
        if info == "type":
            info_obj = InfoHandler.read_by_id(session, Type, info_id)
        elif info == "city":
            info_obj = InfoHandler.read_by_id(session, City, info_id)
        elif info == "role":
            info_obj = InfoHandler.read_by_id(session, Role, info_id)

        if info_obj:
            return True
        return False

    @staticmethod
    def read_all(session: Session) -> List[Club]:
        query = select(Club)
        response: Result = session.execute(query)
        result = response.scalars().all()
        return list(result)

    @staticmethod
    def read_by_id(session: Session,  club_id: str) -> Club | None:
        return session.get(Club, club_id)

    @staticmethod
    def read_my_club(session: Session, email: str) -> Club | None:
        query = select(Member).filter(Member.email == email)
        response: Result = session.execute(query)
        result: Member | None = response.scalar_one_or_none()

        if result:
            return result.club


    @staticmethod
    def create(session: Session, club_schema: schemas.ClubBase) -> Club:
        if not ClubHandler.checkInfoExistance(session, "type", club_schema.type_id):
            raise ValueError("No such club type")

        if not ClubHandler.checkInfoExistance(session, "city", club_schema.city_id):
            raise ValueError("No such city")

        club = Club(id=uuid.uuid4(), **club_schema.model_dump())
        session.add(club)
        session.commit()

        return club

    @staticmethod
    def update(session: Session, updated_club: schemas.ClubBase, club_id: str) -> Club | None:
        if not ClubHandler.checkInfoExistance(session, "type", updated_club.type_id):
            raise ValueError("No such club type")

        if not ClubHandler.checkInfoExistance(session, "city", updated_club.city_id):
            raise ValueError("No such city")

        club = session.get(Club, club_id)

        if club:
            club.name = updated_club.name
            club.city_id = updated_club.city_id
            club.type_id = updated_club.type_id

            session.commit()

        return club

    @staticmethod
    def delete(session: Session, club_id: str) -> None:
        club = ClubHandler.read_by_id(session, club_id)
        if club:
            utils.delete_image("logos", club_id)

        session.query(Member).filter(Member.club_id == club_id).delete()
        session.query(Club).filter(Club.id == club_id).delete()

        session.commit()


    @staticmethod
    def change_invitations(session: Session, add: bool, inv: int,  club_id: str) -> Club | None:
        club = session.get(Club, club_id)

        if club:
            if add:
                club.invitations += inv
            else:
                club.invitations -= inv

            session.commit()

        return club


    @staticmethod
    def updateImage(session: Session, added: bool, club_id: str) -> Club | None:
        club = session.get(Club, club_id)

        if club:
            club.isPhotoAdded = added
            session.commit()

        return club


    @staticmethod
    def getMembers(session: Session, club_id: str) -> List[Member] | None:
        club = session.get(Club, club_id)

        if club:
            return club.members

        return None


    @staticmethod
    def getClubMember(session: Session, email:str, club_id: str) -> Member | None:

        query = select(Member).filter(and_(Member.club_id == club_id, Member.email == email))
        response: Result = session.execute(query)
        result = response.scalar_one_or_none()
        return result


    @staticmethod
    def getMember(session: Session, email: str) -> Member | None:

        query = select(Member).filter(Member.email == email)
        response: Result = session.execute(query)
        result = response.scalar_one_or_none()
        return result


    @staticmethod
    def createMember(session: Session, email: str, role: int | None, club_id: str) -> Member | None:
        if role:
            if not ClubHandler.checkInfoExistance(session, "role", role):
                raise ValueError("No such role type")

        club = session.get(Club, club_id)

        if club:
            if club.invitations - 1 < 0:
                raise ValueError("No more invitations available")
            try:
                member = Member(email = email, role_id = role, club_id = club.id)
                session.add(member)
                session.commit()
            except Exception as e:
                raise ValueError("Such user already member")

            ClubHandler.change_invitations(session, False, 1, club_id)

            return member

        return None

    @staticmethod
    def editMember(session: Session, member_id: int, role: int | None) -> Member | None:
        if role:
            if not ClubHandler.checkInfoExistance(session, "role", role):
                raise ValueError("No such role type")

        member = session.get(Member, member_id)

        if member:
            member.role_id = role
            session.commit()

        return member


    @staticmethod
    def deleteMember(session: Session, email: str, club_id: str) -> None:

        query = select(Member).where(Member.email == email)
        response: Result = session.execute(query)
        result = response.scalar_one_or_none()

        if result:
            if result.club.id == club_id:
                session.query(Member).filter(Member.email == email).delete()
                session.commit()