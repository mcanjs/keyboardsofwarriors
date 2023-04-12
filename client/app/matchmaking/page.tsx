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
import { Flex } from '@/components/flex';
import Countdown from '@/components/countdown';

export default function Matchmaking() {
  const { session, status } = useUser();
  const au = useRef<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [socket, setSocket] = useState<undefined | Socket>(undefined);
  const [online, setOnline] = useState<number>(0);
  const [isQueueContinue, setIsQueueContinue] = useState<boolean>(false);
  const [isMatchFounded, setIsMatchFounded] = useState<boolean>(false);
  const [isOperationLoading, setIsOperationLoading] = useState<boolean>(false);

  useEffect(() => {
    const newSocket = io('http://localhost:4000', {});
    setSocket(newSocket);
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsLoading(false);
    });

    newSocket.on('queue:counter', (arg: number) => {
      setOnline(arg);
      setIsOperationLoading(false);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('match:acceptedOpponents', () => {});

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
  }, [status === 'authenticated', typeof socket === 'undefined']);

  const startOrEndQueue = () => {
    if (!socket) return console.error('Socket connection ERRORR!!!');
    setIsOperationLoading(true);
    if (isQueueContinue) {
      au.current.pause();
      au.current.src = '/fx/que:leave.wav';
      au.current.play();
      setIsQueueContinue(false);
      socket.emit('queue:stop', {
        email: session?.user?.email,
      });
    } else {
      au.current.pause();
      au.current.src = '/fx/que:start.wav';
      au.current.play();
      setIsQueueContinue(true);
      socket.emit('queue:started', {
        email: session?.user?.email,
      });
    }
  };

  const matchAcceptHandler = () => {
    socket?.emit('match:accepted');
  };

  const matchRejectHandler = () => {
    socket?.emit('match:rejected');
    socket?.disconnect();
    setIsMatchFounded(false);
    setIsQueueContinue(false);
    setSocket(undefined);
  };

  const countdownEnded = () => {
    //? When finish countdown will emit match:reject event and will dc socket
    matchRejectHandler();
  };

  return (
    <div>
      {typeof status !== 'undefined' && status === 'authenticated' && (
        <div>
          {isLoading ? (
            <>
              <Loader />
            </>
          ) : (
            <div>
              {isQueueContinue && !isOperationLoading && (
                <>
                  <div>Socket ID: {socket?.id}</div>
                  <div>Queue: {online}</div>
                </>
              )}
              {isOperationLoading ? (
                <Loader />
              ) : (
                <Button onClick={startOrEndQueue} bgColor={isQueueContinue ? 'red' : undefined}>
                  {!isQueueContinue ? 'Start Queue' : 'Left Queue'}
                </Button>
              )}
              <audio src={`/fx/que:start.wav`} ref={au}></audio>
              {isQueueContinue && !isOperationLoading && <Timer continueTimer={isQueueContinue} />}
              {isMatchFounded && (
                <ModalWrapper>
                  <ModalContainer>
                    <ModalHead>Maç bulundu</ModalHead>
                    <ModalBody>
                      <Flex>
                        <Button onClick={matchAcceptHandler} bgColor="#4ADB61">
                          Onayla
                        </Button>
                      </Flex>
                      <Flex>
                        <Countdown isStart={true} callback={countdownEnded} />
                      </Flex>
                    </ModalBody>
                  </ModalContainer>
                </ModalWrapper>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
