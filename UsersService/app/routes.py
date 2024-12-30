from fastapi import APIRouter, status, Depends, HTTPException, Response, Cookie, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import InvalidTokenError

import json

from sqlalchemy.orm import Session

from app.broker import rabbitAsync
from app.schemas import User, RegisterUser, Token, LoginForm, ActivationForm, ProfileSchema
from app import db_helper, utils, controllers, views, models

router = APIRouter(tags=["User"])

http_bearer = HTTPBearer()


def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(http_bearer),
        session:Session=Depends(db_helper.get_session)
) -> models.User:

    token = credentials.credentials
    return utils.get_user_by_token(token, session, "access")


def get_active_user(
        user: models.User = Depends(get_current_user),
) -> models.User:

    if user.isActivated:
        return user
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not activated"
        )



@router.post("/registration/", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(user: RegisterUser,
                  response: Response,
                  session:Session=Depends(db_helper.get_session)):
    user.password = utils.hash_password(user.password)
    try:
        try_user = views.get_user_by_email(session, user.email)

        if try_user:
            if not try_user.isActivated:
                created = controllers.update_user_password(session, try_user.id, user.password)
                code = controllers.generate_code(session, created.id)
            else:
                raise Exception
        else:
            created = controllers.create_user(session, user)
            code = controllers.generate_code(session, created.id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email used by another user"
        )
    try:
        utils.send_mail(created.email, code.code)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email was not sended"
        )
    token = Token(
        access_token=utils.create_token(created, "access"),
        refresh_token=utils.create_token(created, "refresh")
    )
    response.set_cookie("refresh", token.refresh_token, httponly=True)
    controllers.save_session(session, created.id, token.refresh_token)
    return token


@router.post('/activate/', status_code=status.HTTP_200_OK)
def activate_user(
        activation_form: ActivationForm,
        user: models.User = Depends(get_current_user),
        session: Session=Depends(db_helper.get_session)):

    if user.isActivated:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already activated"
        )
    else:
        activations = views.get_activations_by_user_id(session, user.id)
        if activation_form.code in activations:
            user = controllers.activate_user(session, user.id)
            controllers.delete_codes(session, user.id)

            return user
        else:
            raise HTTPException(
                status_code=status.HTTP_406_NOT_ACCEPTABLE,
                detail="Wrong code or code lifetime is ended"
            )


@router.post('/login/')
def login_user(
    response: Response,
    login_form: LoginForm,
    session: Session=Depends(db_helper.get_session)
):
    exp = HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Prohibited"
    )

    user = views.get_user_by_email(session, login_form.email)
    if user is None:
        raise exp

    if not utils.validate_password(login_form.password, user.password) or not user.isActivated:
        raise exp

    token = Token(
        access_token=utils.create_token(user, "access"),
        refresh_token=utils.create_token(user, "refresh")
    )
    response.set_cookie("refresh", token.refresh_token, httponly=True)
    controllers.save_session(session, user.id, token.refresh_token)
    return token


@router.post('/logout/')
def logout_user(
    response: Response,
    refresh: str | None = Cookie(None),
    _: models.User = Depends(get_active_user),
    session: Session=Depends(db_helper.get_session)
):
    controllers.delete_session(session, refresh)

    response.delete_cookie("refresh", httponly=True)
    return True

@router.post('/refresh/', response_model=Token)
def refresh_jwt(
        response: Response,
        refresh: str | None = Cookie(None),
        session: Session=Depends(db_helper.get_session)):

    exp = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Prohibited"
    )

    user = utils.get_user_by_token(refresh, session, "refresh")
    users_sessions = views.get_sessions_by_user_id(session, user.id)

    if refresh not in users_sessions:
        raise exp

    controllers.delete_session(session, refresh)

    token = Token(
        access_token=utils.create_token(user, "access"),
        refresh_token=utils.create_token(user, "refresh")
    )
    response.set_cookie("refresh", token.refresh_token, httponly=True)
    controllers.save_session(session, user.id, token.refresh_token)
    return token

@router.get('/userme/')
def get_me(
    user: models.User = Depends(get_active_user)
):
    return {
        "id": user.id,
        "email": user.email,
        "isAdmin": user.isAdmin,
        "isActivated": user.isActivated
    }


@router.get('/qr/', status_code=status.HTTP_200_OK)
async def get_qr(
        user: models.User = Depends(get_active_user),
        session: Session = Depends(db_helper.get_session)):
    result = await rabbitAsync.check_club_user_message(user.email)
    if result:
        if result["answer"]:
            return controllers.generate_qr(session, user.id)
    else:
        return None


@router.post('/qr/{user_id}/{qr}', status_code=status.HTTP_200_OK)
def check_qr(
        user_id: str,
        qr: str,
        session: Session = Depends(db_helper.get_session)):
    user = views.get_user(session, user_id)
    if user:
        qrs = views.get_qr_by_user_id(session, user.id)
        if qr in qrs:
            controllers.delete_qrs(session, user.id)
            return {
                "userid": user.id,
                "result": True
            }
        return {
            "userid": user.id,
            "result": False
        }
    return {
        "result": False
    }


@router.get('/profile/')
async def get_my_profile(
    user: models.User = Depends(get_active_user),
    session: Session=Depends(db_helper.get_session)
):
    result = await rabbitAsync.check_club_user_message(user.email)

    profile = views.get_profile(session, user.id)
    if not profile:
        profile = controllers.create_profile(session, user)
    if result:
        if result["answer"]:
            return {
                "isClub": result["answer"],
                "club": result["club"],
                "profile": profile
            }
    return {
        "isClub": False,
        "profile": profile
    }


@router.patch('/profile/')
async def edit_my_profile(
    profile: ProfileSchema,
    user: models.User = Depends(get_active_user),
    session: Session=Depends(db_helper.get_session)
):
    try:
        profile_edited = controllers.edit_profile(session, user.id, profile)

        result = await rabbitAsync.check_club_user_message(user.email)

        if result:
            if result["answer"]:
                return {
                    "isClub": result["answer"],
                    "club": result["club"],
                    "profile": profile_edited
                }
        return {
            "isClub": False,
            "profile": profile_edited
        }
    except Exception as e:
        raise  HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unexpected error"
    )

@router.get("/profile/{profile_id}/image/{time}", status_code=status.HTTP_200_OK)
async def get_image(profile_id: str,
                   time: str | None = None,
                   session: Session = Depends(db_helper.get_session)):
    try:
        profile = views.get_profile(session, profile_id)
        if profile:
            if profile.isPhotoAdded:
                return FileResponse(utils.get_image_path("images", profile_id))
        return FileResponse(utils.get_image_path("images", "default"))
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to get image {e}"
        )

@router.post("/profile/image", status_code=status.HTTP_201_CREATED)
async def set_image(image: UploadFile = File,
                    user: models.User = Depends(get_active_user),
                    session: Session = Depends(db_helper.get_session)):
    try:
        profile = views.get_profile(session, user.id)
        if profile:
            await utils.save_image("images", image, user.id)
            return controllers.profile_add_image(session,user.id, True)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to save image {e}"
        )

@router.delete("/profile/image", status_code=status.HTTP_204_NO_CONTENT)
async def delete_image(user: models.User = Depends(get_active_user),
                       session: Session = Depends(db_helper.get_session)):
    try:
        profile = views.get_profile(session, user.id)
        if profile:
            utils.delete_image("images", user.id)
            return controllers.profile_add_image(session,user.id, False)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to delete image {e}"
        )




@router.get('/profile/{user_id}')
async def get_profile(
    user_id: str,
    _: models.User = Depends(get_active_user),
    session: Session=Depends(db_helper.get_session)
):
    user = views.get_user(session, user_id)
    if user:
        profile = views.get_profile(session, user.id)

        result = await rabbitAsync.check_club_user_message(user.email)

        if not profile:
            profile = controllers.create_profile(session, user)
        if result:
            if result["answer"]:
                return {
                    "isClub": result["answer"],
                    "club": result["club"],
                    "profile": profile
                }
        return {
            "isClub": False,
            "profile": profile
        }
    return None



@router.get('/test/')
def test_get(session:Session=Depends(db_helper.get_session)):
    #return views.test_get(session)
    return views.get_sessions_by_user_id(session, '1')