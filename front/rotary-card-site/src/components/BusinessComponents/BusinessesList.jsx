import React, { useContext, useState, useEffect } from "react";
import { Context } from "../../main";

import {observer} from 'mobx-react-lite'

import { useNavigate, Route, Routes, Link } from "react-router-dom";


import BusinessService, {BUSINESS_URL} from "../../services/BusinessService";

const BusinessesList = () => {

    const [businesses, setBusinesses] = useState([]);

    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);

    const [text, setText] = useState('')
    const [city, setCity] = useState('')
    const [category, setCategory] = useState('')

    const [isOwner, setIsOwner] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    const {store} = useContext(Context)

    const getBusinesses = async () => {
        if(store.user != null) {
            setIsAdmin(store.user.isAdmin)
            if (store.user.isAdmin) {
                BusinessService.get_businesses_all()
                    .then((data) => {
                        setBusinesses(data.data); 
                    })
            }
            else {
                BusinessService.get_businesses()
                    .then((data) => {
                        setBusinesses(data.data); 
                })
            }
        }
        BusinessService.get_is_owner()
            .then((data) => {
                setIsOwner(data.data.isOwner)
            })
    }

    const getMyBusinesses = () => {
        BusinessService.get_businesses_my()
            .then((data) => {
                setBusinesses(data.data); 
        })
    }
    
    useEffect(() => {
        BusinessService.get_info("city")
        .then((data) => {
            setCities(data.data); 
        })
    
        BusinessService.get_info("category")
            .then((data) => {
                setCategories(data.data); 
            })
                
        getBusinesses()
        }, [])

return (
<div className="container py-5">
        <div className="card mb-4 shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-4">Filter Businesses</h5>
                    <div className="d-flex gap-2">
                        {isAdmin &&
                        <Link to={`/admin/business/new`} className="btn btn-pink">
                            Create new
                        </Link>}
                        {isOwner &&
                        <button className="btn btn-pink" onClick={getMyBusinesses}>
                            Show my
                        </button>}
                    </div>
                </div>
                    
                <div className="row g-3">
                    <div className="col-md-3">
                        <label htmlFor="citySelect" className="form-label">City</label>
                        <select value={city} onChange={e => setCity(e.target.value)} className="form-select" id="citySelect">
                            <option value="">All cities</option>
                            {cities.map((c) => (
                                <option key={c.id} value={c.name}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label htmlFor="selectCategory" className="form-label">Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)}  className="form-select" id="selectCategory">
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.name}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="searchByName" className="form-label">Search by Name</label>
                        <input type="text" className="form-control" id="searchByName" placeholder="Enter business name..." onChange={e => setText(e.target.value)} value={text} />
                    </div>
                </div>
            </div>
        </div>


        <div className="row g-4">
            {businesses.map((business) => ( (category == "" ? true : category == business.category)
            && (city == "" ? true : city == business.city)
            && business.name.toLowerCase().startsWith(text.toLowerCase())
            &&
            <div key={business.id} className="col-md-6">
                <Link to={`/business/${business.id}`}>
                    <div className="card business-card h-100 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex gap-4">
                                <img src={`${BUSINESS_URL}businesses/${business.id}/image/logo/${Date.now()}`} alt="Business Logo" className="business-logo" />
                                <div className="flex-grow-1">
                                    <h5 className="card-title mb-2">{business.name}{!business.isPublic && ` (Private)`}</h5>
                                    <span className="category-badge mb-3 d-inline-block">{business.category}</span>
                                    <div className="d-flex align-items-center mb-2 text-muted">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-geo-alt-fill location-icon me-2" viewBox="0 0 16 16">
                                            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
                                        </svg>
                                        {business.city}
                                    </div>
                                    <p className="card-text text-muted mb-0">{business.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
            ))}
        </div>
    </div>)

    }

export default observer(BusinessesList)