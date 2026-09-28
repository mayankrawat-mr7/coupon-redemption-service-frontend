import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter: enables client-side routing (URLs without full page reloads) */}
    <BrowserRouter>
      {/* AuthProvider: makes useAuth() available to every component below it */}
      <AuthProvider>
        <App />
        {/* Toaster: renders toast popups anywhere they're triggered from */}
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);