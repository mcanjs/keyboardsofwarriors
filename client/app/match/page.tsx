'use client';

import {
  CompetitionArea,
  CompetitionTextList,
  CompetitionTextWrapper,
  CompetitionInput,
  CompetitionTimer,
  CompetitionLeftTime,
} from './styles';
import cx from 'classnames';
import { Flex } from '@/components/flex';
import { Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { useUser } from '../hooks/user';

interface IProps {
  socket: Socket;
}

export default function Match(props: IProps) {
  const { socket } = props;
  const { status, session } = useUser();
  const [isConnectedUser, setIsConnectedUser] = useState<boolean>(false);
  const [isConnectedOpponent, setIsConnectedOpponent] = useState<boolean>(false);

  useEffect(() => {
    //? Socket match startable listener
    const onMatchStartable = () => {
      console.log('match starting in 3 seconds...');
    };

    //? Socket match started listener
    const onMatchStarted = () => {
      console.log('match started');
    };

    //? Socket match canceled listener
    const onMatchCanceled = () => {
      console.log('Opponent not connected to match for this match canceled');
    };

    //? Socket opponent left listener
    const onOpponentLeft = () => {
      console.log('Opponent left to match for this match finished...');
    };

    if (typeof socket !== 'undefined') {
      setIsConnectedUser(true);

      //? Match emitters
      socket.emit('match:connected-user', socket.id);

      //? Match listeners
      socket.on('match:startable', onMatchStartable);
      socket.on('match:started', onMatchStarted);
      socket.on('match:canceled', onMatchCanceled);

      //? User listeners
      socket.on('user:opponent-left', onOpponentLeft);
    }
  }, [socket, status === 'authenticated']);

  return typeof socket !== 'undefined' && isConnectedUser ? (
    <CompetitionArea>
      <div>{socket.id}</div>
      <CompetitionTextWrapper>
        {Array(50)
          .fill('Text' || 'Span')
          .map((el, index) => (
            <CompetitionTextList
              key={index}
              className={cx({
                ['current']: index === 0,
              })}
            >
              {el}
            </CompetitionTextList>
          ))}
      </CompetitionTextWrapper>
      <Flex direction="row" justifyContent="center">
        <CompetitionInput />
        <CompetitionTimer>
          <CompetitionLeftTime>0:41</CompetitionLeftTime>
        </CompetitionTimer>
      </Flex>
    </CompetitionArea>
  ) : (
    <></>
  );
}
