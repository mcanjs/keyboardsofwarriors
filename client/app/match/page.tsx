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
  const [isUserConnected, setIsUserConnected] = useState<boolean>(false);

  useEffect(() => {
    if (typeof socket !== 'undefined') {
      setIsUserConnected(true);
      socket.emit('user:connected', socket.id);
    }
  }, [socket, status === 'authenticated']);

  return typeof socket !== 'undefined' && isUserConnected ? (
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
