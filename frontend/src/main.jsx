<<<<<<< HEAD
import React from 'react'
import ReactDOM from 'react-dom/client'
=======
import { createRoot } from 'react-dom/client'
import './index.css'
>>>>>>> Prem-dev
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

<<<<<<< HEAD
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
=======
console.log('main.jsx loading...');

createRoot(document.getElementById('root')).render(
  
    <App />
>>>>>>> Prem-dev
)

