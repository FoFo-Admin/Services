import React from 'react';
import {Routes, Route, Navigate} from "react-router-dom";

import RegisterForm from '../components/RegisterForm';
import LoginForm from '../components/LoginForm';
import UserInfo from '../components/UserInfo';
import AdminPanel from '../components/AdminPanel';
import Club  from '../components/Club';
import AddInv from '../components/AdminComponents/AddInv';
import AddClub from '../components/AdminComponents/AddClub';
import AddMember from '../components/AddMember';
import Prohibited from '../components/Prohibited';
import MyClub from '../components/MyClub';
import MyPage from '../components/MyPage';
import Me from '../components/Me';
import Confirm from '../components/Confirm';
import BusinessesList from '../components/BusinessComponents/BusinessesList';
import Business from '../components/BusinessComponents/Business';
import AddBusiness from '../components/BusinessComponents/AddBusiness';
import AddProduct from '../components/BusinessComponents/AddProduct';
import AddContact from '../components/BusinessComponents/AddContact';

const PageRouter = () => {
    return(
        <Routes>
            <Route path='/prohibited' element={<Prohibited/>}/>
            <Route exact path='/' element={<UserInfo/>}/>
            <Route exact path='/me' element={<Me/>}/>
            <Route exact path='/user/:id' element={<MyPage/>}/>
            <Route path='/login' element={<LoginForm/>}/>
            <Route path='/registration' element={<RegisterForm/>}/>
            <Route path='/admin/*' element={<AdminPanel/>}/>
            <Route path='/club' element={<MyClub/>}/>
            <Route path='/club/:id' element={<Club/>}/>
            <Route path='/club/:id/add' element={<AddInv/>}/>
            <Route path='/club/:id/edit' element={<AddClub/>}/>
            <Route path='/club/:id/invite' element={<AddMember/>}/>
            <Route path='/club/:id/members/:member/:em/edit' element={<AddMember/>}/>
            <Route path='/qr/:id/:code' element={<Confirm/>}/>
            <Route path='/business' element={<BusinessesList/>}/>
            <Route path='/business/:id' element={<Business/>}/>
            <Route path='/business/:id/edit' element={<AddBusiness/>}/>
            <Route path='/business/:id/product/new' element={<AddProduct/>}/>
            <Route path='/business/:id/product/:product_id' element={<AddProduct/>}/>
            <Route path='/business/:id/contact/new' element={<AddContact/>}/>
            <Route path='/business/:id/contact/:contact_id' element={<AddContact/>}/>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default PageRouter;