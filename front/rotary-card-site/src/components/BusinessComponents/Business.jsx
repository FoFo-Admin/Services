import React, { useContext, useState, useEffect, useRef  } from "react";
import { Context } from "../../main";

import {observer} from 'mobx-react-lite'

import { useNavigate,  Link, useParams   } from "react-router-dom";


import BusinessService, {BUSINESS_URL} from "../../services/BusinessService";

const Business = () => {

    const fileInputRef = useRef(null);
    const fileInputRefProduct = useRef(null);

    const navigate = useNavigate();
        
    const {store} = useContext(Context)

    let { id } = useParams();

    const [business, setBusiness] = useState({});
    const [products, setProducts] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [logoUrl, setLogoUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);

    const [isAdmin, setIsAdmin] = useState(false);

    const [selectedProductImage, setSelectedProductImage] = useState('');

    const [selectedProductDelete, setSelectedProductDelete] = useState('');
    const [confirmProductDelete, setConfirmProductDelete] = useState(false);

    const [selectedContactDelete, setSelectedContactDelete] = useState('');
    const [confirmContactDelete, setConfirmContactDelete] = useState(false);

    const [imageClick, setImageClick] = useState('');

    const handleFileInputClick = (type) => {
        setImageClick(type)
        if (fileInputRef.current) {
        fileInputRef.current.click();
        }
    };

    const handleFileInputClickProduct = (id_pr) => {
        setSelectedProductImage(id_pr)
        if (fileInputRefProduct.current) {
        fileInputRefProduct.current.click();
        }
    };
    
    useEffect(() => {
        if(store.user != null) 
            setIsAdmin(store.user.isAdmin)
        BusinessService.get_business(id)
            .then((data) => {
                setBusiness(data.data); 
                setLogoUrl(`${BUSINESS_URL}businesses/${data.data.id}/image/logo/${Date.now()}`)
                setImageUrl(`${BUSINESS_URL}businesses/${data.data.id}/image/image/${Date.now()}`)
            })


        BusinessService.get_products(id)
            .then((data) => {
                setProducts(data.data); 
            })
        BusinessService.get_contacts(id)
            .then((data) => {
                setContacts(data.data); 
            })
        }, [])


    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        const formData = new FormData();
        formData.append("image", file);

        const response = await BusinessService.upload_image(id, imageClick, formData);

        if(imageClick == "logo")
            setLogoUrl(`${BUSINESS_URL}businesses/${business.id}/image/logo/${Date.now()}`)
        else 
            setImageUrl(`${BUSINESS_URL}businesses/${business.id}/image/image/${Date.now()}`)
    }

    const deleteImage = async (type) => {
        await BusinessService.delete_image(id, type);

        if(type == "logo")
            setLogoUrl(`${BUSINESS_URL}businesses/${business.id}/image/logo/${Date.now()}`)
        else 
            setImageUrl(`${BUSINESS_URL}businesses/${business.id}/image/image/${Date.now()}`)
    }


    const handleFileChangeProduct = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        const formData = new FormData();
        formData.append("image", file);

        await BusinessService.upload_product_image(id, selectedProductImage, formData);

        BusinessService.get_products(id)
            .then((data) => {
                setProducts(data.data); 
            })
    }

    const deleteImageProduct = async (id_pr) => {
        await BusinessService.delete_product_image(id, id_pr);

        BusinessService.get_products(id)
            .then((data) => {
                setProducts(data.data); 
            })
    }

    const deleteProduct = async (pr_id) => {
        if(confirmProductDelete && selectedProductDelete == pr_id) {
            await BusinessService.delete_product(id, pr_id);

            BusinessService.get_products(id)
                .then((data) => {
                    setProducts(data.data); 
                })
        }
        else {
            setSelectedProductDelete(pr_id);
            setConfirmProductDelete(true);
        }
    }

    const deleteContact = async (ct_id) => {
        if(confirmContactDelete && selectedContactDelete == ct_id) {
            await BusinessService.delete_contact(id, ct_id);

            BusinessService.get_contacts(id)
                .then((data) => {
                    setContacts(data.data); 
                })
        }
        else {
            setSelectedContactDelete(ct_id);
            setConfirmContactDelete(true);
        }
    }

    const deleteBusiness = async () => {
        if(confirmDelete){
            await BusinessService.delete_business(id);
            navigate('/business')
        }
        else {
            setConfirmDelete(true);
        }
    }



    return(
        <div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
            <input
                type="file"
                ref={fileInputRefProduct}
                onChange={handleFileChangeProduct}
                style={{ display: "none" }}
            />

            <div className="container">
                <div className="banner-container">
                    <img src={imageUrl} alt="Business Banner" className="banner-image"/>
                    {(isAdmin || business.isOwner) &&
                    <div className="d-flex gap-2 image-actions">
                        <button onClick={() => handleFileInputClick("image")} className="btn btn-primary btn-sm">Edit Banner</button>
                        <button onClick={() => deleteImage("image")} className="btn btn-danger btn-sm">Delete Banner</button>
                    </div>}
                </div>
                <div className="row">
                    <div className="col-lg-8">
                        <img src={logoUrl} alt="Business Logo" className="business-logo-big shadow" />

                        {(isAdmin || business.isOwner) &&
                        <div className="d-flex gap-2">
                            <button onClick={() => handleFileInputClick("logo")} className="btn btn-primary btn-sm">Edit Logo</button>
                            <button onClick={() => deleteImage("logo")} className="btn btn-danger btn-sm">Delete Logo</button>
                        </div>
                            }

                        <div className="mt-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <h1 className="mb-2">{business.name}{!business.isPublic && ` (Private)`}</h1>
                                <div className="d-flex gap-2">
                                    {(isAdmin || business.isOwner) &&
                                    <Link to={`/business/${id}/edit`} className="btn btn-pink">Edit</Link> }
                                    {(isAdmin) &&
                                    <button className="btn btn-danger" onClick={deleteBusiness}>Delete{confirmDelete && `?`}</button> }
                                </div>
                            </div>
                            <span className="category-badge mb-3 d-inline-block">{business.category}</span>
                            <div className="d-flex align-items-center mb-2 text-muted">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-geo-alt me-2" viewBox="0 0 16 16">
                                    <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/>
                                    <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                                </svg>
                                {business.city} | {business.address}
                            </div>
                            <p className="text-muted mt-4">
                                {business.description}
                            </p>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card mt-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h4 className="card-title mb-4">Contact Information</h4>
                                    {(isAdmin || business.isOwner) &&
                                    <Link to={`/business/${id}/contact/new`} className="btn btn-pink">
                                        Create new
                                    </Link>}
                                </div>

                                {contacts.map((contact) => (
                                    <div key={contact.id} className="contact-item d-flex justify-content-between align-items-center">
                                        <div>
                                            {contact.type == "tel" &&
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-telephone" viewBox="0 0 16 16">
                                                <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                                            </svg>}
                                            {contact.type == "email" &&
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
                                                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
                                            </svg>}
                                            {contact.type == "site" &&
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-globe" viewBox="0 0 16 16">
                                                <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z"/>
                                            </svg>}
                                            
                                            {contact.value}
                                        </div>
                                        {(isAdmin || business.isOwner) &&
                                        <div className="d-flex gap-2">
                                            <Link to={`/business/${id}/contact/${contact.id}`} className="btn btn-pink">Edit</Link> 
                                            <button className="btn btn-danger" onClick={()=>deleteContact(contact.id)}>Delete{selectedContactDelete == contact.id && confirmContactDelete ? `?` : ``}</button> 
                                        </div>}
                                    </div>
                                ))

                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-4">Our Products</h3>
                        {(isAdmin || business.isOwner) &&
                        <Link to={`/business/${id}/product/new`} className="btn btn-pink">
                            Create new
                        </Link>}
                    </div>
                    <div className="row g-4">

                        {products.map((product) => (
                            <div key={product.id} className="col-md-4">
                                <div className="card product-card h-100">
                                    <img src={`${BUSINESS_URL}businesses/${id}/products/${product.id}/image/${Date.now()}`} alt="Product 1" className="product-image" />
                                    {(isAdmin || business.isOwner) &&
                                    <div className="d-flex gap-2">
                                        <button onClick={() => handleFileInputClickProduct(product.id)} className="btn btn-primary btn-sm">Edit Image</button>
                                        <button onClick={() => deleteImageProduct(product.id)} className="btn btn-danger btn-sm">Delete Image</button>
                                    </div>
                                        }
                                    <div className="card-body">
                                        <h5 className="card-title">{product.name}</h5>
                                        <p className="card-text text-muted">{product.description}</p>
                                        <div className="product-price mt-3">{product.discount > 0 ? (<del>{`${product.price}₴`}</del>) : `${product.price}₴`}</div>
                                        {product.discount > 0 &&
                                        <div className="product-price mt-1">{(product.price - (product.price * (product.discount / 100))).toFixed(2)}₴</div>}
                                        {(isAdmin || business.isOwner) &&
                                        <div className="d-flex gap-2">
                                            <Link to={`/business/${id}/product/${product.id}`} className="btn btn-pink">Edit</Link> 
                                            <button className="btn btn-danger" onClick={()=>deleteProduct(product.id)}>Delete{selectedProductDelete == product.id && confirmProductDelete ? `?` : ``}</button> 
                                        </div>}
                                    </div>
                                </div>
                            </div>
                        ))}
                        

                
                    </div>
                </div>
            </div>
        </div>
    )
}

export default observer(Business)