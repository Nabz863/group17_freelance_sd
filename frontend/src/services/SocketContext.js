import React, { createContext, useContext, useEffect } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socket = io(process.env.REACT_APP_SOCKET_URL || '/');
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && user) {
      socket.emit('userSignIn', { email: user.email, sub: user.sub });
      getAccessTokenSilently().then(token =>
        axios.post(
          '/api/users/signin',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
    }
  }, [isAuthenticated, user, getAccessTokenSilently, socket]);

  useEffect(() => {
    socket.on('notification', ({ message, type }) => {
      toast[type || 'info'](message);
    });
    return () => socket.disconnect();
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);