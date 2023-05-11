'use client';

import { Loader } from '@/src/components/loader';
import Timer from '@/src/components/timer';
import { useAuth } from '@/src/hooks/authentication/useAuth';
import { useSocket } from '@/src/hooks/socket/useSocket';
import { ISocketMatchWatingUserData } from '@/src/interfaces/socket.interfaces';
import React, { useEffect, useState } from 'react';

export default function Matchmaking() {
  const { auth } = useAuth();
  const socket = useSocket();
  const [isQueueContinue, setIsQueContinue] = useState<boolean>(false);
  const [matchWaitingUserData, setMatchWaitingUserData] = useState<undefined | ISocketMatchWatingUserData>(undefined);

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

      //? Logs event listener
      socket.on('logs:matchRooms', (data) => console.log(data));

      //? Match event listeners
      socket.on('match:founded', () => console.log('match founded'));

      //? Queue event listeners
      socket.on('queue:waitingUserData', (data: ISocketMatchWatingUserData) => setMatchWaitingUserData(data));
    }
  }, [socket, auth]);

  const findMatch = () => {
    if (isQueueContinue) {
      socket?.emit('queue:leave', matchWaitingUserData);
      setIsQueContinue(false);
    } else {
      socket?.emit('queue:start');
      setIsQueContinue(true);
    }
  };

  return (
    <div className="max-w-md h-[calc(100vh-104px)] mx-auto flex items-center justify-center">
      <div className="w-full rounded-lg border border-gray-100 text-center shadow-xl">
        {typeof socket === 'undefined' ? (
          <div className="min-h-[250px] flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <>
            <div className="px-6 py-5">
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={findMatch}
                  className={`${
                    isQueueContinue
                      ? 'border-red-500 text-red-600 hover:bg-red-500'
                      : 'border-blue-500 text-blue-600 hover:bg-blue-500'
                  } w-full block rounded-full border px-8 py-3 text-sm font-medium hover:text-white transition-all`}
                >
                  {isQueueContinue ? <span>Stop Queue</span> : <span>Find a Match</span>}
                </button>
                <button
                  onClick={() => socket.emit('logs:matchRooms')}
                  className="w-full block rounded-full border border-gray-500 px-8 py-3 text-sm font-medium text-gray-600 hover:bg-gray-500 hover:text-white transition-all"
                >
                  Private rooms
                </button>
              </div>

              <p className="mt-4 inline-flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
                <span className="text-xs font-medium text-green-700"> Server online </span>
              </p>
            </div>

            {isQueueContinue && (
              <div className="flex justify-center gap-4 border-t border-gray-100 px-6 py-5">
                <Timer continueTimer />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
