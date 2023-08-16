'use client';

import { useAuth } from '@/src/hooks/authentication/useAuth';
import { useAppDispatch, useAppSelector } from '@/src/hooks/redux/hook';
import { useSocket } from '@/src/hooks/socket/useSocket';
import useSWR from 'swr';
import React, { useEffect, useState } from 'react';
import { IoArrowForwardOutline } from 'react-icons/io5';
import GeneralTimer from '@/src/components/timer/general.timer';
import CompetitiveFoundedModal from '@/src/components/modals/competitive/founded.modal';
import {
  changeIsMatchFounded,
  changeMatchFoundedData,
  matchmakerDefaultStates,
} from '@/src/redux/features/matchmaker/matchmaker.slice';
import { toast } from 'react-hot-toast';
import { IMatcherFoundedData, IMatcherQueueBanData, IMatcherRoomData } from '@/src/interfaces/socket/matcher.interface';
import Game from '@/src/components/screens/competitive/game';
import CompetitiveBannedModal from '@/src/components/modals/competitive/banned.modal';
import { IGameLanguages } from '@/src/interfaces/socket/game.interface';
import { capitalizeFirstLetter, checkGameActiveLanguageIsVerify } from '@/src/utils/helper';
import AdminShortcuts from '@/src/components/shortcuts/admin.shortcuts';
import MMR from '@/src/utils/mmr';
import { Loader } from '@/src/components/loader';
import OnlineUserCounter from '@/src/components/counter/general.counter';

export default function Competitive() {
  //? Hooks
  const dispatch = useAppDispatch();
  const { auth } = useAuth();
  const socket = useSocket();
  const [userRank, setUserRank] = useState<undefined | number>(undefined);
  //? Lang states
  const [activeLangauge, setActiveLanguage] = useState<IGameLanguages>('en');

  //? System states
  const [isServerOnline, setIsServerOnline] = useState<boolean | undefined>(undefined);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [isWaitingServerStatus, setIsWaitingServerStatus] = useState<boolean>(true);

  //? Queue states
  const [isQueueContinue, setIsQueueContinue] = useState<boolean>(false);
  const [isQueueProtocolLoading, setIsQueueProtocolLoading] = useState<boolean>(false);
  const [queueData, setQueueData] = useState<IMatcherRoomData | undefined>(undefined);
  const [isHaveQueueBan, setIsHaveQueueBan] = useState<boolean>(false);
  const [queueBanData, setQueueBanData] = useState<undefined | IMatcherQueueBanData>(undefined);

  //? Competitive states
  const [isAccessibleGame, setIsAccessibleGame] = useState<boolean>(false);

  //? Store selectors
  const isMatchFounded = useAppSelector((state) => state.matchmakerReducer.isMatchFounded);
  const isUserAccepted = useAppSelector((state) => state.matchmakerReducer.isUserAccepted);
  const matchFoundedData = useAppSelector((state) => state.matchmakerReducer.matchFoundedData);

  const calculateBanDiffSeconds = (): number => {
    if (typeof queueBanData !== 'undefined') {
      return (new Date(queueBanData.banTime).getTime() - new Date(queueBanData.serverTime).getTime()) / 1000;
    }
    return 0;
  };

  //? Effects
  useEffect(() => {
    if (auth && auth.id) {
      fetch(`/api/user/rank/${auth.id}/`, { method: 'GET' })
        .then((res) => res.json())
        .then(({ rank }) => setUserRank(rank));
    }
  }, [auth]);

  useEffect(() => {
    function onConnect() {
      setIsServerOnline(true);
      setIsWaitingServerStatus(false);
    }

    function onDisconnect() {
      console.log('disconnect');
    }

    function onQueueProtocolLoading(isProtocolLoading: boolean) {
      setIsQueueProtocolLoading(isProtocolLoading);
    }

    function onQueueBanned(data: IMatcherQueueBanData) {
      socket?.emit('queue:leave', queueData);
      setQueueData(undefined);
      setIsQueueContinue(false);
      setQueueBanData(data);
      setIsHaveQueueBan(true);
    }

    function onOnlineUsers(numberOfOnlineUsers: number) {
      setOnlineUsers(numberOfOnlineUsers);
    }

    function onLogMatcherRooms(data: any) {
      console.log('Matcher Rooms :', data);
    }

    function onLogCompetitiveRooms(data: any) {
      console.log('Competitive Rooms :', data);
    }

    function onMatchRoomData(roomData: IMatcherRoomData) {
      setQueueData(roomData);
    }

    function onCompetitiveAccessible(roomId: string) {
      setIsAccessibleGame(true);
    }

    function onMatchFounded(matchData: IMatcherFoundedData) {
      dispatch(changeIsMatchFounded(true));
      dispatch(changeMatchFoundedData(matchData));
    }

    function onMatchReady() {}

    if (typeof socket !== 'undefined' && auth !== null) {
      //? Connect event listener
      socket.on('connect', onConnect);

      //? Disconnect event listener
      socket.on('disconnect', onDisconnect);

      //? Online users event listener
      socket.on('system:online-users', onOnlineUsers);

      //? Admin log event listeners
      socket.on('admin:log-matcher-rooms', onLogMatcherRooms);
      socket.on('admin:log-competitive-rooms', onLogCompetitiveRooms);

      //? Match room data event listener
      socket.on('match:room-data', onMatchRoomData);

      //? Match founded event listener
      socket.on('match:founded', onMatchFounded);

      //? Match ready event listener
      socket.on('match:ready', onMatchReady);

      //? Competitive accessible event listener
      socket.on('competitive:accessible', onCompetitiveAccessible);

      //? Protocol loading event listener
      socket.on('queue:protocol-loading', onQueueProtocolLoading);

      //? Queue banned event listener
      socket.on('queue:banned', onQueueBanned);
    } else if (!socket?.connected) {
      setIsServerOnline(false);
      setTimeout(() => {
        setIsWaitingServerStatus(false);
      }, 1000);
    }

    return () => {
      if (typeof socket !== 'undefined') {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('system:online-users', onOnlineUsers);
        socket.off('admin:log-matcher-rooms', onLogMatcherRooms);
        socket.off('admin:log-competitive-rooms', onLogCompetitiveRooms);
        socket.off('match:room-data', onMatchRoomData);
        socket.off('match:founded', onMatchFounded);
        socket.off('match:ready', onMatchReady);
        socket.off('competitive:accessible', onCompetitiveAccessible);
        socket.off('queue:protocol-loading', onQueueProtocolLoading);
      }
    };
  }, [socket, auth]);

  const findMatch = () => {
    if (isQueueProtocolLoading) return;
    if (!checkGameActiveLanguageIsVerify(activeLangauge)) {
      toast.error(
        'There is no such language registered in the system, please do not manually change the language selector.'
      );
      return;
    }

    if (isQueueContinue) {
      socket?.emit('queue:leave', queueData);
      setQueueData(undefined);
    } else {
      socket?.emit('queue:start', { activeLangauge });
    }

    setIsQueueContinue((old) => !old);
  };

  const onChangeLang = (lang: IGameLanguages) => {
    setActiveLanguage(lang);
  };

  const onEndedCountdown = () => {
    if (!isUserAccepted) {
      //? Rejected
      setIsQueueContinue(false);
      toast.error('Banned from to queue 1 minute for you are not accepted match');
    }

    //? Default
    dispatch(matchmakerDefaultStates());
  };

  const onApproved = () => socket?.emit('match:accepted', matchFoundedData);

  const bannedQueueOnEndedCountdown = () => {
    setIsHaveQueueBan(false);
  };

  return auth ? (
    <div className="w-full flex-1 flex flex-col justify-center items-center">
      {!isAccessibleGame && (
        <>
          <div className="max-w-lg w-full rounded-lg border bg-base-200 border-gray-300 text-center shadow-xl">
            <div className="flex flex-col items-center justify-center gap-4 border-b border-gray-100 px-6 py-5">
              <span className="flex items-center gap-1 text-xs">
                <span>Current Leaguge</span>
                <span>:</span>
                <span>
                  {typeof userRank !== 'undefined' ? (
                    capitalizeFirstLetter(MMR.generateMmrToString(userRank))
                  ) : (
                    <div className="animate-pulse">
                      <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-16"></div>
                    </div>
                  )}
                </span>
              </span>
              <span className="flex gap-1 text-xs">
                <span>Username</span>
                <span>:</span>
                <span>{auth?.username as string}</span>
              </span>
              <span>
                <select
                  defaultValue={activeLangauge}
                  className="select select-sm select-ghost select-bordered w-full max-w-xs"
                  onChange={(e) => onChangeLang(e.currentTarget.value as IGameLanguages)}
                  disabled={isQueueContinue}
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
                  <span
                    className={`${isQueueProtocolLoading ? 'block' : 'hidden'} loading loading-ring loading-sm`}
                  ></span>
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
                {isServerOnline ? (
                  <p className="inline-flex items-center gap-1">
                    <span className="bg-green-500 inline-block h-1.5 w-1.5 rounded-full"></span>
                    <span className="text-green-700 text-xs font-medium">Server Online</span>
                  </p>
                ) : (
                  isWaitingServerStatus && <div className="loading loading-ring loading-sm"></div>
                )}

                {!isServerOnline && !isWaitingServerStatus && (
                  <p className="inline-flex items-center gap-1">
                    <span className="bg-red-500 inline-block h-1.5 w-1.5 rounded-full"></span>
                    <span className="text-red-700 text-xs font-medium">Server Offline</span>
                  </p>
                )}

                <p className="inline-flex items-center gap-1">
                  <span className="text-xs font-medium text-green-700">Online Users</span>
                  <span className="text-xs text-green-700">:</span>
                  <span className="text-xs font-medium text-green-700">{onlineUsers}</span>
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-4 border-t border-gray-100 px-6 py-5">
              <span className="font-mono">
                {isQueueContinue && !isQueueProtocolLoading ? <GeneralTimer /> : <div className="p-3"></div>}
              </span>
            </div>
          </div>
          {isMatchFounded && (
            <CompetitiveFoundedModal seconds={10} onEndedCountdown={onEndedCountdown} onApproved={onApproved} />
          )}
          {isHaveQueueBan && calculateBanDiffSeconds() > 0 && (
            <CompetitiveBannedModal
              seconds={calculateBanDiffSeconds()}
              onEndedCountdown={bannedQueueOnEndedCountdown}
            />
          )}
        </>
      )}
      {isAccessibleGame && typeof queueData !== 'undefined' && typeof socket !== 'undefined' && (
        <Game socket={socket} queueData={queueData} />
      )}
      <AdminShortcuts socket={socket} />
    </div>
  ) : (
    <div className="w-full flex-1 flex flex-col justify-center items-center">
      <Loader className="loading-lg" />
    </div>
  );
}
