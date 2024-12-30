import React, { useContext, useState } from "react";
import { Context } from "../main";

import {observer} from 'mobx-react-lite'

import UserPage from "./UserPage";
import LoginForm from "./LoginForm";

const UserInfo = () => {
    
    const {store} = useContext(Context)

    if (store.isAuth)
        return (<UserPage/>)   
    else
        return (<LoginForm/>)
}


export default observer(UserInfo)