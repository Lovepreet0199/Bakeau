import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

//Import Bootstrap's CSS so Bootstrap classes can be used throughout the app
import "bootstrap/dist/css/bootstrap.min.css";

// Global Bakeau styles
import "./styles/global.css";

//Import our custom CSS for Bakeau-specific styling
import './index.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
