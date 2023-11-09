'use client';
import CompetitiveGameScreen from './game.screen';
import { Socket } from 'socket.io-client';
import { IMatcherFoundedData } from '@/src/interfaces/matcher.interface';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CompetitiveGameLoadScreen from './load';

interface IProps {
  socket: Socket;
  queueData: IMatcherFoundedData;
}

export default function Game({ socket, queueData }: IProps) {
  const [isGameLoading, setIsGameLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    function onCompetitiveStarting() {
      setIsGameLoading(false);
    }

    function onCompetitiveCanceled(gameId: string) {
      router.push(`/result/${gameId}`);
    }

    if (socket && typeof socket !== 'undefined') {
      //? Competitive user connected emit
      socket.emit('competitive:user-connected', queueData);

      //? Competitive starting event listener
      socket.on('competitive:starting', onCompetitiveStarting);

      //? Competitive canceled event listener
      socket.on('competitive:canceled', onCompetitiveCanceled);
    }

    return () => {
      if (typeof socket !== 'undefined') {
        socket.off('competitive:starting', onCompetitiveStarting);
        socket.off('competitive:canceled', onCompetitiveCanceled);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return (
    <div className="flex flex-1 flex-col justify-center items-center">
      {isGameLoading ? (
        <div className="max-w-lg mx-auto">
          <CompetitiveGameLoadScreen />
          <p className="p-3 text-center">The connection of the opponent is expected in the game</p>
        </div>
      ) : (
        <CompetitiveGameScreen socket={socket} queueData={queueData} />
      )}
    </div>
  );
}
