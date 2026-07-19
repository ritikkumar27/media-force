import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../store/useAuth';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const token = useAuth((state) => state.token);

  useEffect(() => {
    if (!token) return;

    const socketInstance = io('http://localhost:3001', {
      auth: {
        token: token,
      },
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return socket;
};