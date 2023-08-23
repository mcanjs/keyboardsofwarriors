'use client';

import { useAuth } from '@/src/hooks/authentication/useAuth';
import { useSocket } from '@/src/hooks/socket/useSocket';
import { useEffect } from 'react';

export default function PrivateRooms() {
  //? Hooks
  const { auth } = useAuth();
  const socket = useSocket({ namespace: '/private-rooms' });

  useEffect(() => {
    function onConnect() {
      console.log('connected to private rooms');
    }

    function onDisconnect() {
      console.log('disconnect to private rooms');
    }

    if (typeof socket !== 'undefined' && auth !== null) {
      //? Connect event listener
      socket.on('connect', onConnect);

      //? Disconnect event listener
      socket.on('disconnect', onDisconnect);
    }

    return () => {
      if (typeof socket !== 'undefined') {
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
      }
    };
  }, [auth, socket]);

  return (
    <div>
      <div>hello</div>
    </div>
  );
}
