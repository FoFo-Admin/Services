import React, { useContext, useState, useEffect } from "react";
import { Context } from "../main";

import {observer} from 'mobx-react-lite'

import { useNavigate, Route, Routes, Navigate } from "react-router-dom";

import AdminHeader from "./AdminComponents/AdminHeader";
import UserInfo from "./UserInfo";
import ClubsList from "./AdminComponents/Clubs";

import api from "../http";
import AddClub from "./AdminComponents/AddClub";
import Info from "./AdminComponents/Info";
import AddInfo from "./AdminComponents/AddInfo";
import AddBusiness from "./BusinessComponents/AddBusiness";


const AdminPanel = () => {
    const navigate = useNavigate();

    const {store} = useContext(Context)

    useEffect(() => {
        if(!store.isLoading) {
            if(!store.user.isAdmin) {
                navigate(`/`);
            }
            // else
            //     api.get('http://localhost:8000/userme').then(data => {console.log(data)})
        }
    }, [store.isLoading, store.user, navigate])
 

    return (
        <div className="container mt-4">
            <AdminHeader />

            <Routes>
                <Route path='/' element={<ClubsList/>}/>
                <Route path='/clubs' element={<ClubsList/>}/>
                <Route path='/clubs/new' element={<AddClub/>}/>
                <Route path='/business/new' element={<AddBusiness/>}/>
                <Route path='/info/:service/:type' element={<Info/>}/>
                <Route path='/info/:service/:type/add' element={<AddInfo/>}/>
                <Route path='/info/:service/:type/:id' element={<AddInfo/>}/>
                <Route path="*" element={<ClubsList/>} />
            </Routes>

        </div>
    )
}

export default observer(AdminPanel)