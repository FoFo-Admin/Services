import React, { useContext, useState, useEffect } from "react";
import { Context } from "../main";

import { useNavigate } from "react-router-dom";

import {observer} from 'mobx-react-lite'

const RegisterForm = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [code, setCode] = useState('')
    const {store} = useContext(Context)

    const [showError, setShowError] = useState(false)
    const [error, setError] = useState('')

    const [showCode, setShowCode] = useState(false)

    const prevent = event => {
        event.preventDefault();
    }

    useEffect(() => {
        if(store.isAuth) {
            navigate(`/`);
        }
    }, [store.isAuth, navigate])


    return (
        <div className="container">
        <div className="register-container">
            
            <h2 className="form-title">Create Account</h2>

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
                {showCode && (
                <div className="mb-4">
                    <label htmlFor="verificationCode" className="form-label">6-Digit Verification Code</label>
                    <input type="text" 
                           className="form-control" 
                           id="verificationCode" 
                           pattern="[0-9]{6}" 
                           maxLength="6" 
                           required
                           onChange={e => setCode(e.target.value)} value={code}
                           placeholder="Enter 6-digit code" />
                </div>
                )}
                {!showCode && (
                <button className="btn btn-pink w-100" onClick={() => store.registration(email, password, setError, setShowError, setShowCode)}>Register</button>)}
                {showCode && (
                <button className="btn btn-pink w-100" onClick={() => store.activation(code, setError, setShowError)}>Activate</button>)}
            </form>
        </div>
    </div>
    )
}

export default observer(RegisterForm)

