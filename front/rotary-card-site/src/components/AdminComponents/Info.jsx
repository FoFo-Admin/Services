import React, { useState, useEffect } from "react";

import {observer} from 'mobx-react-lite'

import { Link, useParams } from "react-router-dom";



import ClubService from "../../services/ClubService";
import BusinessService from "../../services/BusinessService";


const Info = () => {

    const {service, type} = useParams();

    const [info, setInfo] = useState([]);

    const [selectedDelete, setSelectedDelete] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        console.log(type)
        if(service == "clubs") {
            ClubService.get_info(type)
                .then((data) => {
                    setInfo(data.data); 
                })
        }
        else {
            BusinessService.get_info(type)
                .then((data) => {
                    setInfo(data.data); 
                })
        }
        }, [type, service])


    const deleteInfo = async (id) => {
        if(confirmDelete && selectedDelete == id) {
            if(service == "clubs") {
                await ClubService.delete_info(type, id);

                ClubService.get_info(type)
                    .then((data) => {
                        setInfo(data.data); 
                    })
            }
            else {
                await BusinessService.delete_info(type, id);

                BusinessService.get_info(type)
                    .then((data) => {
                        setInfo(data.data); 
                    })
            }
        }
        else {
            setSelectedDelete(id);
            setConfirmDelete(true);
        }
    }


    function capitalizeFirstLetter(val) {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
                <h2>{capitalizeFirstLetter(type)}</h2>
                <Link to={`/admin/info/${service}/${type}/add`} className="btn btn-pink">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg me-2" viewBox="0 0 16 16">
                        <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
                    </svg>
                    Add New {capitalizeFirstLetter(type)}
                </Link>
            </div>

            <div className="card">
            <div className="card-body">
                <table className="table">
                    <thead>
                        <tr>
                            <th>{capitalizeFirstLetter(type)} Name</th>
                            <th className="table-actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {info.map((i) => (
                        <tr id="row1" key={i.id}>
                            <td>
                                <span className="text-display">{i.name}</span>
                            </td>
                            <td>
                                <div className="d-flex gap-2">
                                    <Link to={`/admin/info/${service}/${type}/${i.id}`} className="btn btn-pink btn-sm">Edit</Link>
                                    <button className="btn btn-danger btn-sm" 
                                            onClick={() => deleteInfo(i.id)}>
                                        Delete{selectedDelete == i.id && confirmDelete ? ' ?' : ''}
                                    </button>
                                </div>
                            </td>
                        </tr>))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    )
}

export default observer(Info)