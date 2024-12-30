import { useContext, useEffect  } from "react";
import { Context } from "../main";

import { useNavigate } from "react-router-dom";

import {observer} from 'mobx-react-lite'

const Me = () => {
    const navigate = useNavigate()
    const {store} = useContext(Context)
    
    useEffect(() => {
        navigate(`/user/${store.user.id}`)
    }, [])
}

export default observer(Me)