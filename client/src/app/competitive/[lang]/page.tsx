'use client';

import { useAuth } from '@/src/hooks/authentication/useAuth';
import { useAppDispatch, useAppSelector } from '@/src/hooks/redux/hook';
import { useSocket } from '@/src/hooks/socket/useSocket';
import React, { useEffect, useState } from 'react';
import { IoArrowForwardOutline } from 'react-icons/io5';
import GeneralTimer from '@/src/components/timer/general.timer';
import { usePathname, useRouter } from 'next/navigation';
import { setTimeout } from 'timers';
import CompetitiveFoundedModal from '@/src/components/modals/competitive/founded.modal';
import { changeIsMatchFounded, changeIsUserAccepted } from '@/src/redux/features/matchmaker/matchmaker.slice';

export default function Matchmaking() {
  //? Hooks
  const dispatch = useAppDispatch();
  const { auth } = useAuth();
  const socket = useSocket();
  const router = useRouter();
  const pathname = usePathname();

  //? Queue states
  const [isQueueContinue, setIsQueueContinue] = useState<boolean>(false);
  const [isQueueProtocolLoading, setIsQueueProtocolLoading] = useState<boolean>(false);

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

  const findMatch = () => {
    if (isQueueProtocolLoading) return;

    setIsQueueContinue((old) => !old);
  };

  const onChangeLang = (lang: string) => {
    router.push(`/competitive/${lang}`);
  };

  const onEndedCountdown = () => {
    if (isUserAccepted) {
      //? Accepted
      console.log('accepted');
    } else {
      //? Rejected
      console.log('rejected');
    }
    dispatch(changeIsMatchFounded(false));
    dispatch(changeIsUserAccepted(false));
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center">
      <div className="max-w-lg w-full rounded-lg border bg-base-200 border-gray-300 text-center shadow-xl">
        <div className="flex flex-col items-center justify-center gap-4 border-b border-gray-100 px-6 py-5">
          <span className="flex gap-1 text-xs">
            <span>Current Leaguge</span>
            <span>:</span>
            <span>Bronze</span>
          </span>
          <span className="flex gap-1 text-xs">
            <span>Username</span>
            <span>:</span>
            <span>mcann</span>
          </span>
          <span>
            <select
              defaultValue={pathname.split('/')[pathname.split('/').length - 1]}
              className="select select-sm select-ghost select-bordered w-full max-w-xs"
              onChange={(e) => onChangeLang(e.currentTarget.value)}
            >
              <option value="en">English</option>
              <option value="tr">Turkish</option>
            </select>
          </span>
        </div>

        <div className="px-6 py-5">
          <div className="mt-4 space-y-2">
            <div
              onClick={findMatch}
              className={`${
                isQueueContinue ? 'bg-red-600 active:bg-red-500' : 'bg-indigo-600 active:bg-indigo-500'
              } group w-full 
              relative inline-flex justify-center items-center overflow-hidden rounded-full  transition-all px-8 py-3 text-white cursor-pointer focus:outline-none focus:ring 
              `}
            >
              <span className={`${isQueueProtocolLoading ? 'block' : 'hidden'} loading loading-ring loading-sm`}></span>
              <div className={`${!isQueueProtocolLoading ? 'flex' : 'hidden'} items-center`}>
                <span className="absolute -start-full transition-all group-hover:start-4">
                  <IoArrowForwardOutline className={`${isQueueContinue ? 'rotate-180' : ''} transition-all`} />
                </span>

                <span className="text-sm font-medium transition-all select-none group-hover:ms-4">
                  {isQueueContinue ? 'Leave to Queue' : 'Find a Match'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-row justify-between mt-4">
            <p className="inline-flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
              <span className="text-xs font-medium text-green-700"> Server online </span>
            </p>
            <p className="inline-flex items-center gap-1">
              <span className="text-xs font-medium text-green-700"> Online Users </span>
              <span className="text-xs text-green-700">:</span>
              <span className="text-xs font-medium text-green-700">0</span>
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4 border-t border-gray-100 px-6 py-5">
          <span className="font-mono">
            {isQueueContinue && !isQueueProtocolLoading ? <GeneralTimer /> : <div className="p-3"></div>}
          </span>
        </div>
      </div>
      {isMatchFounded && <CompetitiveFoundedModal seconds={10} onEndedCountdown={onEndedCountdown} />}
    </div>
  );
}
