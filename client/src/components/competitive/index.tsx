import React, { KeyboardEvent, LegacyRef, MutableRefObject, useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import CompetitiveLoader from './loader';
import { ISocketCompetitiveUserConnected } from '@/src/interfaces/socket.interfaces';
import { toast } from 'react-hot-toast';
import { useAppDispatch } from '@/src/hooks/redux/hook';
import { changeIsMatchFounded, changeIsUserAccepted } from '@/src/redux/features/matchmakingSlice';
import CompetitiveStartingModal from '../modals/competitiveStartingModal';

interface IProps {
  socket: Socket;
  userData: ISocketCompetitiveUserConnected;
}

export default function Competitive(props: IProps) {
  const dispatch = useAppDispatch();

  const { socket, userData } = props;

  //? Competitive statements
  const [isCompetitivePlayable, setIsCompetitivePlayable] = useState<boolean>(false);

  //? Competitive loader statements
  const [step, setStep] = useState<number>(1);

  //? Competitive starting modal statements
  const [isCompetitiveWaitingForStart, setIsCompetitiveWaitingForStart] = useState<boolean>(false);

  //? Opponent statements
  const [isOpponentReady, setIsOpponentReady] = useState<boolean>(false);
  const [opponentSocketId, setOpponentSocketId] = useState<string | undefined>(undefined);
  const [opponentTotalCorrect, setOpponentTotalCorrect] = useState<number>(0);

  //? Words statements
  const [isWordsReady, setIsWordsReady] = useState<boolean>(false);
  const [words, setWords] = useState<string[] | undefined>(undefined);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);
  const [activeWord, setActiveWord] = useState<undefined | string>(undefined);
  const [completedWordsWidth, setCompletedWordsWidth] = useState<number>(0);
  const [transitionCount, setTransitionCount] = useState<number>(1);
  const [totalWrong, setTotalWrong] = useState<number>(0);
  const [totalCorrect, setTotalCorrect] = useState<number>(0);

  //? Refs
  const wordRef = useRef<any>([]);
  const inputRef = useRef<any>(undefined);
  const wordContainerRef = useRef<any>(undefined);

  useEffect(() => {
    function onCompetitiveWords(data: string[]) {
      setWords(data);
      setActiveWord(data[0]);
      wordRef.current = wordRef.current.slice(0, data.length);
      setIsWordsReady(true);
      setIsCompetitiveWaitingForStart(true);
      setStep((old) => old + 1);
    }

    function onCompetitiveOpponentId(data: string) {
      console.log('Opponent socket id : ', data);
      setOpponentSocketId(data);
    }

    function onCompetitiveOpponentReady(data: boolean) {
      setIsOpponentReady(data);
      setStep((old) => old + 1);
    }

    function onCompetitiveOpponentCorrect(data: number) {
      setOpponentTotalCorrect(data);
    }

    function onCompetitiveOpponentLeft() {
      toast.error('Competitive canceled because opponent left the game, you are automatically redirecting...', {
        duration: Infinity,
      });
    }

    if (typeof socket !== 'undefined' && typeof userData !== 'undefined') {
      //? Competitive event listeners
      socket.on('competitive:words', onCompetitiveWords);
      socket.on('competitive:opponentId', onCompetitiveOpponentId);
      socket.on('competitive:opponentReady', onCompetitiveOpponentReady);
      socket.on('competitive:opponentCorrect', onCompetitiveOpponentCorrect);
      socket.on('competitive:opponentLeft', onCompetitiveOpponentLeft);

      //? Competitive emitters
      socket.emit('competitive:userConnected', userData);

      dispatch(changeIsMatchFounded(false));
      dispatch(changeIsUserAccepted(false));
    }

    return () => {
      socket.off('competitive:words', onCompetitiveWords);
      socket.off('competitive:opponentId', onCompetitiveOpponentId);
      socket.off('competitive:opponentReady', onCompetitiveOpponentReady);
      socket.off('competitive:opponentCorrect', onCompetitiveOpponentCorrect);
      socket.off('competitive:opponentLeft', onCompetitiveOpponentLeft);
    };
  }, [socket, userData]);

  const onWordKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const spaceKeyString = ' ';
    const val = e.currentTarget.value;

    if (e.key === spaceKeyString && typeof words !== 'undefined') {
      console.log(val);

      inputRef.current.value = val.split(' ')[1];
      if (activeWord + ' ' === val) {
        wordRef.current[activeWordIndex].className = 'bg-green-300 text-[18px] px-2';
        setTotalCorrect((old) => old + 1);
        socket.emit('competitive:correctNotify', { opponentSocketId, totalCorrect: totalCorrect + 1 });
      } else {
        wordRef.current[activeWordIndex].className = 'bg-red-300 text-[18px] px-2';
        setTotalWrong((old) => old + 1);
      }
      wordRef.current[activeWordIndex + 1].className = 'bg-yellow-300 text-[18px] px-2';

      if (activeWordIndex === 0) {
        wordRef.current[activeWordIndex].classList.remove('bg-yellow-300');
      }

      if (completedWordsWidth + 45 > wordContainerRef.current.clientWidth) {
        wordContainerRef.current.style.transform = `translateY(-${27 * transitionCount}px)`;
        setTransitionCount((old) => old + 1);
        setCompletedWordsWidth(0);
      }

      setCompletedWordsWidth((old) => old + wordRef.current[activeWordIndex].offsetWidth);
      setActiveWord(words[activeWordIndex + 1]);
      setActiveWordIndex((old) => old + 1);
    }
  };

  const onStartingCountdownEnded = () => {
    setIsCompetitivePlayable(true);
    setIsCompetitiveWaitingForStart(false);
    inputRef.current.focus();
  };

  return (
    <div className="container relative mx-auto">
      {isWordsReady && (
        <div className="mx-auto max-w-screen-xl pb-5">
          <div className="mt-8 sm:mt-12">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col rounded-lg bg-red-100 px-4 py-8 text-center">
                <dt className="text-lg font-medium text-red-500">Total Wrongs</dt>

                <dd className="text-4xl font-extrabold text-red-600 md:text-5xl">{totalWrong}</dd>
              </div>

              <div className="flex flex-col rounded-lg bg-green-100 px-4 py-8 text-center">
                <dt className="text-lg font-medium text-green-500">Total Corrects</dt>

                <dd className="text-4xl font-extrabold text-green-600 md:text-5xl">{totalCorrect}</dd>
              </div>

              <div className="flex flex-col rounded-lg bg-gray-100 px-4 py-8 text-center">
                <dt className="text-lg font-medium text-gray-500">Opponent Corrects</dt>

                <dd className="text-4xl font-extrabold text-gray-600 md:text-5xl">{opponentTotalCorrect}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
      <div
        className={`${
          !isWordsReady ? 'h-[350px]' : 'h-[250px]'
        } game-area relative flex justify-center items-center border border-gray-400 rounded-lg p-4 transition-all`}
      >
        {!isWordsReady ? (
          <CompetitiveLoader step={step} />
        ) : (
          <div className="h-full flex flex-col pb-[25px]">
            <div className="words h-full overflow-hidden">
              <div ref={wordContainerRef} className="h-full flex flex-wrap transition-all">
                {words &&
                  words.map((word, index) => (
                    <span
                      className={`${index === 0 ? 'bg-yellow-300' : ''} text-[18px] px-2`}
                      ref={(el) => (wordRef.current[index] = el)}
                      key={index}
                    >
                      {word}
                    </span>
                  ))}
              </div>
            </div>
            <input
              type="text"
              className={` w-full absolute bottom-0 left-0 border rounded-br-lg rounded-bl-lg border-gray-400 py-1 px-2`}
              placeholder="Enter to selected word"
              onKeyUp={onWordKeyDown}
              ref={inputRef}
            />
          </div>
        )}
      </div>
      {isWordsReady && isCompetitiveWaitingForStart && (
        <CompetitiveStartingModal onCountdownEnded={onStartingCountdownEnded} />
      )}
    </div>
  );
}
