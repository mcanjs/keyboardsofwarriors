'use client';

import { Loader } from '@/src/components/loader';
import MatchFoundModal from '@/src/components/matchFoundedModal';
import Timer from '@/src/components/timer';
import { useAuth } from '@/src/hooks/authentication/useAuth';
import { useAppDispatch, useAppSelector } from '@/src/hooks/redux/hook';
import { useSocket } from '@/src/hooks/socket/useSocket';
import {
  ISocketCompetitiveCreated,
  ISocketCompetitiveUserConnected,
  ISocketMatchFounded,
  ISocketMatchRoomUser,
  ISocketMatchWatingUserData,
} from '@/src/interfaces/socket.interfaces';
import { changeIsMatchFounded, changeIsUserAccepted } from '@/src/redux/features/matchmakingSlice';
import React, { useEffect, useState } from 'react';
import '@lottiefiles/lottie-player';
import Competitive from '@/src/components/competitive';
import { toast } from 'react-hot-toast';

export default function Matchmaking() {
  //? Hooks
  const dispatch = useAppDispatch();
  const { auth } = useAuth();
  const socket = useSocket();

  //? Queue and match states
  const [isQueueContinue, setIsQueContinue] = useState<boolean>(false);
  const [matchWaitingUserData, setMatchWaitingUserData] = useState<undefined | ISocketMatchWatingUserData>(undefined);
  const [matchFoundedUserData, setMatchFoundedUserData] = useState<undefined | ISocketMatchFounded>(undefined);
  const [isUserAlreadyAccepted, setIsUserAlreadyAccepted] = useState<boolean>(false);

  //? Loader states
  const [isLoaderLeftFromQueue, setIsLoaderLeftFromQueue] = useState<boolean>(false);

  //? Competitive states
  const [isCompetitiveCreating, setIsCompetitiveCreating] = useState<boolean>(false);
  const [isCompetitiveCreated, setIsCompetitiveCreated] = useState<boolean>(false);
  const [competitiveUserData, setCompetitiveUserData] = useState<ISocketCompetitiveUserConnected | undefined>(
    undefined
  );

  //? Store selectors
  const isMatchFounded = useAppSelector((state) => state.matchmakingReducer.isMatchFounded);
  const isUserAccepted = useAppSelector((state) => state.matchmakingReducer.isUserAccepted);

  //? Effects
  useEffect(() => {
    function onConnect() {
      console.log('connect');
    }

    function onDisconnect() {
      console.log('disconnect');
    }

    function onMatchFounded(data: ISocketMatchFounded) {
      setMatchFoundedUserData(data);
      dispatch(changeIsMatchFounded(true));
    }

    function onMatchOpponentRejected(data: string) {
      toast.error('Opponent not accepted match');
    }

    function onCompetitiveCreating(data: ISocketMatchRoomUser[]) {
      toast.success('Match accepted and competitive creating....');
      setIsCompetitiveCreated(false);
      setIsCompetitiveCreating(true);
    }

    function onCompetitiveCreated(data: ISocketCompetitiveCreated) {
      console.log('competitive created and user joined to room', data);
      setCompetitiveUserData({ rank: data.rank, competitiveTierIndex: data.competitiveTierIndex });
      setTimeout(() => {
        setIsCompetitiveCreating(false);
        setIsCompetitiveCreated(true);
      }, 4000);
    }

    function onLoaderLeaveFromQueue(isLoading: boolean) {
      console.log('loader activated');
      setIsLoaderLeftFromQueue(isLoading);
    }

    if (typeof socket !== 'undefined' && auth !== null) {
      //? Connect event listener
      socket.on('connect', onConnect);

      //? Disconnect event listener
      socket.on('disconnect', onDisconnect);

      //? Logs event listener
      socket.on('logs:matchRooms', (data) => console.log(data));

      //? Match event listeners
      socket.on('match:founded', onMatchFounded);
      socket.on('match:opponentRejected', onMatchOpponentRejected);

      //? Competitive event listeners
      socket.on('competitive:creating', onCompetitiveCreating);
      socket.on('competitive:created', onCompetitiveCreated);

      //? Queue event listeners
      socket.on('queue:waitingUserData', (data: ISocketMatchWatingUserData) => setMatchWaitingUserData(data));

      //? Loader event listeners
      socket.on('loader:leftFromQueue', onLoaderLeaveFromQueue);
    }
  }, [socket, auth]);

  useEffect(() => {
    if (isMatchFounded && isUserAccepted && typeof matchFoundedUserData !== 'undefined') {
      socket?.emit('match:accepted', matchFoundedUserData);
      setIsUserAlreadyAccepted(true);
    }
  }, [isMatchFounded, isUserAccepted, matchFoundedUserData]);

  //? Find a Match
  const findMatch = () => {
    if (isQueueContinue) {
      socket?.emit('queue:leave', matchWaitingUserData);
      setIsQueContinue(false);
    } else {
      socket?.emit('queue:start');
      setIsQueContinue(true);
    }
  };

  //? On Coundown Modal Ended
  const onCountdownEnded = () => {
    if (isUserAccepted) {
      if (!isUserAlreadyAccepted) socket?.emit('match:accepted', matchFoundedUserData);
    } else {
      socket?.emit('match:rejected', matchFoundedUserData);

      //? Change store states

      setIsQueContinue(false);
      setMatchWaitingUserData(undefined);
      setMatchFoundedUserData(undefined);
    }
    dispatch(changeIsMatchFounded(false));
    dispatch(changeIsUserAccepted(false));
  };

  return (
    <div
      className={`${
        !isCompetitiveCreated && !isCompetitiveCreating ? 'max-w-md' : 'w-full'
      } h-[calc(100vh-234px)] relative flex items-center justify-center mx-auto`}
    >
      {isCompetitiveCreating || isCompetitiveCreated ? (
        <div className={`${!isCompetitiveCreating && isCompetitiveCreated ? 'closing' : ''} competitive-screen`}>
          <div className="competitive-loader">
            <div className={`sword-animation`}>
              <lottie-player
                src="https://assets8.lottiefiles.com/packages/lf20_rkafct6f.json"
                background="transparent"
                speed="1"
                loop
                autoplay
              />
            </div>
          </div>
          {isCompetitiveCreated && typeof competitiveUserData !== 'undefined' && typeof socket !== 'undefined' && (
            <Competitive socket={socket} userData={competitiveUserData} />
          )}
        </div>
      ) : (
        <>
          <div className="w-full rounded-lg border border-gray-100 text-center shadow-xl">
            {typeof socket === 'undefined' ? (
              <div className="min-h-[250px] flex justify-center items-center">
                <Loader />
              </div>
            ) : (
              <>
                <div className="px-6 py-5">
                  <div className="mt-4 space-y-2">
                    {isLoaderLeftFromQueue ? (
                      <button
                        type="button"
                        onClick={findMatch}
                        className={`w-full block rounded-full border px-8 py-3 text-sm font-medium hover:text-white transition-all cursor-wait border-transparent`}
                        disabled={true}
                      >
                        <Loader className="!w-6 !h-6 mx-auto" />
                      </button>
                    ) : (
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
                    )}

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
          {isMatchFounded && <MatchFoundModal onCountdownEnded={onCountdownEnded} />}
        </>
      )}
    </div>
  );
}
