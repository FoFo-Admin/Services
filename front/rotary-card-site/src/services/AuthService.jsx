import api from "../http";

export const AUTH_URL = "http://localhost:8000/"

export default class AuthService {
    static async login(email, password) {
        return api.post(AUTH_URL+'login/', {email, password})
    }

    static async registration(email, password) {
        return api.post(AUTH_URL+'registration/', {email, password})
    }

    static async activation(code) {
        return api.post(AUTH_URL+'activate/', {code})
    }

    static async logout() {
        return api.post(AUTH_URL+'logout/')
    }

    static async get_me() {
        return api.get(AUTH_URL+'userme/')
    }

    static async get_qr() {
        return api.get(AUTH_URL+'qr/')
    }

    static async check_qr(user_id, qr) {
        return api.post(AUTH_URL+`qr/${user_id}/${qr}`)
    }

    static async get_my_profile() {
        return api.get(AUTH_URL+'profile/')
    }

    static async get_some_profile(id) {
        return api.get(AUTH_URL+`profile/${id}`)
    }

    static async edit_my_profile(name) {
        return api.patch(AUTH_URL+'profile/', {name})
    }

    static async upload_photo(formData) {
        return api.post(AUTH_URL+`profile/image`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            }})
    }

    static async delete_photo() {
        return api.delete(AUTH_URL+`profile/image`);
    }
}