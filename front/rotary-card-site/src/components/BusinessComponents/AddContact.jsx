import React, { useState, useEffect } from "react";

import { useNavigate, useParams} from "react-router-dom";

import {observer} from 'mobx-react-lite'

import BusinessService from "../../services/BusinessService";

const AddContact = () => {
    const navigate = useNavigate();

    const {id, contact_id} = useParams();

    const [value, setValue] = useState('')

    const [types, setTypes] = useState([]);
    const [type, setType] = useState('')

    const [showError, setShowError] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        BusinessService.get_info("type")
            .then((data) => {
                setTypes(data.data); 
            })
            .catch((error) => {
                setShowError(true);
                setError("Error while fetching contacts types"); 
            });
    }, []);

    useEffect(() => {
        if(contact_id!=null) {
            BusinessService.get_contact(id, contact_id)
                .then((data) => {
                    setValue(data.data.value)
                    setType(data.data.type_id)
                })
                .catch((error) => {
                    setShowError(true);
                    setError("Error while fetching contact info"); 
                });
        }
    }, [types])

    const prevent = event => {
        event.preventDefault();
    }

    const createContact = async () => {
        try {
            setShowError(false)
            if (contact_id == null) {
                await BusinessService.add_contact(id, value, type);
                navigate('/business/'+id)
            }
            else {
                await BusinessService.edit_contact(id, contact_id, value, type);
                navigate('/business/'+id)
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
                console.log(e)
                setError('Something went wrong')
            }
        }
      };

    return (
        <div className="container">
            <div className="form-container">
                <h2 className="form-title">{contact_id==null ? `Create New Contact` : `Edit contact`}</h2>

                {showError && (
                <div className="error-message">
                    {error}
                </div>)}

                <div className="card">
                    <div className="card-body">
                        <form onSubmit={prevent}>


                            <div className="mb-3">
                                <label htmlFor="citySelect" className="form-label">Contact type</label>
                                <select value={type} onChange={e => setType(e.target.value)} className="form-select" id="typeSelect" required>
                                    <option value="" disabled>Select a contact type</option>
                                    {types.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
  
                            <div className="mb-3">
                                <label htmlFor="contactValue" className="form-label">Contact value</label>
                                <input type="text" 
                                    className="form-control" 
                                    id="contactValue" 
                                    placeholder="Enter contact value"
                                    required onChange={e => setValue(e.target.value)} value={value} />
                            </div>
                        

                            <div className="d-grid">
                                <button type="submit" className="btn btn-pink" onClick={createContact}>{contact_id==null ? `Create Contact` : `Update contact`}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default observer(AddContact)