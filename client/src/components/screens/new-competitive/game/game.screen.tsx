'use client';

import GeneralCountdown from '@/src/components/countdown/general.countdown';
import CompetitiveStat from '@/src/components/stats/game.stats';
import {
  ICompetitiveGameInformations,
  ICompetitiveGameInformationsTimeouts,
} from '@/src/interfaces/socket/competitive.interface';
import { IMatcherRoomData } from '@/src/interfaces/socket/matcher.interface';
import { ChangeEvent, FocusEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { BsCapslock } from 'react-icons/bs';
import { LuMousePointerClick } from 'react-icons/lu';
import { Socket } from 'socket.io-client';
import CompetitiveGameFinished from './finish.screen';

interface IProps {
  socket: Socket;
  queueData: IMatcherRoomData;
}

export default function CompetitiveGameScreen({ socket, queueData }: IProps) {
  //? Refs
  const wordContainer = useRef<HTMLDivElement>(null);
  const wordInput = useRef<HTMLInputElement>(null);
  const wordsRef = useRef<HTMLDivElement[]>([]);
  const lettersRef = useRef<HTMLSpanElement[][]>([]);
  const caretDiv = useRef<HTMLDivElement>(null);

  //? Game states
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [timeouts, setTimeouts] = useState<undefined | ICompetitiveGameInformationsTimeouts>(undefined);
  const [isCountdownAccess, setIsCountdownAccess] = useState<boolean>(false);
  const [isGameFinished, setIsGameFinished] = useState<boolean>(false);
  const [correctWord, setCorrectWord] = useState<number>(0);
  const [incorrectWord, setIncorrectWord] = useState<number>(0);
  const [opponentCorrects, setOpponentCorrects] = useState<number>(0);

  //? Word States
  const [words, setWords] = useState<string[]>([]);
  const [activeWord, setActiveWord] = useState<number>(0);
  const [activeLetter, setActiveLetter] = useState<number>(0);

  //? Caret States
  const [caretXPos, setCaretXPos] = useState<number>(0);
  const [caretYPos, setCaretYPos] = useState<number>(0);
  const [caretWordCalculator, setCaretWordCalculator] = useState<number>(0);

  //? Warns
  const [isCapsLockOn, setIsCapsLockOn] = useState<boolean>(false);
  const [willBeFocus, setWillBeFocus] = useState<boolean>(false);

  //? Events
  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isGameStarted) setIsGameStarted(true);
    activeWord;
  };

  const checkIgnoredKeys = (e: KeyboardEvent) => {
    return e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || e.key === 'CapsLock';
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

  const checkCapsLock = (e: KeyboardEvent) => {
    if (e.getModifierState('CapsLock')) {
      setIsCapsLockOn(true);
    } else {
      setIsCapsLockOn(false);
    }
  };

  const onKeyDownInput = (e: KeyboardEvent) => {
    const isPressedSpace = e.key === ' ';
    const target = e.target as HTMLInputElement;
    const isIgnoredKey = checkIgnoredKeys(e);

    checkCapsLock(e);

    //? Ignored Keys
    if (isIgnoredKey) {
      e.preventDefault();
      return;
    }

    if (
      wordInput.current &&
      lettersRef.current &&
      wordInput.current.value.length > lettersRef.current[activeWord].length - (activeWord === 0 ? 1 : 0) &&
      !(e.key == 'Backspace' || e.key === ' ' || e.key == 'Del')
    ) {
      e.preventDefault();
    } else {
      if (isPressedSpace) {
        if (activeWord === words.length - 1) {
          //!TODO: GAME FINISHED
          return;
        }
        let isNextWordProcedure = false;
        const caretYStatus = caretYCalculator();
        if (wordsRef.current[activeWord].innerText.trim() === target.value.trim()) {
          setCorrectWord((old) => old + 1);
          socket.emit('competitive:correct-word', queueData);
        } else {
          wordsRef.current[activeWord].classList.add('underline');
          wordsRef.current[activeWord].classList.add('decoration-red-600');
          wordsRef.current[activeWord].classList.add('incorrect-word');
          setIncorrectWord((old) => old + 1);
          socket.emit('competitive:incorrect-word', queueData);
          if (caretYStatus !== 'new-line') {
            caretXCalculator('next-word');
            isNextWordProcedure = true;
          }
        }

        setActiveLetter(0);
        setActiveWord((old) => old + 1);
        //@ts-ignore
        wordInput.current.value = '';
        if (caretYStatus !== 'new-line' && !isNextWordProcedure) {
          caretXCalculator('spacing');
        }
      } else if (e.key === 'Backspace') {
        const condition = activeLetter - 1 !== 0 ? activeLetter - 1 : 0;
        if (lettersRef.current[activeWord][condition]) {
          setActiveLetter((old) => (old - 1 !== 0 ? old - 1 : 0));
          lettersRef.current[activeWord][condition].className = '';
        } else if (condition > 0) {
          setActiveLetter((old) => (old - 1 !== 0 ? old - 1 : 0));
        }
        caretXCalculator('delete');
      } else if (!isPressedSpace) {
        if (lettersRef.current[activeWord].length - 1 >= activeLetter) {
          if (lettersRef.current[activeWord][activeLetter].innerText === e.key) {
            lettersRef.current[activeWord][activeLetter].classList.add('!text-success');
            console.log('dogru');
          } else {
            console.log('yanlis');
            lettersRef.current[activeWord][activeLetter].classList.add('!text-error');
            setMistakeLetter(
              activeLetter,
              lettersRef.current[activeWord][activeLetter].innerText,
              wordsRef.current[activeWord].innerText,
              e.key
            );
          }
          setActiveLetter(activeLetter + 1);
          caretXCalculator('new');
        }
      }
    }
  };

  const onClickWordContainer = () => {
    if (wordInput && wordInput.current) {
      wordInput.current.focus();
    }
  };

  const caretXCalculator = (procedure: 'delete' | 'new' | 'spacing' | 'next-word') => {
    if (procedure === 'delete' && lettersRef.current[activeWord][activeLetter - 1 !== 0 ? activeLetter - 1 : 0]) {
      const w = lettersRef.current[activeWord][activeLetter - 1 !== 0 ? activeLetter - 1 : 0].offsetWidth;
      setCaretXPos((old) => old - w);
    } else if (procedure === 'new') {
      const w = lettersRef.current[activeWord][activeLetter].offsetWidth;
      setCaretXPos((old) => old + w);
    } else if (procedure !== 'delete' && wordsRef.current[activeWord + 1] && wordContainer.current) {
      const w =
        wordsRef.current[activeWord].getBoundingClientRect().left +
        wordsRef.current[activeWord].clientWidth -
        wordContainer.current.getBoundingClientRect().left;
      setCaretXPos(w);
    }
  };

  const caretYCalculator = () => {
    const containerWidth = wordContainer.current?.clientWidth;
    if (
      containerWidth &&
      containerWidth >
        caretWordCalculator + wordsRef.current[activeWord].clientWidth + wordsRef.current[activeWord + 1].clientWidth
    ) {
      setCaretWordCalculator((old) => old + wordsRef.current[activeWord].clientWidth);
    } else {
      setCaretWordCalculator(0);
      setCaretYPos((old) => old + 37);
      setCaretXPos(0);
      return 'new-line';
    }
  };

  const wordRefCreator = (el: HTMLDivElement | null, i: number) => {
    if (el) {
      wordsRef.current[i] = el;
    }
  };

  const letterRefCreator = (el: HTMLSpanElement | null, wordIndex: number, letterIndex: number) => {
    if (letterIndex === 0) {
      lettersRef.current[wordIndex] = [];
    }
    if (el) {
      lettersRef.current[wordIndex].push(el);
    }
  };

  const onFocusInput = (e: FocusEvent<HTMLInputElement, Element>) => {
    setWillBeFocus(false);
  };

  const onBlurInput = (e: FocusEvent<HTMLInputElement, Element>) => {
    setWillBeFocus(true);
  };

  useEffect(() => {
    if (wordInput.current) wordInput.current.focus();
  }, [wordInput]);

  useEffect(() => {
    function onGameInformations(data: ICompetitiveGameInformations) {
      setWords(data.words);
      setTimeouts(data.timeouts);
    }

    function onPreCountdownStartable() {
      setIsCountdownAccess(true);
      if (wordInput.current) {
        wordInput.current.focus();
      }
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

    return () => {
      socket.off('competitive:game-informations', onGameInformations);
      socket.off('competitive:pre-countdown-startable', onPreCountdownStartable);
      socket.off('competitive:game-started', onGameStarted);
      socket.off('competitive:update-opponent-corrects', onUpdateOpponentCorrects);
      socket.off('competitive:game-ended', onGameFinished);
      socket.off('competitive:opponent-left', onOpponentLeft);
      socket.off('competitive:redirect-players', onRedirectPlayers);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return (
    <div className="container mx-auto relative">
      <div className={`${!isGameStarted ? 'blur' : ''} relative select-none`}>
        <CompetitiveStat correct={correctWord} incorrect={incorrectWord} opponentCorrects={opponentCorrects} />
        {typeof timeouts !== 'undefined' && (
          <div className="border-t border-gray-800 p-3">
            <GeneralCountdown seconds={timeouts.finish / 1000} withProgressBar isWaitProtocol={!isGameStarted} />
          </div>
        )}
        <div className="word-tracker flex">
          <span className="current">{activeWord + 1}</span>
          <span>/</span>
          <span className="max">{words.length}</span>
        </div>
        <div className="relative">
          <div
            ref={caretDiv}
            className={`caret-tracker caret-animation ${!isGameStarted ? 'not-started' : ''} absolute`}
            style={{ top: `${0}px`, left: `${caretXPos}px` }}
          >
            |
          </div>
          <input
            ref={wordInput}
            type="text"
            className="pointer-events-none absolute z-[-1] cursor-default opacity-0"
            onKeyDown={onKeyDownInput}
            onKeyUp={checkCapsLock}
            onChange={onChangeInput}
            onFocus={onFocusInput}
            onBlur={onBlurInput}
            autoCapitalize="false"
            autoComplete="false"
            autoCorrect="false"
          />
          <div className="max-h-[150px] overflow-hidden" onClick={onClickWordContainer}>
            <div
              className={`${willBeFocus ? 'blur-sm' : ''} word-container flex flex-wrap`}
              ref={wordContainer}
              style={{ transform: `translateY(-${caretYPos}px)` }}
            >
              {words.map((word, wIndex) => (
                <div className="px-1 pb-1 text-[22px]" key={word + wIndex} ref={(el) => wordRefCreator(el, wIndex)}>
                  {word.split('').map((letter, lIndex) => (
                    <span
                      key={word + wIndex.toString() + lIndex.toString()}
                      ref={(el) => letterRefCreator(el, wIndex, lIndex)}
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {willBeFocus && (
            <div className="h-0 absolute top-1/2 left-1/2 flex gap-2 -mt-[20px] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <LuMousePointerClick size={35} />
              <span className="leading-[35px] text-lg">Click here to focus</span>
            </div>
          )}
        </div>
        <div className="caps-lock-status w-full absolute -bottom-[15%] translate-y-1/2">
          {isCapsLockOn && (
            <div className="alert alert-warning">
              <BsCapslock size={20} />
              <span>Warning: Caps Lock Active</span>
            </div>
          )}
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
