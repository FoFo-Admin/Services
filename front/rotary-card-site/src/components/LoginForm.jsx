import React, { useContext, useState, useEffect } from "react";
import { Context } from "../main";

import { useNavigate } from "react-router-dom";

import {observer} from 'mobx-react-lite'

const LoginForm = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const {store} = useContext(Context)

    const [showError, setShowError] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if(store.isAuth) {
            navigate(`/`);
        }
    }, [store.isAuth, navigate])

    const prevent = event => {
        event.preventDefault();
    }

    return (
        <div className="container">
        <div className="register-container">
            
            <h2 className="form-title">Login</h2>

            {showError && (
            <div className="error-message">
                {error}
            </div>)}
 
            <form onSubmit={prevent}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" className="form-control" id="email" onChange={e => setEmail(e.target.value)} value={email} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" className="form-control" id="password" onChange={e => setPassword(e.target.value)} value={password} required />
                </div>
                <button className="btn btn-pink w-100" onClick={() => store.login(email, password, setError, setShowError)}>Login</button>

            </form>
        </div>
    </div>
    )
}

export default observer(LoginForm)