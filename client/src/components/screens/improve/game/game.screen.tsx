'use client';

import { GeneralGameStat } from '@/src/components/charts/stats/general.stats';
import GeneralCountdown from '@/src/components/countdown/general.countdown';
import { useAppDispatch, useAppSelector } from '@/src/hooks/redux/hook';
import {
  ICompetitiveIncorrectDetail,
  ICompetitiveIncorrectLetter,
} from '@/src/interfaces/socket/competitive.interface';
import { changeRestartRequest } from '@/src/redux/features/improve/improve.slice';
import { generateWord } from '@/src/utils/helper';
import { ChangeEvent, FocusEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { BsCapslock } from 'react-icons/bs';
import { LuMousePointerClick } from 'react-icons/lu';

interface IProps {
  onCorrect?: Function;
  onIncorrect?: Function;
  onFinished?: Function;
}

export default function ImproveGameScreen(props: IProps) {
  //? Hooks
  const dispatch = useAppDispatch();

  //? Store Selectors
  const time: number = useAppSelector((store) => store.improveReducer.time);
  const wordsLength: number = useAppSelector((store) => store.improveReducer.words);
  const isTime: boolean = useAppSelector((store) => store.improveReducer.isTime);
  const restartRequest = useAppSelector((e) => e.improveReducer.restartRequest);

  //? Refs
  const wordContainer = useRef<HTMLDivElement>(null);
  const wordInput = useRef<HTMLInputElement>(null);
  const wordsRef = useRef<HTMLDivElement[]>([]);
  const lettersRef = useRef<HTMLSpanElement[][]>([]);
  const caretDiv = useRef<HTMLDivElement>(null);

  //? Game States
  const [timer, setTimer] = useState<number>(time);
  const [startedTime, setStartedTime] = useState<Date | undefined>(undefined);
  const [endedTime, setEndedTime] = useState<Date | undefined>(undefined);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [isPlayerStarted, setIsPlayerStarted] = useState<boolean>(false);

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

  //? Statistics
  const [corrects, setCorrects] = useState<number>(0);
  const [incorrects, setIncorrects] = useState<number>(0);
  const [mistakes, setMistakes] = useState<ICompetitiveIncorrectLetter>({});

  //? Events
  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isStarted && !isEnded) setIsStarted(true);
  };

  const checkIgnoredKeys = (e: KeyboardEvent) => {
    return e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || e.key === 'CapsLock';
  };

  const checkCapsLock = (e: globalThis.KeyboardEvent) => {
    if (e.getModifierState('CapsLock')) {
      setIsCapsLockOn(true);
    } else {
      setIsCapsLockOn(false);
    }
  };

  const updateMistakeStat = (
    writtenLetterIndex: number,
    targetLastLetter: string,
    word: string,
    writtenLastLetter: string
  ) => {
    setMistakes((mistakes) => {
      const _mistake = mistakes;
      const newMistake: ICompetitiveIncorrectDetail = {
        expectedLetter: targetLastLetter,
        writtenLetter: writtenLastLetter,
        letterIndex: writtenLetterIndex,
      };
      if (mistakes[word]) {
        _mistake[word].push(newMistake);
      } else {
        _mistake[word] = [newMistake];
      }

      return _mistake;
    });
  };

  const updateIncorrectStat = () => {
    setIncorrects((old) => old + 1);
  };

  const updateCorrectStat = () => {
    setCorrects((old) => old + 1);
  };

  const onKeyDownInput = (e: KeyboardEvent) => {
    if (!isPlayerStarted) {
      setIsPlayerStarted(true);
      setStartedTime(new Date());
    }

    if (isEnded && !isStarted) {
      e.preventDefault();
      return;
    }
    const isPressedSpace = e.key === ' ';
    const target = e.target as HTMLInputElement;
    const isIgnoredKey = checkIgnoredKeys(e);

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
        let isNextWordProcedure = false;
        const caretYStatus = activeWord === words.length - 1 ? undefined : caretYCalculator();
        if (wordsRef.current[activeWord].innerText.trim() === target.value.trim()) {
          updateCorrectStat();
        } else {
          wordsRef.current[activeWord].classList.add('underline');
          wordsRef.current[activeWord].classList.add('decoration-red-600');
          wordsRef.current[activeWord].classList.add('incorrect-word');
          updateIncorrectStat();
          if (caretYStatus !== 'new-line') {
            caretXCalculator('next-word');
            isNextWordProcedure = true;
          }
        }

        if (activeWord === words.length - 1) {
          setIsEnded(true);
          if (typeof endedTime === 'undefined') {
            setEndedTime(new Date());
          }
          typeof props.onFinished !== 'undefined' && props.onFinished();
          return;
        } else {
          setActiveLetter(0);
          setActiveWord((old) => old + 1);
          //@ts-ignore
          wordInput.current.value = '';
          if (caretYStatus !== 'new-line' && !isNextWordProcedure) {
            caretXCalculator('spacing');
          }
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
          } else {
            lettersRef.current[activeWord][activeLetter].classList.add('!text-error');
            updateMistakeStat(
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
      containerWidth >=
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

  const resetOptions = () => {
    lettersRef.current = [];
    wordsRef.current = [];
    if (wordInput.current) {
      wordInput.current.value = '';
    }
    setIsEnded(false);
    setIsPlayerStarted(false);
    setStartedTime(undefined);
    setEndedTime(undefined);
    setCorrects(0);
    setIncorrects(0);
    setMistakes({});
    setActiveWord(0);
    setActiveLetter(0);
    setCaretYPos(0);
    setCaretWordCalculator(0);
    setCaretXPos(0);
  };

  const getWords = useCallback(() => {
    const wordsReq = generateWord('en', wordsLength);
    resetOptions();
    setWords(wordsReq);
    setIsStarted(true);
  }, [wordsLength]);

  const onCountdownEnded = () => {
    setIsEnded(true);
    if (typeof endedTime === 'undefined') {
      setEndedTime(new Date());
    }
    typeof props.onFinished !== 'undefined' && props.onFinished();
  };

  useEffect(() => {
    if (wordInput.current) wordInput.current.focus();
  }, [wordInput]);

  useEffect(() => {
    setIsStarted(false);
    getWords();
  }, [getWords, wordsLength]);

  useEffect(() => {
    if (isTime) {
      if (isPlayerStarted) {
        setIsStarted(false);
        getWords();
      }
      setTimer(time);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTime, time]);

  useEffect(() => {
    if (restartRequest) {
      const wordsReq = generateWord('en', wordsLength);
      resetOptions();
      setWords(wordsReq);
      setIsStarted(true);
      dispatch(changeRestartRequest(false));
      if (wordInput.current) {
        wordInput.current.focus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restartRequest]);

  useEffect(() => {
    document.addEventListener('keyup', checkCapsLock);
    document.addEventListener('keydown', checkCapsLock);
  }, []);

  return (
    <div className="w-full relative">
      {!isEnded && isStarted && (
        <>
          <div className="caps-lock-status w-full absolute -top-[100%] translate-y-1/2 md:-top-[100%]">
            {isCapsLockOn && (
              <div className="alert alert-warning">
                <BsCapslock size={20} />
                <span>Warning: Caps Lock Active</span>
              </div>
            )}
          </div>
          <div className="word-tracker flex">
            <span className="current">{activeWord + 1}</span>
            <span>/</span>
            <span className="max">{wordsLength}</span>
          </div>
          <div className="relative">
            <div
              ref={caretDiv}
              className={`caret-tracker caret-animation ${!isStarted ? 'not-started' : ''} absolute`}
              style={{ top: `${0}px`, left: `${caretXPos}px` }}
            >
              |
            </div>
            <input
              ref={wordInput}
              type="text"
              className="pointer-events-none absolute z-[-1] cursor-default opacity-0"
              onKeyDown={onKeyDownInput}
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
                      <span key={word + wIndex + lIndex} ref={(el) => letterRefCreator(el, wIndex, lIndex)}>
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
          {isTime && (
            <GeneralCountdown
              seconds={timer}
              onCountdownEnded={onCountdownEnded}
              withProgressBar
              isWaitProtocol={!isPlayerStarted}
              refresh={restartRequest}
            />
          )}
        </>
      )}
      {startedTime && endedTime && isEnded && (
        <GeneralGameStat
          wordsTyped={activeWord === 0 ? 0 : activeWord + 1}
          startTime={startedTime}
          endTime={endedTime}
          corrects={corrects}
          incorrects={incorrects}
          mistakes={mistakes}
        />
      )}
    </div>
  );
}
