import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { RoleProvider } from '../context/RoleContext';  

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <RoleProvider> 
        <App />
      </RoleProvider>
    </BrowserRouter>
  </React.StrictMode>
);
