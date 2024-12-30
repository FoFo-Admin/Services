import api from "../http";

export const CLUB_URL = "http://localhost:8001/"

export default class ClubService {
    
    static async create_club(name, city_id, type_id) {
        return api.post(CLUB_URL+'clubs/', {name, city_id, type_id})
    }

    static async delete_club(id) {
        return api.delete(CLUB_URL+`clubs/${id}`);
    }

    static async update_club(id, name, city_id, type_id) {
        return api.patch(CLUB_URL+`clubs/${id}`, {name, city_id, type_id})
    }

    static async add_inv(id, number) {
        return api.patch(CLUB_URL+`clubs/${id}/inv?inv=${number}`);
    }

    static async get_members(id) {
        return api.get(CLUB_URL+`clubs/${id}/members`);
    }

    static async get_member(id, email) {
        return api.get(CLUB_URL+`clubs/${id}/members/${email}`);
    }

    static async add_member(id, email, role_id) {
        return api.post(CLUB_URL+`clubs/${id}/members?email=${email}${role_id ? `&role_id=${role_id}` : ''}`);
    }

    static async edit_member(id, member_id, role_id) {
        return api.patch(CLUB_URL+`clubs/${id}/members?member_id=${member_id}${role_id ? `&role_id=${role_id}` : ''}`);
    }

    static async delete_member(id, email) {
        return api.delete(CLUB_URL+`clubs/${id}/members?email=${email}`);
    }

    static async upload_logo(id, formData) {
        return api.post(CLUB_URL+`clubs/${id}/logo`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            }})
    }

    static async delete_logo(id) {
        return api.delete(CLUB_URL+`clubs/${id}/logo`);
    }


    static async get_clubs() {
        return api.get(CLUB_URL+`clubs/`)
    }

    static async get_club(id) {
        return api.get(CLUB_URL+`clubs/${id}`)
    }

    static async get_my_club() {
        return api.get(CLUB_URL+`clubs/my`)
    }

    static async get_info(info) {
        return api.get(CLUB_URL+`info/${info}`)
    }

    static async get_info_by_id(info, id) {
        return api.get(CLUB_URL+`info/${info}/${id}`)
    }

    static async create_info(info, name) {
        return api.post(CLUB_URL+`info/${info}?info_name=${name}`)
    }

    static async update_info(info, name, id) {
        return api.patch(CLUB_URL+`info/${info}?info_name=${name}&info_id=${id}`)
    }

    static async delete_info(info, id) {
        return api.delete(CLUB_URL+`info/${info}?info_id=${id}`)
    }
}