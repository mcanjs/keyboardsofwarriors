'use client';

import { useAuth } from '@/src/hooks/authentication/useAuth';
import { useAppDispatch, useAppSelector } from '@/src/hooks/redux/hook';
import { useSocket } from '@/src/hooks/socket/useSocket';
import React, { useEffect, useState } from 'react';

export default function Matchmaking() {
  //? Hooks
  const dispatch = useAppDispatch();
  const { auth } = useAuth();
  const socket = useSocket();

  //? Store selectors
  const isMatchFounded = useAppSelector((state) => state.matchmakerReducer.isMatchFounded);
  const isUserAccepted = useAppSelector((state) => state.matchmakerReducer.isUserAccepted);

  //? Effects
  useEffect(() => {
    function onConnect() {
      console.log('connect');
    }

    function onDisconnect() {
      console.log('disconnect');
    }

    if (typeof socket !== 'undefined' && auth !== null) {
      //? Connect event listener
      socket.on('connect', onConnect);

      //? Disconnect event listener
      socket.on('disconnect', onDisconnect);
    }

    return () => {
      if (typeof socket !== 'undefined') {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
      }
    };
  }, [socket, auth]);

  return (
    <div>
      <div>hello</div>
    </div>
  );
}
