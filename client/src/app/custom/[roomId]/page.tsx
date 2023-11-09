'use client';

import CustomSettingsScreen from '@/src/components/screens/custom/room/settings.screen';
import { FaCrown } from 'react-icons/fa';
import Lottie from 'lottie-react';
import versusAnimation from '@/src/json/animations/versus.json';
import { Loader } from '@/src/components/loader';
import { useEffect, useState } from 'react';
import { useSocket } from '@/src/hooks/socket/useSocket';
import { useAuth } from '@/src/hooks/authentication/useAuth';
import CustomRoomLoadingScreen from '@/src/components/screens/custom/room/loading.screen';
import CustomRoomNotConnectedScreen from '@/src/components/screens/custom/room/not-connected.screen';
import { useParams } from 'next/navigation';
import {
  ISocketCustomRoomDataForClient,
  ISocketCustomRoomParameters,
  ISocketCustomRoomPlayerDataForClient,
} from '@/src/interfaces/custom.interface';
import CustomRoomFullyScreen from '@/src/components/screens/custom/room/fully.screen';
import toast from 'react-hot-toast';
import CustomRoomPreCountdown from '@/src/components/modals/competitive/pre-countdown.modal';

export default function CustomGameRoom() {
  //? Hooks
  const params = useParams();
  const { auth } = useAuth();
  const socket = useSocket({ namespace: `/custom/room`, queryParams: { roomId: params.roomId as string } });

  //? Room States
  const [isLoadingRoom, setIsLoadingRoom] = useState<boolean>(true);
  const [isConnectedToRoom, setIsConnectedToRoom] = useState<boolean>(false);
  const [isFullyRoom, setIsFullyRoom] = useState<boolean>(false);
  const [roomData, setRoomData] = useState<ISocketCustomRoomDataForClient | undefined>(undefined);
  const [canBeRedirect, setCanBeRedirect] = useState<boolean>(false);

  //? Ready States
  const [isReadyUser, setIsReadyUser] = useState<boolean>(false);

  //? Pre Countdown States
  const [isShowPreCountdown, setIsShowPreCountdown] = useState<boolean>(false);

  //? Effects
  useEffect(() => {
    function onConnect() {
      console.log('[CUSTOM ROOM]: Connected to custom room server');
    }

    function onDisconnect() {
      console.log('[CUSTOM ROOM]: Disconnected to room server');
    }

    function onForceDisconnect() {
      setIsLoadingRoom(false);
      setIsConnectedToRoom(false);
    }

    function onJoined(data: ISocketCustomRoomDataForClient) {
      setRoomData(data);
      setIsLoadingRoom(false);
      setIsConnectedToRoom(true);
    }

    function onFully() {
      setIsLoadingRoom(false);
      setIsConnectedToRoom(true);
      setIsFullyRoom(true);
    }

    function onUpdate(data: ISocketCustomRoomDataForClient) {
      setRoomData(data);
      console.log(data);
    }

    function onNotValidParameters() {
      toast.error('Not valid parameters please do not manually change the setting values');
    }

    function onPreCountdownStarted() {
      setIsShowPreCountdown(true);
    }

    function onPreCountdownFinished() {
      setIsShowPreCountdown(false);
    }

    function onRedirectGame() {
      setCanBeRedirect(true);
    }

    if (typeof socket !== 'undefined' && auth !== null) {
      //? Connect event listener
      socket.on('connect', onConnect);

      //? Disconnect event listener
      socket.on('disconnect', onDisconnect);

      //? Force disconnect event listener
      socket.on('room:force-disconnect', onForceDisconnect);

      //? Room fully event listener
      socket.on('room:fully', onFully);

      //? Joined to room event listener
      socket.on('room:joined', onJoined);

      //? Update room data event listener
      socket.on('room:update', onUpdate);

      //? Not valid parameters event listener
      socket.on('room:not-valid-parameters', onNotValidParameters);

      //? Countdown event listeners
      socket.on('room:pre-countdown-started', onPreCountdownStarted);
      socket.on('room:pre-countdown-finished', onPreCountdownFinished);

      //? Redirect game event listener
      socket.on('room:redirect-game', onRedirectGame);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, auth]);

  const generateUser = (data: ISocketCustomRoomPlayerDataForClient, isOwner: boolean) => (
    <>
      <label tabIndex={0} className="avatar placeholder cursor-pointer">
        <div className="bg-base-300 rounded-full w-[52px] h-[52px]">
          <span className={data.isReady ? 'text-gray-100' : ''}>
            {(data.username as string).charAt(0).toLocaleUpperCase()}
          </span>
        </div>
      </label>
      <div className="pl-2">
        <div>
          <span>{data.username}</span>
        </div>
        <div className="flex gap-3 text-sm">
          <div>
            <span className="pr-1">W</span>
            <span className="pr-1">:</span>
            <span>{data.win}</span>
          </div>
          <div>
            <span className="pr-1">L</span>
            <span className="pr-1">:</span>
            <span>{data.lose}</span>
          </div>
        </div>
      </div>
      {isOwner && (
        <div className="ml-auto tooltip" data-tip="Room Owner">
          <FaCrown size={20} />
        </div>
      )}
    </>
  );

  const userWait = () => (
    <>
      <label tabIndex={0} className="avatar placeholder cursor-pointer">
        <div className="bg-base-300 rounded-full w-[52px] h-[52px]">
          <Loader />
        </div>
      </label>
      <div className="pl-2">
        <div>
          <span>Waiting opponent</span>
        </div>
      </div>
    </>
  );

  const onChangedSettings = (data: ISocketCustomRoomParameters) => {
    socket?.emit('room:update-parameters', data, params.roomId);
  };

  const onClickReadyBtn = () => {
    setIsReadyUser((old) => {
      const status = !old;
      socket?.emit('room:user-ready-status', status, params.roomId);
      return status;
    });
  };

  const onClickPreCountdownUnReady = () => {
    setIsReadyUser(false);
    socket?.emit('room:user-ready-status', false, params.roomId);
  }

  return isLoadingRoom ? (
    <CustomRoomLoadingScreen />
  ) : !isConnectedToRoom ? (
    <CustomRoomNotConnectedScreen />
  ) : isConnectedToRoom && isFullyRoom ? (
    <CustomRoomFullyScreen />
  ) : canBeRedirect ? (
    <p>Game screen</p>
  ) : (
    <div className="container flex-1 mx-auto my-5">
      {typeof roomData !== 'undefined' && (
        <>
          {roomData.parameters ? (
            <CustomSettingsScreen
              isEditable={roomData.owner?.username === auth?.username}
              parameters={roomData.parameters}
              onChange={onChangedSettings}
            />
          ) : (
            <div className="w-full flex justify-center items-end">
              <span className="text-[16px] pr-[1.5px]">Waiting to settings from server</span>
              <Loader className="loading-dots w-[16px]" />
            </div>
          )}
          <div className="mt-10 text-center">
            <span className="text-xl pr-1">Room Id</span>
            <span className="text-xl pr-1">:</span>
            <span className="text-xl pr-1">{params.roomId}</span>
          </div>

          <div className="grid grid-cols-12 mt-10">
            <div className="col-span-5">
              <div
                className={`${
                  roomData.owner?.isReady ? 'bg-green-500 bg-opacity-80 text-gray-900' : 'bg-base-200'
                } "w-full flex items-center p-3  "`}
              >
                {typeof roomData.owner === 'undefined' ? userWait() : generateUser(roomData.owner, true)}
              </div>
            </div>
            <div className="col-span-2 flex justify-center">
              <Lottie animationData={versusAnimation} className="w-[75px] mx-auto" />
            </div>
            <div className="col-span-5">
              <div
                className={`${
                  roomData.away?.isReady ? 'bg-green-500 bg-opacity-80 text-gray-900' : 'bg-base-200'
                } "w-full flex items-center p-3  "`}
              >
                {typeof roomData.away === 'undefined' ? userWait() : generateUser(roomData.away, false)}
              </div>
            </div>
          </div>
        </>
      )}

      {isShowPreCountdown && <CustomRoomPreCountdown onPressedUnReady={onClickPreCountdownUnReady} />}

      {roomData?.away && roomData.owner && (
        <div className="mt-10 text-center">
          <button
            className={`${isReadyUser ? 'btn-error' : 'btn-success'} btn`}
            type="button"
            onClick={onClickReadyBtn}
          >
            {isReadyUser ? 'Not Ready' : 'Ready'}
          </button>
        </div>
      )}
    </div>
  );
}
