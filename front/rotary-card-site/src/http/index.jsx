import axios from 'axios';

const AUTH_URL_COPY = "http://localhost:8000/"

const api = axios.create({
    withCredentials: true
})

api.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
    return config;
})

api.interceptors.response.use((config) => {
    return config
}, async (error) => {
    const originalRequest = error.config
    if(error?.response.status == 401 && error.config && !error.config._isRetry) {
        originalRequest._isRetry = true;
        try {
            const response = await axios.post(`${AUTH_URL_COPY}refresh/`, {}, {withCredentials: true})
            localStorage.setItem('token', response.data.access_token);
            return api.request(originalRequest)
        }
        catch (e) {
            window.location.href= `/`;
        }
    }
    else if(error?.response.status == 403) {
        window.location.href= `/prohibited`;
    }
    throw error;
})

export default api;