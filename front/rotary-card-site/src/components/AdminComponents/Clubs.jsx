import React, { useContext, useState, useEffect } from "react";
import { Context } from "../../main";

import {observer} from 'mobx-react-lite'

import { useNavigate, Route, Routes, Link } from "react-router-dom";

import api from "../../http";

import ClubService from "../../services/ClubService";
import { CLUB_URL } from "../../services/ClubService";

const ClubsList = () => {

    const [clubs, setClubs] = useState([]);

    useEffect(() => {
        ClubService.get_clubs()
            .then((data) => {
                setClubs(data.data); 
            })
        }, [])

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
                <h2>Clubs</h2>
                <Link to="/admin/clubs/new" className="btn btn-pink">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg me-2" viewBox="0 0 16 16">
                        <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
                    </svg>
                    Add New Club
                </Link>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    <div className="list-group list-group-flush">
                        {clubs.map((club) => (
                        <div className="list-group-item" key={club.id}>
                            <div className="row align-items-center">
                                <div className="col-auto">
                                    <img src={`${CLUB_URL}clubs/${club.id}/logo/${Date.now()}`} alt="Club Logo" className="club-logo"/>
                                </div>
                                <div className="col">
                                    <h5 className="mb-1"><Link to={`/club/${club.id}`}>{club.name}</Link></h5>
                                    <div className="club-meta">
                                        <span className="me-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-geo-alt me-1" viewBox="0 0 16 16">
                                                <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/>
                                                <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                                            </svg>
                                            {club.city}
                                        </span>
                                        <span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-tag me-1" viewBox="0 0 16 16">
                                                <path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0"/>
                                                <path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1m0 5.586 7 7L13.586 9l-7-7H2z"/>
                                            </svg>
                                            {club.type}
                                        </span>
                                    </div>
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

export default observer(ClubsList)