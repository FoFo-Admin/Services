import { useContext, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
//import './App.css'

import {observer} from 'mobx-react-lite'
import {BrowserRouter, Routes} from "react-router-dom";

import Header from './components/Header'
import PageRouter from './routers/PageRouter'
import { Context } from './main'

function App() {

  const {store} = useContext(Context);

  useEffect(() => {
    //if (localStorage.getItem('token')) {
      store.checkAuth()
    //}
  }, [])

  if (store.isLoading) {
    return <div>Loading</div>
  }

  return (
    <div>
      <BrowserRouter>
        <Header />
        {!store.isLoading &&
        <PageRouter/>
        }
      </BrowserRouter>
    </div>
        
  )
}

export default observer(App)
