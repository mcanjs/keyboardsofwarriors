'use client';

import { Loader } from '@/src/components/loader';
import Timer from '@/src/components/timer';
import { useAuth } from '@/src/hooks/authentication/useAuth';
import React, { useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';

export default function Matchmaking() {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [isQueueContinue, setIsQueContinue] = useState<boolean>(false);
  const { auth } = useAuth();

  useEffect(() => {
    function onDisconnect() {
      console.log('user disconnect');
    }

    if (typeof socket === 'undefined' && auth !== null) {
      //? Initialize socket
      const newSocket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
        reconnectionDelayMax: 10000,
        query: { email: auth?.email },
      });
      //? Define socket
      setSocket(newSocket);

      newSocket.on('connect', () => {
        //? Disconnect
        newSocket.on('disconnect', onDisconnect);
      });
    }
  }, [typeof socket === 'undefined' && auth !== null]);

  const findMatch = () => {
    if (isQueueContinue) {
      setIsQueContinue(false);
    } else {
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
                <button className="w-full block rounded-full border border-gray-500 px-8 py-3 text-sm font-medium text-gray-600 hover:bg-gray-500 hover:text-white transition-all">
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
