import React, {useEffect, useState} from "react";

import { useParams, Link } from "react-router-dom";

import {observer} from 'mobx-react-lite'

import AuthService from "../services/AuthService";


const Confirm = () => {
    const {id, code} = useParams();

    const [isAnswer, setIsAnswer] = useState(false);
    const [result, setResult] = useState(false);

    useEffect(() => {
        AuthService.check_qr(id, code).then((data) => {
            if(data.data) {
                setResult(data.data.result)
                setIsAnswer(true)
            }
            throw new Error('QR Code Verification Failed')
        }).catch((error) => {
            setIsAnswer(true)
        });
    },[])

    
    if(isAnswer){
        if(result) {
            return (
                <div className="container py-5">
                    <div className="row justify-content-center g-4">
                        <div className="col-md-6">
                            <div className="status-panel success-panel">
                                <div className="status-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16">
                                        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                                    </svg>
                                </div>
                                <h3 className="mb-3">QR Code Verified Successfully</h3>
                                <p className="text-muted mb-4">This code is valid</p>
                                <div className="d-flex justify-content-center gap-3">
                                    <Link to={`/user/${id}`} className="btn btn-success login-reg-btn">To User Page</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        else {
            return(
                <div className="container py-5">
                        <div className="row justify-content-center g-4">
                            <div className="col-md-6">
                        <div className="status-panel error-panel">
                            <div className="status-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                                </svg>
                            </div>
                            <h3 className="mb-3">QR Code Verification Failed</h3>
                            <p className="text-muted mb-4">This code isn't valid</p>
                            <div className="d-flex justify-content-center gap-3">
                                <a href="/" className="btn btn-danger login-reg-btn">Go to Main Page</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )
        }
    }


    
}

export default observer(Confirm)



            