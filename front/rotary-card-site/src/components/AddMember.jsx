import React, { useState, useEffect } from "react";

import { useNavigate, useParams} from "react-router-dom";

import {observer} from 'mobx-react-lite'

import ClubService from "../services/ClubService";

const AddMember = () => {
    const navigate = useNavigate();

    const {id, member, em} = useParams();

    const [roles, setRoles] = useState([]);

    const [email, setEmail] = useState('')
    const [role, setRole] = useState('')

    const [showError, setShowError] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        ClubService.get_club(id)

        ClubService.get_info("role")
            .then((data) => {
                setRoles(data.data); 
            })
            .catch((error) => {
                setShowError(true);
                setError("Error while fetching cities"); 
            });
    }, [])


    useEffect(() => {
            if(member!=null) {
                ClubService.get_member(id, em)
                    .then((data) => {
                        setEmail(data.data.email)
                        setRole(data.data.role_id)
                    })
                    .catch((error) => {
                        setShowError(true);
                        setError("Error while fetching member info"); 
                    });
            }
        }, [roles])

    const prevent = event => {
        event.preventDefault();
    }

    const addMember = async () => {
        try {
            setShowError(false)
            if(member == null)
                await ClubService.add_member(id, email, role);
            else
                await ClubService.edit_member(id, member, role);
            navigate('/club/'+id)
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
      };

    return (
        <div className="container">
            <div className="form-container">
                <h2 className="form-title">{member == null ? `Invite member` : `Edit member role`}</h2>

                {showError && (
                <div className="error-message">
                    {error}
                </div>)}

                <div className="card">
                    <div className="card-body">
                        <form onSubmit={prevent}>
  
                            <div className="mb-3">
                                <label htmlFor="inviteEmail" className="form-label">{member == null ? `Email to invite` : `Member email`}</label>
                                {member == null ? (
                                    <input type="text" 
                                        className="form-control" 
                                        id="inviteEmail" 
                                        placeholder="Enter user email"
                                        required onChange={e => setEmail(e.target.value)} value={email} />  
                                )
                                : (
                                    <input type="text" 
                                        className="form-control" 
                                        id="inviteEmail" 
                                        placeholder="Enter user email"
                                        required readOnly value={email} />  
                                )}
                                
                            </div>


                            <div className="mb-3">
                                <label htmlFor="roleSelect" className="form-label">Role</label>
                                <select value={role} onChange={e => setRole(e.target.value)} className="form-select" id="roleSelect">
                                    <option value="">Select a role</option>
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="d-grid">
                                <button type="submit" className="btn btn-pink" onClick={addMember}>{member == null ? `Invite` : `Change role`}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default observer(AddMember)