import React, { useState, useEffect } from "react";

import { useParams } from "react-router-dom";

import {observer} from 'mobx-react-lite'

import AuthService from "../services/AuthService";
import { AUTH_URL } from "../services/AuthService";

const SomebodyPage = () => {
    
    const {id} = useParams();

    const [profile, setProfile] = useState({});
    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        AuthService.get_some_profile(id)
            .then((data) => {
                setProfile(data.data); 
                setName(data.data.profile.name)
                setImageUrl(`${AUTH_URL}profile/${data.data.profile.id}/image/${Date.now()}`)
            })
        }, [])

    return (
        <div className="container py-5">
        <div className="row g-4">

            <div className="col-md-6 d-flex flex-column align-items-center">
                <div className="profile-image-container mb-4">
                    <img src={imageUrl} alt="Profile" className="profile-image"/>
                </div>

                <div className="w-100 max-width-400">
                    <div className="mb-3">
                        <label htmlFor="userName" className="form-label text-muted">Name</label>
                        <input type="text" id="userName" className="form-control" readOnly value={name}/>
                    </div>
                </div>

                {profile.isClub &&
                <div className="w-100 max-width-400">
                    <div className="mb-3">
                        <label htmlFor="userClub" className="form-label text-muted">Club</label>
                        <input type="text" id="userClub" className="form-control" readOnly value={profile.club}/>
                    </div>
                </div>}
            </div>
        </div>
    </div>
    )
}

export default observer(SomebodyPage)