'use client';
import React, { KeyboardEvent, useEffect, useRef, useState } from 'react';
import CompetitiveStat from '../../../stats/game.stats';
import GeneralCountdown from '../../../countdown/general.countdown';
import { useRouter } from 'next/navigation';
import { Socket } from 'socket.io-client';
import { IMatcherRoomData } from '@/src/interfaces/socket/matcher.interface';
import {
  ICompetitiveGameInformations,
  ICompetitiveGameInformationsTimeouts,
} from '@/src/interfaces/socket/competitive.interface';
import CompetitiveGameFinished from './finish.screen';
import { toast } from 'react-hot-toast';

interface IProps {
  socket: Socket;
  queueData: IMatcherRoomData;
}

export default function CompetitiveGameScreen({ socket, queueData }: IProps) {
  //? Hooks
  const router = useRouter();

  //? Game states
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [isCountdownAccess, setIsCountdownAccess] = useState<boolean>(false);
  const [isGameFinished, setIsGameFinished] = useState<boolean>(false);
  const [timeouts, setTimeouts] = useState<undefined | ICompetitiveGameInformationsTimeouts>(undefined);

  //? Word states
  const [words, setWords] = useState<string[]>([]);
  const [activeWord, setActiveWord] = useState<number>(0);
  const [correctWord, setCorrectWord] = useState<number>(0);
  const [incorrectWord, setIncorrectWord] = useState<number>(0);
  const [opponentCorrects, setOpponentCorrects] = useState<number>(0);
  const [totalWordWidthFromRow, setTotalWordWidthFromRow] = useState<number>(0);
  const [totalSlidedWordContainer, setTotalSlidedWordContainer] = useState<number>(0);

  //? Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const wordRef = useRef<HTMLSpanElement[]>([]);
  const wordContainerRef = useRef<HTMLDivElement>(null);

  //? Input onkeydown event
  const checkWord = (e: KeyboardEvent): void => {
    if (!isGameStarted) return;

    const isPressedSpace = e.key === ' ';
    const target = e.target as HTMLInputElement;

    if (!isPressedSpace) {
      checkLetter(target);
    }

    if (isPressedSpace && inputRef.current !== null) {
      checkRow();
      removeActiveWordClassList();
      if (wordRef.current[activeWord].innerText === target.value.split(' ')[0]) {
        wordRef.current[activeWord].classList.add('bg-green-600');
        setCorrectWord((old) => old + 1);
        socket.emit('competitive:correct-word', queueData);
      } else {
        wordRef.current[activeWord].classList.add('bg-red-600');
        setIncorrectWord((old) => old + 1);
        socket.emit('competitive:incorrect-word', queueData);
      }
      inputRef.current.value = target.value.split(' ')[1];
      setActiveWord((old) => old + 1);
      setActiveWordClassList();
    }
  };

  const setMistakeLetter = (
    writtenLetterIndex: number,
    targetLastLetter: string,
    word: string,
    writtenLastLetter: string
  ) => {
    socket.emit('competitive:mistake-letter', {
      word,
      mistake: {
        expectedLetter: targetLastLetter,
        writtenLetter: writtenLastLetter,
        letterIndex: writtenLetterIndex,
      },
      matchData: queueData,
    });
  };

  const checkLetter = (target: HTMLInputElement): void => {
    const writtenLetterIndex = target.value.length - 1;
    const writtenLastLetter = target.value.charAt(writtenLetterIndex);
    const word = wordRef.current[activeWord];
    const targetLastLetter = word.innerText.charAt(writtenLetterIndex);

    if (writtenLastLetter !== targetLastLetter && targetLastLetter) {
      setMistakeLetter(writtenLetterIndex, targetLastLetter, word.innerText, writtenLastLetter);
    }
  };

  const checkRow = () => {
    const activeWordWidth = wordRef.current[activeWord].clientWidth;

    if (wordContainerRef.current && activeWordWidth + totalWordWidthFromRow > wordContainerRef.current.clientWidth) {
      wordContainerRef.current.style.transform = `translateY(-${(totalSlidedWordContainer + 1) * 32}px)`;
      setTotalSlidedWordContainer((old) => old + 1);
      setTotalWordWidthFromRow(0);
    } else {
      setTotalWordWidthFromRow((old) => old + activeWordWidth);
    }
  };

  const setActiveWordClassList = () => {
    if (wordRef.current[activeWord + 1]) {
      wordRef.current[activeWord + 1].classList.add('bg-gray-100');
      wordRef.current[activeWord + 1].classList.add('text-black');
    } else {
      //TODO: All words completed..
    }
  };

  const removeActiveWordClassList = () => {
    wordRef.current[activeWord].classList.remove('bg-gray-100');
  };

  const refCreator = (el: HTMLSpanElement | null, i: number) => {
    if (el) {
      wordRef.current[i] = el;
    }
  };

  useEffect(() => {
    function onGameInformations(data: ICompetitiveGameInformations) {
      setWords(data.words);
      setTimeouts(data.timeouts);
    }

    function onPreCountdownStartable() {
      setIsCountdownAccess(true);
    }

    function onGameStarted() {
      setIsCountdownAccess(false);
      setIsGameStarted(true);
    }

    function onUpdateOpponentCorrects(corrects: number) {
      setOpponentCorrects(corrects);
    }

    function onGameFinished() {
      setIsGameStarted(false);
      setIsGameFinished(true);
    }

    function onOpponentLeft() {
      toast.success('The opponent left the match');
      setIsGameStarted(false);
      setIsGameFinished(true);
    }

    function onRedirectPlayers(matchId: string) {
      window.location.href = `/result/${matchId}`;
    }

    if (socket && typeof socket !== 'undefined') {
      //? Competitive game screen loaded emitter
      socket.emit('competitive:game-screen-loaded', queueData);

      //? Competitive fire start countdown event listener
      socket.on('competitive:game-informations', onGameInformations);

      //? Competitive pre countdown startable event listener
      socket.on('competitive:pre-countdown-startable', onPreCountdownStartable);

      //? Competitive game started event listener
      socket.on('competitive:game-started', onGameStarted);

      //? Competitive update opponent corrects event listener
      socket.on('competitive:update-opponent-corrects', onUpdateOpponentCorrects);

      //? Competitive game finished event listener
      socket.on('competitive:game-ended', onGameFinished);

      //? Competitive opponent left event listener
      socket.on('competitive:opponent-left', onOpponentLeft);

      //? Competitive redirect players event listener
      socket.on('competitive:redirect-players', onRedirectPlayers);
    }
  }, [socket]);

  const onCountdownEnded = () => {
    // router.push(`/result?mi=333`);
  };

  return (
    <div className="relative">
      <div className={!isGameStarted ? 'relative blur select-none' : ''}>
        <CompetitiveStat correct={correctWord} incorrect={incorrectWord} opponentCorrects={opponentCorrects} />
        {typeof timeouts !== 'undefined' && (
          <div className="border-t border-gray-800 p-3">
            <GeneralCountdown
              seconds={timeouts.finish / 1000}
              withProgressBar
              onCountdownEnded={onCountdownEnded}
              isWaitProtocol={!isGameStarted}
            />
          </div>
        )}
        <div>
          <div className="max-h-[255px] overflow-hidden p-5 mb-4">
            <div ref={wordContainerRef} className="flex flex-wrap">
              {words.length > 0 ? (
                words.map((word, wIndex) => (
                  <span
                    className={`py-1 px-2 ${0 === wIndex ? 'bg-gray-100 text-black' : ''} select-none`}
                    key={wIndex}
                    ref={(el) => refCreator(el, wIndex)}
                    onCopy={() => {
                      return false;
                    }}
                  >
                    {word}
                  </span>
                ))
              ) : (
                <div className="flex items-center mx-auto">
                  <span className="loading loading-lg"></span>
                </div>
              )}
            </div>
          </div>
          <div className="w-full">
            <input ref={inputRef} type="text" className="w-full p-1 rounded-bl rounded-br" onKeyUp={checkWord} />
          </div>
        </div>
      </div>
      {isGameFinished && !isGameStarted && <CompetitiveGameFinished />}
      {!isGameStarted && typeof timeouts !== 'undefined' && isCountdownAccess && (
        <div className="absolute top-2/4 left-2/4 -translate-x-1/2 -translate-y-1/2 text-2xl">
          <GeneralCountdown seconds={timeouts.startCountdown / 1000} />
        </div>
      )}
    </div>
  );
}
