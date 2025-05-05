import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/theme.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';

import { Auth0Provider } from "@auth0/auth0-react";
import { SocketProvider } from './contexts/SocketContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: process.env.REACT_APP_AUTH0_CALLBACK_URL,
        prompt: 'login'
      }}
      cacheLocation="memory"
      useRefreshTokens={false}
    >
      <SocketProvider>
        <BrowserRouter>
          <App />
          <ToastContainer position="top-right" newestOnTop />
        </BrowserRouter>
      </SocketProvider>
    </Auth0Provider>
  </React.StrictMode>
);

reportWebVitals();