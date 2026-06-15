import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user._id) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
      const newSocket = io(socketUrl);
      
      newSocket.emit('join', user._id);
      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
