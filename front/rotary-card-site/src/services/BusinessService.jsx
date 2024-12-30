import api from "../http";

export const BUSINESS_URL = "http://localhost:8002/"

export default class BusinessService {
    
    static async create_business(name, city_id, category_id, owner_email) {
        return api.post(BUSINESS_URL+'businesses/', {name, city_id, category_id, owner_email})
    }

    static async delete_business(id) {
        return api.delete(BUSINESS_URL+`businesses/${id}`);
    }

    static async update_business(id, name, city_id, category_id, owner_email, address, description, isPublic) {
        return api.patch(BUSINESS_URL+`businesses/${id}`, 
            {name, city_id, category_id, owner_email, address, description, isPublic})
    }

    static async get_products(id) {
        return api.get(BUSINESS_URL+`businesses/${id}/products/`);
    }

    static async get_product(id, product_id) {
        return api.get(BUSINESS_URL+`businesses/${id}/products/${product_id}/`);
    }

    static async add_product(id, name, description, price, discount) {
        return api.post(BUSINESS_URL+`businesses/${id}/products/`, {name, description, price, discount});
    }

    static async edit_product(id, product_id, name, description, price, discount) {
        return api.patch(BUSINESS_URL+`businesses/${id}/products/${product_id}/`, {name, description, price, discount});
    }

    static async delete_product(id, product_id) {
        return api.delete(BUSINESS_URL+`businesses/${id}/products/${product_id}/`);
    }

    static async upload_product_image(id, product_id, formData) {
        return api.post(BUSINESS_URL+`businesses/${id}/products/${product_id}/image`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            }})
    }

    static async delete_product_image(id, product_id) {
        return api.delete(BUSINESS_URL+`businesses/${id}/products/${product_id}/image`);
    }


    static async get_contacts(id) {
        return api.get(BUSINESS_URL+`businesses/${id}/contacts/`);
    }

    static async get_contact(id, contact_id) {
        return api.get(BUSINESS_URL+`businesses/${id}/contacts/${contact_id}/`);
    }

    static async add_contact(id, value, type_id) {
        return api.post(BUSINESS_URL+`businesses/${id}/contacts/?value=${value}&type_id=${type_id}`);
    }

    static async edit_contact(id, contact_id, value, type_id) {
        return api.patch(BUSINESS_URL+`businesses/${id}/contacts/${contact_id}/?value=${value}&type_id=${type_id}`);
    }

    static async delete_contact(id, contact_id) {
        return api.delete(BUSINESS_URL+`businesses/${id}/contacts/${contact_id}/`);
    }


    static async upload_image(id, type, formData) {
        return api.post(BUSINESS_URL+`businesses/${id}/image/${type}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            }})
    }

    static async delete_image(id, type) {
        return api.delete(BUSINESS_URL+`businesses/${id}/image/${type}`);
    }

    static async get_is_owner() {
        return api.get(BUSINESS_URL+`owner/`)
    }

    static async get_businesses() {
        return api.get(BUSINESS_URL+`businesses/`)
    }

    static async get_businesses_all() {
        return api.get(BUSINESS_URL+`businesses/all`)
    }

    static async get_businesses_my() {
        return api.get(BUSINESS_URL+`businesses/my`)
    }

    static async get_business(id) {
        return api.get(BUSINESS_URL+`businesses/${id}`)
    }

    static async get_business_all(id) {
        return api.get(BUSINESS_URL+`businesses/${id}/all`)
    }

    // static async get_club(id) {
    //     return api.get(CLUB_URL+`clubs/${id}`)
    // }

    // static async get_my_club() {
    //     return api.get(CLUB_URL+`clubs/my`)
    // }

    static async get_info(info) {
        return api.get(BUSINESS_URL+`info/${info}`)
    }

    static async get_info_by_id(info, id) {
        return api.get(BUSINESS_URL+`info/${info}/${id}`)
    }

    static async create_info(info, name) {
        return api.post(BUSINESS_URL+`info/${info}?info_name=${name}`)
    }

    static async update_info(info, name, id) {
        return api.patch(BUSINESS_URL+`info/${info}?info_name=${name}&info_id=${id}`)
    }

    static async delete_info(info, id) {
        return api.delete(BUSINESS_URL+`info/${info}?info_id=${id}`)
    }
}