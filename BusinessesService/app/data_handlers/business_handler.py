import uuid

from sqlalchemy.orm import Session
from sqlalchemy import select, delete, Result
from typing import List

from app.models import Business, Type, City, Category, Product, Contact
from app import schemas, utils
from app.data_handlers import InfoHandler


class BusinessHandler:
    @staticmethod
    def checkInfoExistance(session: Session, info: str, info_id: int) -> bool:
        if info == "type":
            info_obj = InfoHandler.read_by_id(session, Type, info_id)
        elif info == "city":
            info_obj = InfoHandler.read_by_id(session, City, info_id)
        elif info == "category":
            info_obj = InfoHandler.read_by_id(session, Category, info_id)

        if info_obj:
            return True
        return False

    @staticmethod
    def read_all_by_filter(session: Session, city_id: int = None, category_id: int = None,
                           partTitle: str = None, public: bool = True, ownerEmail: str | None = None) -> List[Business]:
        query = select(Business).where()

        if ownerEmail is not None:
            query = query.where(Business.owner_email == ownerEmail)
        if public:
            query = query.where(Business.isPublic == True)
        if city_id is not None:
            query = query.where(Business.city_id == city_id)
        if category_id is not None:
            query = query.where(Business.category_id == category_id)

        if partTitle:
            query = query.where(Business.name.like(f"{partTitle}%"))

        return list(session.scalars(query).all())

    @staticmethod
    def read_by_id(session: Session,  business_id: str) -> Business | None:
        return session.get(Business, business_id)

    @staticmethod
    def create(session: Session, business: schemas.BusinessBase) -> Business:
        if not BusinessHandler.checkInfoExistance(session, "category", business.category_id):
            raise ValueError("No such business category")

        if not BusinessHandler.checkInfoExistance(session, "city", business.city_id):
            raise ValueError("No such city")

        business = Business(id=uuid.uuid4(), **business.model_dump())
        session.add(business)
        session.commit()

        return business

    @staticmethod
    def update(session: Session, updated_business: schemas.BusinessUpdate, business_id: str) -> Business | None:
        if not BusinessHandler.checkInfoExistance(session, "category", updated_business.category_id):
            raise ValueError("No such business category")

        if not BusinessHandler.checkInfoExistance(session, "city", updated_business.city_id):
            raise ValueError("No such city")

        business = session.get(Business, business_id)

        if business:
            business.name = updated_business.name
            business.description = updated_business.description
            business.address = updated_business.address
            business.city_id = updated_business.city_id
            business.category_id = updated_business.category_id
            business.isPublic = updated_business.isPublic
            business.owner_email = updated_business.owner_email

            session.commit()

        return business

    @staticmethod
    def updateImage(session: Session, image_type: str, added: bool, business_id: str) -> Business | None:
        business = session.get(Business, business_id)

        if business:
            if image_type == "logo":
                business.isLogoAdded = added
            elif image_type == "image":
                business.isPhotoAdded = added

            session.commit()

        return business

    @staticmethod
    def delete(session: Session, business_id: str) -> None:
        business = BusinessHandler.read_by_id(session, business_id)
        if business:
            utils.delete_image("logo", business_id)
            utils.delete_image("image", business_id)

            for product in business.products:
                utils.delete_image("products-image", product.id)

        session.query(Product).filter(Product.business_id == business_id).delete()
        session.query(Contact).filter(Contact.business_id == business_id).delete()

        session.query(Business).filter(Business.id == business_id).delete()

        session.commit()





    @staticmethod
    def getProducts(session: Session, business_id: str) -> List[Product] | None:
        business = BusinessHandler.read_by_id(session, business_id)

        if business:
            return business.products

        return None

    @staticmethod
    def getProduct(session: Session, product_id: str) -> Product | None:
        query = select(Product).filter(Product.id == product_id)
        response: Result = session.execute(query)
        result = response.scalar_one_or_none()

        return result

    @staticmethod
    def createProduct(session: Session, product: schemas.ProductSchema, business_id: str) -> Product | None:
        # if not ClubHandler.checkInfoExistance(session, "role", role):
        #     raise ValueError("No such contact type")

        business = session.get(Business, business_id)

        if business:
            try:
                product_new = Product(id=uuid.uuid4(), business_id=business_id, **product.model_dump())
                session.add(product_new)
                session.commit()
            except Exception as e:
                raise ValueError("Unexpected error")

            return product_new

        return None

    @staticmethod
    def editProduct(session: Session, product: schemas.ProductSchema, product_id: str) -> Product | None:

        product_edit = session.get(Product, product_id)

        if product:
            product_edit.name = product.name
            product_edit.description = product.description
            product_edit.price = product.price
            product_edit.discount = product.discount
            session.commit()

        return product_edit

    @staticmethod
    def updateProductImage(session: Session, added: bool, product_id: str) -> Product | None:
        product =session.get(Product, product_id)

        if product:
            product.isPhotoAdded = added

            session.commit()

        return product

    @staticmethod
    def deleteProduct(session: Session, product_id: str) -> None:

        utils.delete_image("products-image", product_id)
        session.query(Product).filter(Product.id == product_id).delete()

        session.commit()







    @staticmethod
    def getContacts(session: Session, business_id: str) -> List[Contact] | None:
        business = BusinessHandler.read_by_id(session, business_id)

        if business:
            return business.contacts

        return None

    @staticmethod
    def getContact(session: Session, contact_id: str) -> Contact | None:
        query = select(Contact).filter(Contact.id == contact_id)
        response: Result = session.execute(query)
        result = response.scalar_one_or_none()

        return result

    @staticmethod
    def createContact(session: Session, value: str, type_id: int, business_id: str) -> Contact | None:
        if not BusinessHandler.checkInfoExistance(session, "type", type_id):
            raise ValueError("No such contact type")

        business = session.get(Business, business_id)

        if business:
            try:
                contact = Contact(id=uuid.uuid4(), business_id=business_id, type_id=type_id, value=value)
                session.add(contact)
                session.commit()
            except Exception as e:
                raise ValueError("Unexpected error")

            return contact

        return None

    @staticmethod
    def editContact(session: Session, value: str, type_id: int, contact_id: str) -> Contact | None:
        if not BusinessHandler.checkInfoExistance(session, "type", type_id):
            raise ValueError("No such contact type")

        contact = session.get(Contact, contact_id)

        if contact:
            contact.type_id = type_id
            contact.value = value
            session.commit()

        return contact

    @staticmethod
    def deleteContact(session: Session, contact_id: str) -> None:

        session.query(Contact).filter(Contact.id == contact_id).delete()

        session.commit()

