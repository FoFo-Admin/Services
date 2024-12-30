from fastapi import APIRouter, Depends, status, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app import broker, db_helper, models, schemas, utils
from app.data_handlers import InfoHandler
from app.data_handlers.business_handler import BusinessHandler

router = APIRouter(tags=["Businesses"])

http_bearer = HTTPBearer()


types = {
    "city": models.City,
    "category": models.Category,
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
            status_code=status.HTTP_403_FORBIDDEN,
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

def get_admin_or_owner_user(business_id: str,
                            user = Depends(get_active_user),
                            session:Session=Depends(db_helper.get_session)):
    if user['isAdmin']:
        return user
    else:
        business = BusinessHandler.read_by_id(session, business_id)
        if business:
            if business.owner_email == user['email']:
                return user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not owner"
        )


def get_admin_or_owner_user_any(user = Depends(get_active_user),
                            session:Session=Depends(db_helper.get_session)):
    if user['isAdmin']:
        return user
    else:
        businesses = BusinessHandler.read_all_by_filter(session, public=False)
        if businesses:
            for business in businesses:
                if business.owner_email == user['email']:
                    return user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not any owner"
        )

@router.post("/test/")
async def pika_test(token: str, token_type: str):
    ans = await broker.rabbitAsync.check_token_message(token, token_type)
    return {
        'token': token,
        'type': token_type,
        'answer': ans
    }



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


@router.get("/owner", status_code=status.HTTP_200_OK)
async def get_is_user_owner(
        credentials: HTTPAuthorizationCredentials = Depends(http_bearer),
        session:Session=Depends(db_helper.get_session)):
    token = credentials.credentials
    ans = await broker.rabbitAsync.check_token_message(token, "access")

    if not(ans == 0 or ans is None):
        if ans['isActivated']:
            businesses = BusinessHandler.read_all_by_filter(session, public=False)
            if businesses:
                for business in businesses:
                    if business.owner_email == ans['email']:
                        return {
                            "isOwner": True
                        }

    return {
        "isOwner": False
    }


@router.get("/businesses/all", status_code=status.HTTP_200_OK)
def get_businesses(city_id: int | None = None,
              category_id : int | None = None,
              part_title: str| None = None,
              _ = Depends(get_admin_user),
              session:Session=Depends(db_helper.get_session)):
    businesses = BusinessHandler.read_all_by_filter(session, city_id, category_id, part_title, False)
    response_obj = []
    if businesses:
        for business in businesses:
            response_obj.append({
                "id": business.id,
                "name": business.name,
                "address": business.address,
                "isPublic": business.isPublic,
                "city": getattr(business.city, "name", None),
                "category": getattr(business.category, "name", None)
            })
    return response_obj


@router.get("/businesses/my", status_code=status.HTTP_200_OK)
def get_businesses(city_id: int | None = None,
              category_id : int | None = None,
              part_title: str| None = None,
              user = Depends(get_admin_or_owner_user_any),
              session:Session=Depends(db_helper.get_session)):
    businesses = BusinessHandler.read_all_by_filter(session, city_id, category_id, part_title, False, user["email"])
    response_obj = []
    if businesses:
        for business in businesses:
            response_obj.append({
                "id": business.id,
                "name": business.name,
                "address": business.address,
                "isPublic": business.isPublic,
                "city": getattr(business.city, "name", None),
                "category": getattr(business.category, "name", None)
            })
    return response_obj


@router.get("/businesses/", status_code=status.HTTP_200_OK)
def get_businesses(city_id: int | None = None,
              category_id : int | None = None,
              part_title: str| None = None,
              session:Session=Depends(db_helper.get_session)):
    businesses = BusinessHandler.read_all_by_filter(session, city_id, category_id, part_title, True)
    response_obj = []
    if businesses:
        for business in businesses:
            response_obj.append({
                "id": business.id,
                "name": business.name,
                "address": business.address,
                "isPublic": business.isPublic,
                "city": getattr(business.city, "name", None),
                "category": getattr(business.category, "name", None)
            })
    return response_obj


@router.get("/businesses/{business_id}", status_code=status.HTTP_200_OK)
async def get_businesses(business_id: str,
              session:Session=Depends(db_helper.get_session),
              credentials: HTTPAuthorizationCredentials = Depends(http_bearer)):

    business = BusinessHandler.read_by_id(session, business_id)
    is_access = False

    userEmail = ""
    token = credentials.credentials
    ans = await broker.rabbitAsync.check_token_message(token, "access")
    if not(ans == 0 or ans is None):
        userEmail = ans['email']
        is_access = ans['isActivated'] and (ans['isAdmin'] or business.owner_email == ans['email'])

    if not business.isPublic and not is_access:
        raise PermissionError("Business is private")
    response_obj = {}
    if business:
        response_obj = {
            "id": business.id,
            "name": business.name,
            "address": business.address,
            "description": business.description,
            "isPublic": business.isPublic,
            "city": getattr(business.city, "name", None),
            "category": getattr(business.category, "name", None),
            "isOwner": (userEmail == business.owner_email)
            }
    return response_obj

@router.get("/businesses/{business_id}/all", status_code=status.HTTP_200_OK)
def get_businesses(business_id: str,
              _ = Depends(get_admin_or_owner_user),
              session:Session=Depends(db_helper.get_session)):
    business = BusinessHandler.read_by_id(session, business_id)
    return business


@router.post("/businesses/", status_code=status.HTTP_201_CREATED)
def create_business(business: schemas.BusinessBase,
                    _ = Depends(get_admin_user),
                    session:Session=Depends(db_helper.get_session)):
    try:
        return BusinessHandler.create(session, business)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to create new business {e}"
        )

@router.patch("/businesses/{business_id}", status_code=status.HTTP_201_CREATED)
def update_business(business_id: str,
                    updated_business: schemas.BusinessUpdate,
                    _=Depends(get_admin_or_owner_user),
                    session: Session = Depends(db_helper.get_session)):

    try:
        return BusinessHandler.update(session, updated_business, business_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to update business {e}"
        )


@router.delete("/businesses/{business_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_business(business_id: str,
                    _=Depends(get_admin_user),
                    session: Session = Depends(db_helper.get_session)):
    try:
        return BusinessHandler.delete(session, business_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to delete business {e}"
        )


@router.get("/businesses/{business_id}/image/{image_type}/{time}", status_code=status.HTTP_200_OK)
async def get_logo_business(business_id: str,
                            image_type: str,
                            time: str | None = None,
                    session: Session = Depends(db_helper.get_session)):
    try:
        business = BusinessHandler.read_by_id(session, business_id)
        if business:
            if image_type not in {"image", "logo"}:
                raise ValueError("Unknown image type")

            if image_type == "image":
                if not business.isPhotoAdded:
                    return FileResponse(utils.get_image_path(image_type, "default"))
            elif image_type == "logo":
                if not business.isLogoAdded:
                    return FileResponse(utils.get_image_path(image_type, "default"))

            return FileResponse(utils.get_image_path(image_type, business_id))
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to get image {e}"
        )


@router.post("/businesses/{business_id}/image/{image_type}", status_code=status.HTTP_201_CREATED)
async def set_logo_business(business_id: str,
                            image_type: str,
                    image: UploadFile = File,
                    _=Depends(get_admin_or_owner_user),
                    session: Session = Depends(db_helper.get_session)):
    try:
        business = BusinessHandler.read_by_id(session, business_id)
        if business:
            if image_type not in {"image", "logo"}:
                raise ValueError("Unknown image type")
            await utils.save_image(image_type, image, business_id)
            return BusinessHandler.updateImage(session, image_type, True, business_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to save logo {e}"
        )


@router.delete("/businesses/{business_id}/image/{image_type}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_logo_business(business_id: str,
                               image_type: str,
                    _=Depends(get_admin_or_owner_user),
                    session: Session = Depends(db_helper.get_session)):
    try:
        business = BusinessHandler.read_by_id(session, business_id)
        if business:
            if image_type not in {"image", "logo"}:
                raise ValueError("Unknown image type")
            utils.delete_image(image_type, business_id)
            return BusinessHandler.updateImage(session, image_type, False, business_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to delete logo {e}"
        )




@router.get("/businesses/{business_id}/products/", status_code=status.HTTP_200_OK)
async def get_products(business_id: str,
               session:Session=Depends(db_helper.get_session)):

    products = BusinessHandler.getProducts(session, business_id)

    return products


@router.get("/businesses/{business_id}/products/{product_id}/", status_code=status.HTTP_200_OK)
async def get_product(business_id: str,
               product_id: str,
               _ = Depends(get_admin_or_owner_user),
               session:Session=Depends(db_helper.get_session)):

    return BusinessHandler.getProduct(session, product_id)



@router.post("/businesses/{business_id}/products/", status_code=status.HTTP_201_CREATED)
def add_product(business_id: str,
               product: schemas.ProductSchema,
               _ = Depends(get_admin_or_owner_user),
               session:Session=Depends(db_helper.get_session)):
    try:
        return BusinessHandler.createProduct(session, product, business_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to add new product: {e}"
        )

@router.patch("/businesses/{business_id}/products/{product_id}/", status_code=status.HTTP_201_CREATED)
def edit_product(business_id: str,
                 product_id: str,
                 product: schemas.ProductSchema,
                  _=Depends(get_admin_or_owner_user),
                  session: Session = Depends(db_helper.get_session)):
    try:
        return BusinessHandler.editProduct(session, product, product_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to edit product: {e}"
        )

@router.delete("/businesses/{business_id}/products/{product_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(business_id: str,
                   product_id: str,
               _ = Depends(get_admin_or_owner_user),
               session:Session=Depends(db_helper.get_session)):
    try:
        return BusinessHandler.deleteProduct(session, product_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to delete product: {e}"
        )

@router.get("/businesses/{business_id}/products/{product_id}/image/{time}", status_code=status.HTTP_200_OK)
async def get_logo_product(business_id: str,
                            product_id: str,
                            time: str | None = None,
                    session: Session = Depends(db_helper.get_session)):
    try:
        product = BusinessHandler.getProduct(session, product_id)
        if product:
            if not product.isPhotoAdded:
                return FileResponse(utils.get_image_path("products-image", "default"))

            return FileResponse(utils.get_image_path("products-image", product_id))
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to get image {e}"
        )


@router.post("/businesses/{business_id}/products/{product_id}/image", status_code=status.HTTP_201_CREATED)
async def set_logo_product(business_id: str,
                            product_id: str,
                    image: UploadFile = File,
                    _=Depends(get_admin_or_owner_user),
                    session: Session = Depends(db_helper.get_session)):
    try:
        product = BusinessHandler.getProduct(session, product_id)
        if product:
            await utils.save_image("products-image", image, product_id)
            return BusinessHandler.updateProductImage(session, True, product_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to save logo {e}"
        )


@router.delete("/businesses/{business_id}/products/{product_id}/image", status_code=status.HTTP_204_NO_CONTENT)
async def delete_logo_product(business_id: str,
                              product_id: str,
                    _=Depends(get_admin_or_owner_user),
                    session: Session = Depends(db_helper.get_session)):
    try:
        product = BusinessHandler.getProduct(session, product_id)
        if product:
            utils.delete_image("products-image", product_id)
            return BusinessHandler.updateProductImage(session,False, product_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to delete logo {e}"
        )





@router.get("/businesses/{business_id}/contacts/", status_code=status.HTTP_200_OK)
async def get_contacts(business_id: str,
               session:Session=Depends(db_helper.get_session)):

    contacts = BusinessHandler.getContacts(session, business_id)

    response_obj = []
    if contacts:
        for contact in contacts:
            response_obj.append({
                "id": contact.id,
                "value": contact.value,
                "type": getattr(contact.type, "name", None)
            })

    return response_obj


@router.get("/businesses/{business_id}/contacts/{contact_id}/", status_code=status.HTTP_200_OK)
async def get_contact(business_id: str,
               contact_id: str,
               _ = Depends(get_admin_or_owner_user),
               session:Session=Depends(db_helper.get_session)):

    return BusinessHandler.getContact(session, contact_id)



@router.post("/businesses/{business_id}/contacts/", status_code=status.HTTP_201_CREATED)
def add_contact(business_id: str,
               value: str,
               type_id: int,
               _ = Depends(get_admin_or_owner_user),
               session:Session=Depends(db_helper.get_session)):
    try:
        return BusinessHandler.createContact(session, value, type_id, business_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to add new contact: {e}"
        )

@router.patch("/businesses/{business_id}/contacts/{contact_id}/", status_code=status.HTTP_201_CREATED)
def edit_contact(business_id: str,
                 contact_id: str,
                 value: str,
                 type_id: int,
                  _=Depends(get_admin_or_owner_user),
                  session: Session = Depends(db_helper.get_session)):
    try:
        return BusinessHandler.editContact(session, value, type_id, contact_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to edit contact: {e}"
        )

@router.delete("/businesses/{business_id}/contacts/{contact_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(business_id: str,
                   contact_id: str,
               _ = Depends(get_admin_or_owner_user),
               session:Session=Depends(db_helper.get_session)):
    try:
        return BusinessHandler.deleteContact(session, contact_id)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to delete contact: {e}"
        )