import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

console.log('main.jsx loading...');

createRoot(document.getElementById('root')).render(
  
    <App />
)

