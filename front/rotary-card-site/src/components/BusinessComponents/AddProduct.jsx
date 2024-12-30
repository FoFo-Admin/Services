import React, { useState, useEffect } from "react";

import { useNavigate, useParams} from "react-router-dom";

import {observer} from 'mobx-react-lite'

import BusinessService from "../../services/BusinessService";

const AddProduct = () => {
    const navigate = useNavigate();

    const {id, product_id} = useParams();

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [discount, setDiscount] = useState('')

    const [showError, setShowError] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if(product_id!=null) {
            BusinessService.get_product(id, product_id)
                .then((data) => {
                    setName(data.data.name)
                    setDescription(data.data.description)
                    setPrice(data.data.price)
                    setDiscount(data.data.discount)
                })
                .catch((error) => {
                    setShowError(true);
                    setError("Error while fetching product info"); 
                });
        }
    }, [])

    const prevent = event => {
        event.preventDefault();
    }

    const createProduct = async () => {
        try {
            setShowError(false)
            if (product_id == null) {
                await BusinessService.add_product(id, name, description, price, discount);
                navigate('/business/'+id)
            }
            else {
                await BusinessService.edit_product(id, product_id, name, description, price, discount);
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
                <h2 className="form-title">{product_id==null ? `Create New Product` : `Edit product`}</h2>

                {showError && (
                <div className="error-message">
                    {error}
                </div>)}

                <div className="card">
                    <div className="card-body">
                        <form onSubmit={prevent}>
  
                            <div className="mb-3">
                                <label htmlFor="productName" className="form-label">Product name</label>
                                <input type="text" 
                                    className="form-control" 
                                    id="productName" 
                                    placeholder="Enter product name"
                                    required onChange={e => setName(e.target.value)} value={name} />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="productDescription" className="form-label">Product description</label>
                                <textarea  type="text" 
                                    rows="5"
                                    className="form-control" 
                                    id="productDescription" 
                                    placeholder="Enter business description"
                                    required onChange={e => setDescription(e.target.value)} value={description} />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="productPrice" className="form-label">Price</label>
                                <input type="number" 
                                    className="form-control" 
                                    id="productPrice" 
                                    placeholder="Enter product price"
                                    required onChange={e => setPrice(e.target.value)} value={price} />
                            </div>


                            <div className="mb-3">
                                <label htmlFor="productDiscount" className="form-label">Discount</label>
                                <input type="number" 
                                    className="form-control" 
                                    id="productDiscount" 
                                    placeholder="Enter product discount"
                                    required onChange={e => setDiscount(e.target.value)} value={discount} />
                            </div>
                        

                            <div className="d-grid">
                                <button type="submit" className="btn btn-pink" onClick={createProduct}>{product_id==null ? `Create Product` : `Update product`}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default observer(AddProduct)