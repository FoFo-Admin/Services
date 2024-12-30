import React, { useContext } from "react";
import { Context } from "../main";

import { useParams } from "react-router-dom";

import {observer} from 'mobx-react-lite'

import UserPage from "./UserPage";
import SomebodyPage from "./SomebodyPage";

const MyPage = () => {
    const {id} = useParams();
    const {store} = useContext(Context)

    
    if(store.user.id == id)
        return (<UserPage/>)
    else
        return (<SomebodyPage id={id}/>)
}

export default observer(MyPage)