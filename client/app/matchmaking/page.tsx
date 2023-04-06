'use client';

import { Button } from '@/components/button';
import Timer from '@/components/timer';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function Matchmaking() {
  const router = useRouter();
  const [socket, setSocket] = useState<undefined | Socket>(undefined);
  const [online, setOnline] = useState<number>(0);
  const [isQueueContinue, setIsQueueContinue] = useState<boolean>(false);

  useEffect(() => {
    const newSocket = io('http://localhost:4000', {});
    setSocket(newSocket);
    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('que-counter', (arg: number) => {
      console.log('Que counter:', arg);
      setOnline(arg);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      if (isQueueContinue) {
        setOnline((prevOnline) => prevOnline - 1);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const startOrEndQueue = () => {
    if (!socket) return console.error('Socket connection ERRORR!!!');
    if (isQueueContinue) {
      socket.emit('stop-queue');
      setIsQueueContinue(false);
    } else {
      socket.emit('started-queue');
      setIsQueueContinue(true);
    }
  };

  return (
    <div>
      {isQueueContinue && (
        <>
          <div>Socket ID: {socket?.id}</div>
          <div>Online users: {online}</div>
        </>
      )}
      <Button onClick={startOrEndQueue} bgColor={isQueueContinue ? 'red' : undefined}>
        {!isQueueContinue ? 'Start Queue' : 'Left Queue'}
      </Button>
      {isQueueContinue && <Timer continueTimer={isQueueContinue} />}
    </div>
  );
}
