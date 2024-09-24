import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AppProvider from './components/GlobalContext.jsx'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <ToastContainer position='top-center' autoClose={3000} />
      <App />
    </AppProvider>
  </React.StrictMode>,
)
