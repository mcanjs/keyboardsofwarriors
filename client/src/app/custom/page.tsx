'use client';

import { useAuth } from '@/src/hooks/authentication/useAuth';
import { useSocket } from '@/src/hooks/socket/useSocket';
import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@/src/components/loader';
import { CUSTOM_ROOM_ACCESIBLE_CHARS, CUSTOM_ROOM_ACCESIBLE_NUMBERS } from '@/src/utils/constants';

export default function PrivateRooms() {
  //? Hooks
  const socket = useSocket({ namespace: '/custom' });
  const { auth } = useAuth();
  const { push: redirect } = useRouter();

  //? States
  const [disableOperations, setDisableOperations] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>('');

  //? IO Effect
  useEffect(() => {
    function onConnect() {
      console.log('[CUSTOM GAME]: Connected to successfully server');
    }

    function onDisconnect() {
      console.log('[CUSTOM GAME]: Disconnected to server');
    }

    function onLogCustomRooms(rooms: any) {
      console.log(rooms);
    }

    function onRedirectUserToRoom(roomId: string) {
      if (!roomId) return console.log('[CUSTOM GAME]: Server not sended any room id');
      redirect(`/custom/${roomId}`);
    }

    if (typeof socket !== 'undefined' && auth !== null) {
      //? Connect event listener
      socket.on('connect', onConnect);

      //? Disconnect event listener
      socket.on('disconnect', onDisconnect);

      //? Redirect to user room event listener
      socket.on('custom:redirect-user-room', onRedirectUserToRoom);

      //? Admin event listeners
      socket.on('admin:log-custom-rooms', onLogCustomRooms);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, auth]);

  const customCreate = () => {
    setDisableOperations(true);
    socket?.emit('custom:create');
  };

  const getCustomRooms = () => {
    socket?.emit('admin:log-custom-rooms');
  };

  const onKeyDownJoinIdInput = (e: KeyboardEvent<HTMLInputElement>) => {
    const chars = CUSTOM_ROOM_ACCESIBLE_CHARS;
    const numbers = CUSTOM_ROOM_ACCESIBLE_NUMBERS;

    if (typeof e.key === 'string' && chars.indexOf(e.key.toLowerCase()) > -1) {
      return e.currentTarget.value.toUpperCase();
    } else if (!isNaN(parseInt(e.key)) && numbers.indexOf(parseInt(e.key)) > -1) {
      return;
    } else if (e.key === 'Backspace') return;

    e.preventDefault();
  };

  const onChangeJoinIdInput = (e: ChangeEvent<HTMLInputElement>) => {
    const result = e.target.value.toUpperCase();

    setRoomId(result);
  };

  const onClickJoinButton = () => {
    if (roomId.length < 6) return;

    redirect(`/custom/${roomId}`);
  };

  return (
    <div className="container flex flex-1 mx-auto">
      <div className="flex-1 grid grid-cols-12">
        <div className="flex flex-col gap-3 items-center justify-center col-span-12 md:col-span-5">
          <div className="w-full flex flex-col gap-3">
            <label htmlFor="custom-room-id">Join a created room</label>
            <input
              id="custom-room-id"
              type="text"
              className="input input-bordered"
              placeholder="Room ID"
              disabled={disableOperations}
              onKeyDown={onKeyDownJoinIdInput}
              onChange={onChangeJoinIdInput}
              defaultValue={roomId}
              maxLength={6}
            />
          </div>
          <div className="w-full">
            <button
              className="btn btn-primary"
              disabled={disableOperations || roomId.length < 6}
              onClick={onClickJoinButton}
            >
              Join
            </button>
          </div>
        </div>
        <div className="flex flex-row gap-3 items-center justify-center col-span-12 md:col-span-2 md:flex-col">
          <span className="w-full h-[1px] block bg-slate-100 md:w-[1px] md:h-full"></span>
          <span>OR</span>
          <span className="w-full h-[1px] block bg-slate-100 md:w-[1px] md:h-full"></span>
        </div>
        <div className="flex flex-col items-center justify-center col-span-12 md:col-span-5">
          {disableOperations ? (
            <Loader />
          ) : (
            <button type="button" className="btn btn-primary" onClick={customCreate}>
              Create Custom Game
            </button>
          )}
          {auth?.admin && (
            <button type="button" className="btn btn-primary mt-4" onClick={getCustomRooms}>
              Show Custom Rooms
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
