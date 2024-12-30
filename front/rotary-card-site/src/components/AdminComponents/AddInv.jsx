import React, { useState, useEffect } from "react";

import { useNavigate, useParams} from "react-router-dom";

import {observer} from 'mobx-react-lite'

import ClubService from "../../services/ClubService";

const AddInv = () => {
    const navigate = useNavigate();

    const {id} = useParams();

    const [inv, setInv] = useState('')

    const [showError, setShowError] = useState(false)
    const [error, setError] = useState('')

    const prevent = event => {
        event.preventDefault();
    }

    const addInv = async () => {
        try {
            setShowError(false)
            await ClubService.add_inv(id, inv);
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
                <h2 className="form-title">Add invitations</h2>

                {showError && (
                <div className="error-message">
                    {error}
                </div>)}

                <div className="card">
                    <div className="card-body">
                        <form onSubmit={prevent}>
  
                            <div className="mb-3">
                                <label htmlFor="invNum" className="form-label">Invitation amount</label>
                                <input type="number" 
                                    className="form-control" 
                                    id="invNum" 
                                    placeholder="Enter a number of invitations"
                                    required onChange={e => setInv(e.target.value)} value={inv} />
                            </div>

                            <div className="d-grid">
                                <button type="submit" className="btn btn-pink" onClick={addInv}>Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default observer(AddInv)