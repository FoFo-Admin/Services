import React, { useContext, useState, useRef, useEffect } from "react";
import { Context } from "../main";

import { Link } from "react-router-dom";

import {observer} from 'mobx-react-lite'

import QRCode from "react-qr-code";

import AuthService from "../services/AuthService";
import { AUTH_URL } from "../services/AuthService";

const UserPage = () => {
    const {store} = useContext(Context)

    const fileInputRef = useRef(null);
        
    const handleFileInputClick = () => {
        if (fileInputRef.current) {
        fileInputRef.current.click();
        }
    };

    const [profile, setProfile] = useState({});
    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const [qrUrl, setQrUrl] = useState('');

    const [showError, setShowError] = useState(false)
    const [error, setError] = useState('')


    useEffect(() => {
        AuthService.get_my_profile()
            .then((data) => {
                setProfile(data.data); 
                setName(data.data.profile.name)
                setImageUrl(`${AUTH_URL}profile/${data.data.profile.id}/image/${Date.now()}`)

                AuthService.get_qr()
                .then((qr_data) => {
                    if(qr_data.data) {
                        setQrUrl(`${window.location.origin}/qr/${store.user.id}/${qr_data.data.code}`)
                    }
                })
            })
        }, [])


    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        const formData = new FormData();
        formData.append("image", file);

        await AuthService.upload_photo(formData);

        setImageUrl(`${AUTH_URL}profile/${profile.profile.id}/image/${Date.now()}`)
    }

    const deleteImage = async () => {
        await AuthService.delete_photo();

        setImageUrl(`${AUTH_URL}profile/${profile.profile.id}/image/${Date.now()}`)
    }

    const changeProfile = async () => {
        setShowError(false)

        AuthService.edit_my_profile(name).then((data) => {
            setProfile(data.data); 
            setName(data.data?.profile.name)
        })
        .catch((e) => {
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
        });
    }

    const generateQr = async () => {
        AuthService.get_qr()
        .then((qr_data) => {
            if(qr_data.data) {
                setQrUrl(`${window.location.origin}/qr/${store.user.id}/${qr_data.data.code}`)
            }
        })
    }

    return (
        <div className="container py-5">
        <div className="row g-4">

            {showError && (
                <div className="error-message">
                    {error}
                </div>)}

            <div className="col-md-6 d-flex flex-column align-items-center">
                <div className="profile-image-container mb-4">
                    <img src={imageUrl} alt="Profile" className="profile-image"/>
                    <button onClick={handleFileInputClick} className="edit-image-btn btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" className="bi bi-camera" viewBox="0 0 16 16">
                            <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"/>
                            <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                        </svg>
                    </button>
                    <button onClick={deleteImage} className="delete-image-btn btn">
                        X
                    </button>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />

                <div className="w-100 max-width-400">
                    <div className="mb-3">
                        <label htmlFor="userName" className="form-label text-muted">Name</label>
                        <input type="text" id="userName" className="form-control" onChange={e => setName(e.target.value)} value={name}/>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="userEmail" className="form-label text-muted">Email</label>
                        <input type="email" id="userEmail" className="form-control" value={store.user.email} readOnly/>
                    </div>
                    {profile.isClub &&
                    <div className="w-100 max-width-400">
                        <div className="mb-3">
                            <label htmlFor="userClub" className="form-label text-muted">Club</label>
                            <input type="text" id="userClub" className="form-control" readOnly value={profile.club}/>
                        </div>
                    </div>}
                </div>

                <div className="d-flex gap-2">
                    <button className="btn btn-primary d-flex align-items-center gap-2" onClick={changeProfile}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                        </svg>
                        Save Profile
                    </button>
                </div>
            </div>

            {profile.isClub &&
            <div className="col-md-6 d-flex flex-column align-items-center">
                <div className="qr-container mb-4">
                    <a href={`${qrUrl}`} target="_blank">
                        <QRCode
                            size={256}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            value={qrUrl}
                            viewBox={`0 0 256 256`}
                        />
                    </a>
                </div>

                <div className="d-flex gap-2">
                    <button className="btn btn-primary d-flex align-items-center gap-2" onClick={generateQr}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                        </svg>
                        Regenerate QR
                    </button>
                </div>
            </div>}
        </div>
    </div>
    )
}

export default observer(UserPage)