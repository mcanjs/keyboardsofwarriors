import React, { KeyboardEvent, LegacyRef, MutableRefObject, useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import CompetitiveLoader from './loader';
import { ISocketCompetitiveUserConnected } from '@/src/interfaces/socket.interfaces';

interface IProps {
  socket: Socket;
  userData: ISocketCompetitiveUserConnected;
}

export default function Competitive(props: IProps) {
  const { socket, userData } = props;
  const [isWordsReady, setIsWordsReady] = useState<boolean>(false);
  const [words, setWords] = useState<string[] | undefined>(undefined);
  const [isOpponentReady, setIsOpponentReady] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);

  //? Words statements
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);
  const [activeWord, setActiveWord] = useState<undefined | string>(undefined);

  //? Refs
  const wordRef = useRef<any>([]);
  const inputRef = useRef<any>(undefined);

  useEffect(() => {
    function onCompetitiveWords(data: string[]) {
      setTimeout(() => {
        setWords(data);
        setActiveWord(data[0]);
        wordRef.current = wordRef.current.slice(0, data.length);
        setIsWordsReady(true);
        setStep((old) => old + 1);
      }, 1000);
    }

    function onCompetitiveOpponentReady(data: boolean) {
      setIsOpponentReady(data);
      setStep((old) => old + 1);
    }

    if (typeof socket !== 'undefined' && typeof userData !== 'undefined') {
      //? Competitive event listeners
      socket.on('competitive:words', onCompetitiveWords);
      socket.on('competitive:opponentReady', onCompetitiveOpponentReady);

      //? Competitive emitters
      socket.emit('competitive:userConnected', userData);
    }

    return () => {};
  }, [socket, userData]);

  const onWordKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const spaceKeyString = ' ';
    // console.log(e.key, e.currentTarget.value);
    if (e.key === spaceKeyString && typeof words !== 'undefined') {
      if (activeWord + ' ' === e.currentTarget.value) {
        wordRef.current[activeWordIndex].className = 'bg-green-300 text-[18px] px-2';
      } else {
        wordRef.current[activeWordIndex].className = 'bg-red-300 text-[18px] px-2';
      }
      inputRef.current.value = '';
      wordRef.current[activeWordIndex + 1].className = 'bg-yellow-300 text-[18px] px-2';

      if (activeWordIndex === 0) {
        wordRef.current[activeWordIndex].classList.remove('bg-yellow-300');
      }

      setActiveWord(words[activeWordIndex + 1]);
      setActiveWordIndex((old) => old + 1);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="status"></div>
      <div
        className={`${
          !isWordsReady ? 'h-[350px]' : 'h-[250px]'
        } game-area relative flex justify-center items-center border border-gray-400 rounded-lg p-4 transition-all`}
      >
        {!isWordsReady ? (
          <CompetitiveLoader step={step} />
        ) : (
          <div className="h-full flex flex-col pb-[25px]">
            <div className="words h-full flex flex-wrap overflow-hidden">
              {words &&
                words.map((word, index) => (
                  <span
                    ref={(el) => (wordRef.current[index] = el)}
                    className={`${index === 0 ? 'bg-yellow-300' : ''} text-[18px] px-2`}
                    key={index}
                  >
                    {word}
                  </span>
                ))}
            </div>
            <input
              type="text"
              className="w-full absolute bottom-0 left-0 border rounded-br-lg rounded-bl-lg border-gray-400 py-1 px-2"
              placeholder="Enter to selected word"
              onKeyUp={onWordKeyDown}
              ref={inputRef}
            />
          </div>
        )}
      </div>
    </div>
  );
}
