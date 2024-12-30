import React, { useContext, useState, useEffect, useRef  } from "react";
import { Context } from "../main";

import {observer} from 'mobx-react-lite'

import { useNavigate, Route, Routes, Link, useParams   } from "react-router-dom";

import api from "../http";

import ClubService from "../services/ClubService";
import { CLUB_URL } from "../services/ClubService";
import { AUTH_URL } from "../services/AuthService";

const Club = () => {

    const fileInputRef = useRef(null);

    const navigate = useNavigate();
        
    const handleFileInputClick = () => {
        if (fileInputRef.current) {
        fileInputRef.current.click();
        }
    };
      

    let { id } = useParams();

    const [club, setClub] = useState({});
    const [members, setMembers] = useState([]);
    const [logoUrl, setLogoUrl] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);

    const [selectedDelete, setSelectedDelete] = useState('');
    const [confirmMemberDelete, setConfirmMemberDelete] = useState(false);
    
    useEffect(() => {
        console.log(id)
        ClubService.get_club(id)
            .then((data) => {
                setClub(data.data); 
                setLogoUrl(`${CLUB_URL}clubs/${data.data.id}/logo/${Date.now()}`)
            })

        ClubService.get_members(id)
            .then((data) => {
                setMembers(data.data); 
            })
        
        }, [])


    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        const formData = new FormData();
        formData.append("image", file);

        const response = await ClubService.upload_logo(id, formData);
        
        console.log(response.data)

        setLogoUrl(`${CLUB_URL}clubs/${club.id}/logo/${Date.now()}`)
    }

    const deleteLogo = async () => {
        await ClubService.delete_logo(id);

        setLogoUrl(`${CLUB_URL}clubs/${club.id}/logo/${Date.now()}`)
    }

    const deleteMember = async (email) => {
        if(confirmMemberDelete && selectedDelete == email) {
            await ClubService.delete_member(id, email);

            ClubService.get_members(id)
                .then((data) => {
                    setMembers(data.data); 
                })
        }
        else {
            setSelectedDelete(email);
            setConfirmMemberDelete(true);
        }
    }

    const deleteClub = async () => {
        if(confirmDelete){
            await ClubService.delete_club(id);
            navigate('/admin/clubs')
        }
        else {
            setConfirmDelete(true);
        }
    }

    return (
        <div className="container mt-4">

        <div className="card mb-4">
            <div className="card-body">
                <div className="row align-items-center">
                    <div className="col-auto position-relative">
                        <img src={`${logoUrl}`} alt="Club Logo" className="club-logo-page" />
                        {club.isRole &&
                        <div className="position-absolute top-100 start-50 translate-middle-x mt-2">
                            <div className="d-flex gap-2">
                                <button className="btn btn-pink btn-sm" onClick={handleFileInputClick}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                    </svg>
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={deleteLogo}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                                    </svg>
                                </button>
                            </div>
                        </div> }
                    </div>
                    <div className="col">
                        <h2 className="mb-2">{club.name}</h2>
                        <p className="invitation-count mb-0">
                            {club.city} • {club.type} {club.isRole && `• ${club.invitations} invitations left `}
                        </p>
                    </div>
                    <div className="col-auto gap-2 d-flex">
                        {club.isAdmin &&
                        <Link to={`/club/${id}/add`} className="btn btn-pink">Add</Link> }
                        {club.isRole &&
                        <Link to={`/club/${id}/edit`} className="btn btn-pink">Edit</Link> }
                        {club.isAdmin &&
                        <button className="btn btn-danger" onClick={deleteClub}>Delete{confirmDelete && `?`}</button> }
                    </div>
                </div>
            </div>
        </div>


        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
        />


        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Members</h5>
                {club.isRole && club.invitations > 0 &&
                <Link to={`/club/${id}/invite`} className="btn btn-pink">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg me-2" viewBox="0 0 16 16">
                                <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
                            </svg>
                            Invite
                </Link> }
            </div>
            
            <div className="card-body p-0">

                <div className="list-group list-group-flush">

                    {members.map((member) => (
                    <div key={member.id} className="list-group-item">
                        <div className={`row align-items-center ${member.isActivated ? '' : 'pending-member'}`}>
                            <div className="col-auto">
                                <img src={`${AUTH_URL}profile/${member.profile_id}/image/${Date.now()}`} alt="Member Avatar" className="member-avatar" />
                            </div>
                            <div className="col">
                                <h6 className="mb-0">
                                    {member.isActivated ? (
                                        <Link to={`/user/${member.profile_id}`}>
                                            {member.name}
                                        </Link>
                                        ) : (
                                        member.name
                                        )}
                                </h6>
                                <span className="member-role">{member.role}</span>
                            </div>
                            <div className="col-auto">
                                {club.isRole &&
                                <div className="d-flex gap-2">
                                    <Link to={`/club/${id}/members/${member.id}/${member.email}/edit`} className="btn btn-pink">Edit</Link>
                                    <button className="btn btn-danger btn-sm" onClick={() => deleteMember(member.email)}>Delete{selectedDelete == member.email && confirmMemberDelete ? ' ?' : ''}</button>
                                </div>}
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
    )
}

export default observer(Club)