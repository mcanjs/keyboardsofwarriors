'use client';

import { Button } from '@/components/button';
import { Loader } from '@/components/loader';
import { ModalBody, ModalContainer, ModalHead, ModalWrapper } from '@/components/modal';
import Timer from '@/components/timer';
import { getServerSession } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { useUser } from '../hooks/user';

export default function Matchmaking() {
  const { session, status } = useUser();
  const au = useRef<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [socket, setSocket] = useState<undefined | Socket>(undefined);
  const [online, setOnline] = useState<number>(0);
  const [isQueueContinue, setIsQueueContinue] = useState<boolean>(false);
  const [isMatchFounded, setIsMatchFounded] = useState<boolean>(false);

  useEffect(() => {
    const newSocket = io('http://localhost:4000', {});
    setSocket(newSocket);
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsLoading(false);
    });

    newSocket.on('queue:counter', (arg: number) => {
      console.log('Que counter:', arg);
      setOnline(arg);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('match:founded', () => {
      console.log('match founded');
      au.current.pause();
      au.current.src = '/fx/game:start.wav';
      au.current.play();
      setIsMatchFounded(true);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [status === 'authenticated']);

  const startOrEndQueue = () => {
    if (!socket) return console.error('Socket connection ERRORR!!!');
    if (isQueueContinue) {
      au.current.pause();
      au.current.src = '/fx/que:leave.wav';
      au.current.play();
      setIsQueueContinue(false);
      socket.emit('queue:stop');
    } else {
      au.current.pause();
      au.current.src = '/fx/que:start.wav';
      au.current.play();
      setIsQueueContinue(true);
      socket.emit('queue:started');
    }
  };

  const matchAcceptHandler = () => {
    socket?.emit('match:accepted');
    setIsMatchFounded(false);
    setIsQueueContinue(false);
  };

  const matchRejectHandler = () => {
    socket?.emit('match:rejected');
    setIsMatchFounded(false);
    setIsQueueContinue(false);
  };

  return (
    <div>
      {isLoading ? (
        <>
          <Loader />
        </>
      ) : (
        <div>
          {isQueueContinue && (
            <>
              <div>Socket ID: {socket?.id}</div>
              <div>Queue: {online}</div>
            </>
          )}
          <Button onClick={startOrEndQueue} bgColor={isQueueContinue ? 'red' : undefined}>
            {!isQueueContinue ? 'Start Queue' : 'Left Queue'}
          </Button>
          <audio src={`/fx/que:start.wav`} ref={au}></audio>
          {isQueueContinue && <Timer continueTimer={isQueueContinue} />}
          {isMatchFounded && (
            <ModalWrapper>
              <ModalContainer>
                <ModalHead>Maç bulundu</ModalHead>
                <ModalBody>
                  <Button onClick={matchAcceptHandler}>Onayla</Button>
                  <Button onClick={matchRejectHandler} bgColor="red" style={{ marginLeft: '10px' }}>
                    Reddet
                  </Button>
                </ModalBody>
              </ModalContainer>
            </ModalWrapper>
          )}
        </div>
      )}
    </div>
  );
}
