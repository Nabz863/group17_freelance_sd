import React, { createContext, useContext, useEffect } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socket = io(process.env.REACT_APP_SOCKET_URL || '/');

  useEffect(() => {
    socket.on('notification', ({ message, type }) => {
      toast[type || 'info'](message);
    });
    return () => {
      socket.off('notification');
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};