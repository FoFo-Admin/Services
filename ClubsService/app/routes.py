from fastapi import APIRouter, Depends, status, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import EmailStr
from sqlalchemy.orm import Session

from app import broker, db_helper, models, schemas, utils
from app.broker import rabbitAsync
from app.data_handlers import InfoHandler, ClubHandler

router = APIRouter(tags=["Clubs"])

http_bearer = HTTPBearer()

types = {
    "city": models.City,
    "role": models.Role,
    "type": models.Type
}

wrong_type_error = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Unknown info type"
)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(http_bearer)):
    token = credentials.credentials
    ans = await broker.rabbitAsync.check_token_message(token, "access")
    if ans == 0 or ans is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is invalid"
        )
    return ans


def get_active_user(user = Depends(get_current_user)) :
    if user['isActivated']:
        return user
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not activated"
        )


def get_admin_user(user = Depends(get_active_user)):
    if user['isAdmin']:
        return user
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not admin"
        )


def get_admin_or_club_user(club_id: str,
                           user = Depends(get_active_user),
                           session:Session=Depends(db_helper.get_session)):
    if user['isAdmin']:
        return user
    else:
        member = ClubHandler.getClubMember(session, user['email'], club_id)
        if member:
            return user

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="User is not member of club"
    )

def get_admin_or_club_admin_user(club_id: str,
                                 user = Depends(get_active_user),
                                 session:Session=Depends(db_helper.get_session)):
    if user['isAdmin']:
        return user
    else:
        member = ClubHandler.getClubMember(session, user['email'], club_id)
        if member:
            if member.role:
                return user

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="User is not admin of club"
    )



@router.get("/info/{info_type}", status_code=status.HTTP_200_OK)
def get_info(info_type: str,
             session:Session=Depends(db_helper.get_session)):

    if info_type not in types.keys():
        raise wrong_type_error

    return InfoHandler.read_all(session, types[info_type])


@router.get("/info/{info_type}/{info_id}", status_code=status.HTTP_200_OK)
def get_info_by_id(info_type: str,
                   info_id: int,
             session:Session=Depends(db_helper.get_session)):

    if info_type not in types.keys():
        raise wrong_type_error

    return InfoHandler.read_by_id(session, types[info_type], info_id)


@router.post("/info/{info_type}", status_code=status.HTTP_201_CREATED)
def create_info(info_type: str,
                info_name: str,
                _ = Depends(get_admin_user),
                session:Session=Depends(db_helper.get_session)):

    if info_type not in types.keys():
        raise wrong_type_error

    try:
        return InfoHandler.create(session, types[info_type], info_name)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{info_name} already exists in {info_type}"
        )

@router.patch("/info/{info_type}", status_code=status.HTTP_201_CREATED)
def edit_info(info_type: str,
              info_name: str,
              info_id: int,
              _ = Depends(get_admin_user),
              session:Session=Depends(db_helper.get_session)):

    if info_type not in types.keys():
        raise wrong_type_error

    try:
        return InfoHandler.update(session, types[info_type], info_name, info_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{info_name} already exists in {info_type}"
        )

@router.delete("/info/{info_type}", status_code=status.HTTP_204_NO_CONTENT)
def delete_info(info_type: str,
                info_id: int,
                _ = Depends(get_admin_user),
                session:Session=Depends(db_helper.get_session)):

    if info_type not in types.keys():
        raise wrong_type_error

    try:
        return InfoHandler.delete(session, types[info_type], info_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unexpected error"
        )


@router.get("/clubs/", status_code=status.HTTP_200_OK)
def get_clubs(_ = Depends(get_admin_user),
                session:Session=Depends(db_helper.get_session)):
    clubs = ClubHandler.read_all(session)
    response_obj = []
    if clubs:
        for club in clubs:
            response_obj.append({
                "id": club.id,
                "name": club.name,
                "city": getattr(club.city, "name", None),
                "type": getattr(club.type, "name", None)
            })
    return response_obj


@router.get("/clubs/my", status_code=status.HTTP_200_OK)
def get_clubs(user = Depends(get_active_user),
                session:Session=Depends(db_helper.get_session)):
    myclub = ClubHandler.read_my_club(session, user["email"])

    if myclub:
        return myclub.id
    else:
        return None


@router.get("/clubs/{club_id}", status_code=status.HTTP_200_OK)
def get_club(club_id: str,
                user = Depends(get_admin_or_club_user),
                session:Session=Depends(db_helper.get_session)):
    club = ClubHandler.read_by_id(session, club_id)
    response_obj = {}
    if club:
        isAdmin = False
        member = ClubHandler.getClubMember(session, user['email'], club_id)
        if member:
            if member.role:
                isAdmin = True

        response_obj = {
            "id": club.id,
            "name": club.name,
            "city": getattr(club.city, "name", None),
            "type": getattr(club.type, "name", None),
            "invitations": club.invitations,
            "isAdmin": user["isAdmin"],
            "isRole": isAdmin or user["isAdmin"]
        }
    return response_obj


@router.post("/clubs/", status_code=status.HTTP_201_CREATED)
def create_club(club: schemas.ClubBase,
                    _ = Depends(get_admin_user),
                    session:Session=Depends(db_helper.get_session)):
    try:
        return ClubHandler.create(session, club)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to create new club: {e}"
        )

@router.patch("/clubs/{club_id}/inv", status_code=status.HTTP_201_CREATED)
def add_invitations(club_id: str,
                    inv: int,
                    _ = Depends(get_admin_user),
                    session:Session=Depends(db_helper.get_session)):
    try:
        return ClubHandler.change_invitations(session, True, inv, club_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to add new invitations: {e}"
        )

@router.patch("/clubs/{club_id}", status_code=status.HTTP_201_CREATED)
def update_club(club_id: str,
                    updated_club: schemas.ClubBase,
                    _=Depends(get_admin_or_club_admin_user),
                    session: Session = Depends(db_helper.get_session)):
    try:
        return ClubHandler.update(session, updated_club, club_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to update club {e}"
        )


@router.delete("/clubs/{club_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_club(club_id: str,
               _ = Depends(get_admin_user),
               session:Session=Depends(db_helper.get_session)):
    try:
        return ClubHandler.delete(session, club_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to delete club: {e}"
        )


@router.get("/clubs/{club_id}/members", status_code=status.HTTP_200_OK)
async def get_members(club_id: str,
               _ = Depends(get_admin_or_club_user),
               session:Session=Depends(db_helper.get_session)):

    members = ClubHandler.getMembers(session, club_id)
    response_obj = []
    if members:
        for member in members:
            response_obj.append({
                "id": member.id,
                "email": member.email,
                "role": getattr(member.role, "name", None)
            })

    answer = await rabbitAsync.get_profiles_message(response_obj)
    if answer == 0:
        return []
    else:
        return answer


@router.get("/clubs/{club_id}/members/{email}", status_code=status.HTTP_200_OK)
async def get_member(club_id: str,
               email: str,
               _ = Depends(get_admin_or_club_user),
               session:Session=Depends(db_helper.get_session)):

    member = ClubHandler.getClubMember(session, email, club_id)

    if member:
        return member
    else:
        return None


@router.post("/clubs/{club_id}/members", status_code=status.HTTP_201_CREATED)
def add_member(club_id: str,
               email: EmailStr,
               role_id: int | None = None,
               _ = Depends(get_admin_or_club_admin_user),
               session:Session=Depends(db_helper.get_session)):
    try:
        return ClubHandler.createMember(session, email, role_id, club_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to add new member: {e}"
        )

@router.patch("/clubs/{club_id}/members", status_code=status.HTTP_204_NO_CONTENT)
def edit_member(club_id: str,
                member_id: int,
                role_id: int | None = None,
                  _=Depends(get_admin_or_club_admin_user),
                  session: Session = Depends(db_helper.get_session)):
    try:
        return ClubHandler.editMember(session, member_id, role_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to edit member: {e}"
        )

@router.delete("/clubs/{club_id}/members", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(club_id: str,
               email: EmailStr,
               _ = Depends(get_admin_or_club_admin_user),
               session:Session=Depends(db_helper.get_session)):
    try:
        return ClubHandler.deleteMember(session, email, club_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to delete member: {e}"
        )



@router.get("/clubs/{club_id}/logo/{time}", status_code=status.HTTP_200_OK)
async def get_logo(club_id: str,
                   time: str | None = None,
                    session: Session = Depends(db_helper.get_session)):
    try:
        club = ClubHandler.read_by_id(session, club_id)
        if club:
            if club.isPhotoAdded:
                return FileResponse(utils.get_image_path("logos", club_id))
            else:
                return FileResponse(utils.get_image_path("logos", "default"))
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to get logo {e}"
        )

@router.post("/clubs/{club_id}/logo", status_code=status.HTTP_201_CREATED)
async def set_logo(club_id: str,
                    image: UploadFile = File,
                    _=Depends(get_admin_or_club_admin_user),
                    session: Session = Depends(db_helper.get_session)):
    try:
        club = ClubHandler.read_by_id(session, club_id)
        if club:
            await utils.save_image("logos", image, club_id)
            return ClubHandler.updateImage(session,True, club_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to save logo {e}"
        )

@router.delete("/clubs/{club_id}/logo", status_code=status.HTTP_204_NO_CONTENT)
async def delete_logo(club_id: str,
                    _=Depends(get_admin_or_club_admin_user),
                    session: Session = Depends(db_helper.get_session)):
    try:
        club = ClubHandler.read_by_id(session, club_id)
        if club:
            utils.delete_image("logos", club_id)
            ClubHandler.updateImage(session, False, club_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to delete logo {e}"
        )



