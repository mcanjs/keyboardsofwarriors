import React from 'react';
import { Socket, io } from 'socket.io-client';
import { useAuth } from '../authentication/useAuth';
import { ISocketQueries } from '@/src/interfaces/socket.interface';

interface IProps {
  namespace?: '/' | '/custom' | '/custom/room';
  queryParams?: { roomId?: string };
}

export const useSocket = (props?: IProps) => {
  const [socket, setSocket] = React.useState<Socket | undefined>(undefined);
  const { auth } = useAuth();

  React.useEffect(() => {
    function cleanUp() {
      socket?.disconnect();
    }

    if (typeof socket === 'undefined' && auth !== null) {
      const query: ISocketQueries = { email: auth.email };

      if (props?.queryParams?.roomId) {
        query.roomId = props.queryParams.roomId;
      }

      const socketIo = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}${props?.namespace || '/'}`, {
        reconnectionDelayMax: 10000,
        query: query,
        forceNew: query.roomId ? true : false,
        auth: {
          token: document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1'),
        },
      });

      //? Update Socket for state
      setSocket(socketIo);
    }
    return cleanUp;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeof socket === 'undefined', auth !== null]);

  return socket;
};
