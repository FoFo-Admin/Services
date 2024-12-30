import React, { useState, useEffect } from "react";

import { useNavigate, useParams} from "react-router-dom";

import {observer} from 'mobx-react-lite'

import ClubService from "../../services/ClubService";

const AddClub = () => {
    const navigate = useNavigate();

    const {id} = useParams();

    const [cities, setCities] = useState([]);
    const [types, setTypes] = useState([]);

    const [name, setName] = useState('')
    const [city, setCity] = useState('')
    const [type, setType] = useState('')


    const [showError, setShowError] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        ClubService.get_info("city")
            .then((data) => {
                setCities(data.data); 
            })
            .catch((error) => {
                setShowError(true);
                setError("Error while fetching cities"); 
            });

        ClubService.get_info("type")
            .then((data) => {
                setTypes(data.data); 
            })
            .catch((error) => {
                setShowError(true);
                setError("Error while fetching types"); 
            });
    }, [])

    useEffect(() => {
        if(id!=null) {
            ClubService.get_club(id)
                .then((data) => {
                    setName(data.data.name)
                    cities.forEach(c => {
                        if(c.name == data.data.city) {
                            setCity(c.id)
                        }
                    });
                    types.forEach(t => {
                        if(t.name == data.data.type) {
                            setType(t.id)
                        }
                    });
                })
                .catch((error) => {
                    setShowError(true);
                    setError("Error while fetching club info"); 
                });
        }
    }, [cities, types])

    const prevent = event => {
        event.preventDefault();
    }

    const createClub = async () => {
        try {
            setShowError(false)
            if (id == null) {
                const response = await ClubService.create_club(name, city, type);
                navigate('/club/'+response.data.id)
            }
            else {
                const response = await ClubService.update_club(id, name, city, type);
                navigate('/club/'+response.data.id)
            }
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
                <h2 className="form-title">{id==null ? `Create New Club` : `Edit club`}</h2>

                {showError && (
                <div className="error-message">
                    {error}
                </div>)}

                <div className="card">
                    <div className="card-body">
                        <form onSubmit={prevent}>
  
                            <div className="mb-3">
                                <label htmlFor="clubName" className="form-label">Club Name</label>
                                <input type="text" 
                                    className="form-control" 
                                    id="clubName" 
                                    placeholder="Enter club name"
                                    required onChange={e => setName(e.target.value)} value={name} />
                            </div>


                            <div className="mb-3">
                                <label htmlFor="citySelect" className="form-label">City</label>
                                <select value={city} onChange={e => setCity(e.target.value)} className="form-select" id="citySelect" required>
                                    <option value="" disabled>Select a city</option>
                                    {cities.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="typeSelect" className="form-label">Club Type</label>
                                <select value={type} onChange={e => setType(e.target.value)} className="form-select" id="typeSelect" required>
                                    <option value="" disabled>Select club type</option>
                                    {types.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="d-grid">
                                <button type="submit" className="btn btn-pink" onClick={createClub}>{id==null ? `Create Club` : `Update club`}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default observer(AddClub)