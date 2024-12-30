import React, { useState, useEffect } from "react";

import { useNavigate, useParams} from "react-router-dom";

import {observer} from 'mobx-react-lite'

import BusinessService from "../../services/BusinessService";

const AddBusiness = () => {
    const navigate = useNavigate();

    const {id} = useParams();

    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);

    const [name, setName] = useState('')
    const [city, setCity] = useState('')
    const [owner, setOwner] = useState('')
    const [category, setCategory] = useState('')

    const [address, setAddress] = useState('')
    const [description, setDescription] = useState('')
    const [isPublic, setIsPublic] = useState('')

    const [showError, setShowError] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        BusinessService.get_info("city")
            .then((data) => {
                setCities(data.data); 
            })
            .catch((error) => {
                setShowError(true);
                setError("Error while fetching cities"); 
            });

        BusinessService.get_info("category")
            .then((data) => {
                setCategories(data.data); 
            })
            .catch((error) => {
                setShowError(true);
                setError("Error while fetching categories"); 
            });
    }, [])

    useEffect(() => {
        if(id!=null) {
            BusinessService.get_business_all(id)
                .then((data) => {
                    setName(data.data.name)
                    setCity(data.data.city_id)
                    setCategory(data.data.category_id)
                    setOwner(data.data.owner_email)
                    setAddress(data.data.address)
                    setDescription(data.data.description)
                    setIsPublic(data.data.isPublic)
                })
                .catch((error) => {
                    setShowError(true);
                    setError("Error while fetching club info"); 
                });
        }
    }, [cities, categories])

    const prevent = event => {
        event.preventDefault();
    }

    const createBusiness = async () => {
        try {
            setShowError(false)
            if (id == null) {
                const response = await BusinessService.create_business(name, city, category, owner);
                navigate('/business/'+response.data.id)
            }
            else {
                const response = await BusinessService.update_business(id, name, city, category, owner, address, description, isPublic);
                navigate('/business/'+response.data.id)
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
                <h2 className="form-title">{id==null ? `Create New Business` : `Edit business`}</h2>

                {showError && (
                <div className="error-message">
                    {error}
                </div>)}

                <div className="card">
                    <div className="card-body">
                        <form onSubmit={prevent}>
  
                            <div className="mb-3">
                                <label htmlFor="businessName" className="form-label">Business name</label>
                                <input type="text" 
                                    className="form-control" 
                                    id="businessName" 
                                    placeholder="Enter business name"
                                    required onChange={e => setName(e.target.value)} value={name} />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="ownerEmail" className="form-label">Owner Email</label>
                                <input type="text" 
                                    className="form-control" 
                                    id="ownerEmail" 
                                    placeholder="Enter owner email"
                                    required onChange={e => setOwner(e.target.value)} value={owner} />
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
                                <label htmlFor="categorySelect" className="form-label">Business Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} className="form-select" id="categorySelect" required>
                                    <option value="" disabled>Select business category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>


                            {id != null && 
                                <div>
                                    <div className="mb-3">
                                        <label htmlFor="businessaddress" className="form-label">Business address</label>
                                        <input type="text" 
                                            className="form-control" 
                                            id="businessaddress" 
                                            placeholder="Enter business address"
                                            onChange={e => setAddress(e.target.value)} value={address} />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="businessDescription" className="form-label">Business description</label>
                                        <textarea  type="text" 
                                            rows="5"
                                            className="form-control" 
                                            id="businessDescription" 
                                            placeholder="Enter business description"
                                            onChange={e => setDescription(e.target.value)} value={description} />
                                    </div>

                                    <div className="mb-3 form-check form-switch">
                                        <input className="form-check-input" type="checkbox" id="isPublicBusiness" onClick={() => {setIsPublic(!isPublic)}} checked={isPublic} />
                                        <label className="form-check-label" htmlFor="isPublicBusiness">{isPublic ? `Public` : `Private`}</label>
                                    </div>
                                </div>

                            }

                            <div className="d-grid">
                                <button type="submit" className="btn btn-pink" onClick={createBusiness}>{id==null ? `Create Business` : `Update business`}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default observer(AddBusiness)