import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AudioProvider } from './audio/AudioContext';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AudioProvider>
        <App />
        <ToastContainer theme="dark" position="top-right" />
      </AudioProvider>
    </AuthProvider>
  </React.StrictMode>
);
