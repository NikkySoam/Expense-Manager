import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Set the global default base URL for all API requests. 
// In development this can fall back to the backend or localhost, 
// but in production on Vercel, it will use the Render backend URL provided in env.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
