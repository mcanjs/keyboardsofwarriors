'use client';
import { Socket } from 'socket.io-client';
import CompetitiveGameScreen from './game.screen';
import CompetitiveGameLoadScreen from './load';
import { useEffect, useState } from 'react';
import { IMatcherRoomData } from '@/src/interfaces/socket/matcher.interface';
import { useRouter } from 'next/navigation';

interface IProps {
  socket: Socket;
  queueData: IMatcherRoomData;
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
    <div className="w-full flex-1 flex flex-col justify-center items-center">
      <div className="max-w-xl min-w-lg w-full rounded bg-base-200">
        {isGameLoading ? (
          <div className="max-w-lg mx-auto">
            <CompetitiveGameLoadScreen />
            <p className="p-3 text-center">The connection of the opponent is expected in the game</p>
          </div>
        ) : (
          <CompetitiveGameScreen socket={socket} queueData={queueData} />
        )}
      </div>
    </div>
  );
}
