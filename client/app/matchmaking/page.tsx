'use client';

import { Button } from '@/components/button';
import { Flex } from '@/components/flex';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUser } from '../hooks/user';
import { Socket, io } from 'socket.io-client';
import Timer from '@/components/timer';
import { Loader } from '@/components/loader';
import { ModalBody, ModalHead, ModalWrapper } from '@/components/modal';
import { useRouter } from 'next/navigation';
import Match from '../match/page';

export default function Matchmaking() {
  //* Hooks
  const { session, status } = useUser();
  const router = useRouter();

  //* States
  const [socket, setSocket] = useState<undefined | Socket>(undefined);
  const [isContinueQueue, setIsContinueQueue] = useState<boolean>(false);
  const [isMatchFounded, setIsMatchFounded] = useState<boolean>(false);
  const [isMatchApproved, setIsMatchApproved] = useState<boolean>(false);
  const [isMatchStarted, setIsMatchStarted] = useState<boolean>(false);

  useEffect(() => {
    let newSocket: undefined | Socket = socket;

    //? Socket connect function
    const onConnect = () => {
      console.log('connected user');
    };

    //? Socket disconnect function
    const onDisconnect = () => {
      console.log('disconnected user');
    };

    //? Socket queue change function
    const onQueueChange = (counter: number) => {
      console.log('Que counter', counter);
    };

    //? Socket queue ban function
    const onQueueBan = (date: string) => {
      console.log(`user banned to queue ${date}`);
    };

    //? Socket match founded function
    const onMatchFounded = () => {
      setIsMatchFounded(true);
      setTimeout(() => {
        setIsMatchFounded(false);
        setIsMatchApproved(false);
      }, 10001);
    };

    //? Socket match starting function
    const onMatchStarting = () => {
      setIsMatchStarted(true);
      console.log('Match starting....');
    };

    //? Socket match reject function
    const onMatchRejected = () => {
      setIsContinueQueue(false);
    };

    //? Socket room join and creating function
    const onRoomJoined = (roomData: object) => {
      setIsMatchFounded(false);
      setIsMatchApproved(false);
      setIsContinueQueue(false);
      console.log(`Room creating and ${roomData}`);
    };

    if (status === 'authenticated' && typeof socket === 'undefined') {
      //? Create socket connection
      newSocket = io('http://localhost:4000');

      //? Peer to created connection from state hook
      setSocket(newSocket);

      /**
       *?Socket listeners
       */

      //? Root listeners
      newSocket.on('connect', onConnect);
      newSocket.on('disconnect', onDisconnect);

      //? Queue listeners
      newSocket.on('queue:counter', onQueueChange);
      newSocket.on('queue:ban', onQueueBan);

      //? Match listeners
      newSocket.on('match:founded', onMatchFounded);
      newSocket.on('match:starting', onMatchStarting);
      newSocket.on('match:rejected', onMatchRejected);
      newSocket.on('room:joined', onRoomJoined);

      //? Log listeners
      newSocket.on('log:rooms', (data) => console.log(data));
    }

    return () => {};
  }, [status, socket]);

  const findMatch = () => {
    if (isContinueQueue) {
      //* Leave to Queue Scope
      socket?.emit('queue:stop', { email: session?.user?.email });
      setIsContinueQueue(false);
    } else {
      //* Join to Queue Scope

      socket?.emit('queue:started', { email: session?.user?.email });
      setIsContinueQueue(true);
    }
  };

  const approvedMatch = () => {
    setIsMatchApproved(true);
    socket?.emit('match:accepted');
    console.log('Match accepted');
  };

  return typeof socket === 'undefined' ? (
    <Loader />
  ) : (
    <Flex justifyContent="center" alignItems="center" direction="column">
      {!isMatchStarted ? (
        <>
          <div>{socket.id}</div>
          {isContinueQueue && <Timer continueTimer={isContinueQueue} />}
          <Button onClick={findMatch}>{!isContinueQueue ? 'Find a Match' : 'Leave to Queue'}</Button>
          <Button onClick={() => socket.emit('check:rooms')} marginTop="20px">
            Log: ROOMS
          </Button>
          {isMatchFounded && (
            <ModalWrapper>
              <ModalHead>
                <h2 style={{ margin: '0px' }}>Match Founded</h2>
              </ModalHead>
              <ModalBody>
                <Button bgColor="#4ADB61" onClick={approvedMatch} disabled={isMatchApproved}>
                  Approve
                </Button>
              </ModalBody>
            </ModalWrapper>
          )}
        </>
      ) : (
        <Match socket={socket} />
      )}
    </Flex>
  );
}
