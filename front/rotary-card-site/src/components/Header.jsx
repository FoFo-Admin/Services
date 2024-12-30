import React, { useContext, useState } from "react";
import { Context } from "../main";

import { Link } from "react-router-dom";

import {observer} from 'mobx-react-lite'

const Header = () => {
    const {store} = useContext(Context)

    return (
    <nav className="navbar navbar-expand-lg navbar-custom">
        <div className="container">
            <Link className="navbar-brand" to="/">
                <img src="/api/placeholder/40/40" alt="Logo" width="40" height="40" />
            </Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarContent">
                <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                    {store.isAuth && 
                    <li className="nav-item">
                        <Link className="nav-link" to="/me">Profile</Link>
                    </li> }
                    {store.isAuth && 
                    <li className="nav-item">
                        <Link className="nav-link" to="/club">My Club</Link>
                    </li>}
                    
                    <li className="nav-item">
                        <Link className="nav-link" to="/business">Businesses</Link>
                    </li>
                    {store?.user.isAdmin && (<li className="nav-item">
                        <Link className="nav-link" to="/admin">Admin Panel</Link>
                    </li>)}
                    
                </ul>
                {store.isAuth 
                ? (
                    <div className="d-flex align-items-center">
                        <p className="nav-link mb-0 me-3">{store?.user.email}</p>
                        <button className="btn btn-outline-light" onClick={()=>store.logout()}>Logout</button>
                    </div>
                ) 
                : (<div className="d-flex">
                        <Link to="/login" className="btn btn-outline-light me-2 login-reg-btn">Login</Link>
                        <Link to="/registration" className="btn btn-outline-light login-reg-btn">Register</Link>
                    </div>) }

            </div>
        </div>
    </nav>
    )
}

export default observer(Header)