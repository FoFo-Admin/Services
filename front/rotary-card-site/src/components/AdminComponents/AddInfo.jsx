import React, { useState, useEffect } from "react";

import { useNavigate, useParams} from "react-router-dom";

import {observer} from 'mobx-react-lite'

import ClubService from "../../services/ClubService";
import BusinessService from "../../services/BusinessService";

const AddInfo = () => {
    const navigate = useNavigate();

    const {service, type, id} = useParams();

    const [name, setName] = useState('')

    const [showError, setShowError] = useState(false)
    const [error, setError] = useState('')

    const prevent = event => {
        event.preventDefault();
    }

    useEffect(() => {
        if(id!=null) {
            if(service == "clubs") {
                ClubService.get_info_by_id(type, id)
                    .then((data) => {
                        setName(data.data.name)
                    })
                    .catch((error) => {
                        setShowError(true);
                        setError(`Error while fetching ${type} info`); 
                    });
            }
            else {
                BusinessService.get_info_by_id(type, id)
                    .then((data) => {
                        setName(data.data.name)
                    })
                    .catch((error) => {
                        setShowError(true);
                        setError(`Error while fetching ${type} info`); 
                    });
            }
        }
    }, [])

    const addName = async () => {
        try {
            setShowError(false)
            if (id == null) {
                if(service == "clubs") 
                    await ClubService.create_info(type, name);
                else
                    await BusinessService.create_info(type, name);
                navigate(`/admin/info/${service}/${type}`)
            }
            else {
                if(service == "clubs") 
                    await ClubService.update_info(type, name, id);
                else 
                    await BusinessService.update_info(type, name, id);
                navigate(`/admin/info/${service}/${type}`)
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

    function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }

    return (
        <div className="container">
            <div className="form-container">
                <h2 className="form-title">{id==null ? `Create` : `Edit`} {type}</h2>

                {showError && (
                <div className="error-message">
                    {error}
                </div>)}

                <div className="card">
                    <div className="card-body">
                        <form onSubmit={prevent}>
  
                            <div className="mb-3">
                                <label htmlFor="nameType" className="form-label">{capitalizeFirstLetter(type)} name</label>
                                <input type="text" 
                                    className="form-control" 
                                    id="nameType" 
                                    placeholder="Enter a name"
                                    required onChange={e => setName(e.target.value)} value={name} />
                            </div>

                            <div className="d-grid">
                                <button type="submit" className="btn btn-pink" onClick={addName}>{id==null ? `Add` : `Edit`}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default observer(AddInfo)