import {makeAutoObservable} from 'mobx'
import AuthService from '../services/AuthService';
import {AUTH_URL} from '../services/AuthService';
import axios from 'axios';

export default class Store {
    user = {};
    isAuth = false;
    isLoading = true;

    constructor() {
        makeAutoObservable(this);
    }

    setAuth(bool) {
        this.isAuth = bool;
    }

    setUser(user) {
        this.user = user;
    }

    setLoading(bool) {
        this.isLoading = bool;
    }

    async login(email, password, setError, setShowError) {
        try {
            setShowError(false)

             const response = await AuthService.login(email, password);
             localStorage.setItem('token', response.data.access_token);
             const user_response = await AuthService.get_me();
             this.setAuth(true);
             this.setUser(user_response.data)
        } catch (e) {
            setShowError(true)
            if(e.response?.data?.detail && !Array.isArray(e.response?.data?.detail)){
                setError(e.response?.data?.detail)
            }
            else if(e.response?.data?.detail){
                let errorString = ''
                e.response?.data?.detail.forEach(error => {
                    errorString+=error.msg+'.'
                });
                setError(errorString)
            }
            else {
                console.log(e.response?.data)
                setError('Something went wrong')
            }
        }
    }

    async registration(email, password, setError, setShowError, setShowCode) {
        try {
             setShowError(false)
             const response = await AuthService.registration(email, password);
             localStorage.setItem('token', response.data.access_token);
             setShowCode(true)
        } catch (e) {
            setShowError(true)
            if(e.response?.data?.detail && !Array.isArray(e.response?.data?.detail)){
                setError(e.response?.data?.detail)
            }
            else if(e.response?.data?.detail){
                let errorString = ''
                e.response?.data?.detail.forEach(error => {
                    errorString+=error.msg+'.'
                });
                setError(errorString)
            }
            else {
                console.log(e.response?.data)
                setError('Something went wrong')
            }
        }
    }

    async activation(code, setError, setShowError) {
        try {
             setShowError(false)
             const response = await AuthService.activation(code);
             this.setAuth(true);
             this.setUser(response.data)
        } catch (e) {
            setShowError(true)
            if(e.response?.data?.detail && !Array.isArray(e.response?.data?.detail)){
                setError(e.response?.data?.detail)
            }
            else if(e.response?.data?.detail){
                let errorString = ''
                e.response?.data?.detail.forEach(error => {
                    errorString+=error.msg+'.'
                });
                setError(errorString)
            }
            else {
                console.log(e.response?.data)
                setError('Something went wrong')
            }
        }
    }

    async logout(email, password) {
        try {
             const response = await AuthService.logout(email, password);
             localStorage.removeItem('token');
             this.setAuth(false);
             this.setUser({})
        } catch (e) {
            console.log(e.response?.data?.message)
        }
    }


    async checkAuth() {
        this.setLoading(true)
        try {
            const response = await axios.post(`${AUTH_URL}refresh/`, {}, {withCredentials: true})

            localStorage.setItem('token', response.data.access_token);
            const user_response = await AuthService.get_me();
            this.setAuth(true);
            this.setUser(user_response.data)
        }
        catch (e) {
            console.log(e.response?.data?.message)
        }
        finally {
            this.setLoading(false)
        }
    }
}