import { createContext, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';

import Store from './store/store'


const store = new Store();

export const Context = createContext({
  store
})


createRoot(document.getElementById('root')).render(
  <Context.Provider value={{store}}>
    <App />
  </Context.Provider>
  ,
)
