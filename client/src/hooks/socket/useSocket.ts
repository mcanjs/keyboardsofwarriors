import React from 'react';
import { Socket, io } from 'socket.io-client';
import { useAuth } from '../authentication/useAuth';

export const useSocket = () => {
  const [socket, setSocket] = React.useState<Socket | undefined>(undefined);
  const { auth } = useAuth();

  React.useEffect(() => {
    function cleanUp() {
      socket?.disconnect();
    }

    if (typeof socket === 'undefined' && auth !== null) {
      const socketIo = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
        reconnectionDelayMax: 10000,
        query: { email: auth.email },
      });

      //? Update Socket for state
      setSocket(socketIo);
    }

    return cleanUp;
  }, [typeof socket === 'undefined', auth !== null]);

  return socket;
};
