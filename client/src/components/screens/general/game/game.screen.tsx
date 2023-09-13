'use client';

import { ChangeEvent, FocusEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { BsCapslock } from 'react-icons/bs';
import { LuMousePointerClick } from 'react-icons/lu';

interface IProps {
  words: string[];
  onCorrect?: Function;
  onIncorrect?: Function;
}

export default function GeneralGameScreen(props: IProps) {
  //? Refs
  const wordContainer = useRef<HTMLDivElement>(null);
  const wordInput = useRef<HTMLInputElement>(null);
  const wordsRef = useRef<HTMLDivElement[]>([]);
  const lettersRef = useRef<HTMLSpanElement[][]>([]);
  const caretDiv = useRef<HTMLDivElement>(null);

  //? Game States
  const [isStarted, setIsStarted] = useState<boolean>(false);

  //? Word States
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
    if (!isStarted) setIsStarted(true);
    activeWord;
  };

  const checkIgnoredKeys = (e: KeyboardEvent) => {
    return e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || e.key === 'CapsLock';
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
        let isNextWordProcedure = false;
        const caretYStatus = caretYCalculator();
        if (wordsRef.current[activeWord].innerText.trim() === target.value.trim()) {
          typeof props.onCorrect !== 'undefined' && props.onCorrect();
        } else {
          wordsRef.current[activeWord].classList.add('underline');
          wordsRef.current[activeWord].classList.add('decoration-red-600');
          wordsRef.current[activeWord].classList.add('incorrect-word');
          typeof props.onIncorrect !== 'undefined' && props.onIncorrect();
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
          } else {
            lettersRef.current[activeWord][activeLetter].classList.add('!text-error');
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

  return (
    <div className="relative">
      <div className="caps-lock-status w-full absolute -top-[100%] translate-y-1/2 md:-top-[60%]">
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
        <span className="max">{props.words.length}</span>
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
          onKeyUp={checkCapsLock}
          onChange={onChangeInput}
          onFocus={onFocusInput}
          onBlur={onBlurInput}
          autoCapitalize="false"
          autoComplete="false"
          autoCorrect="false"
        />
        <div className="max-h-[150px] overflow-hidden">
          <div
            className={`${willBeFocus ? 'blur-sm' : ''} word-container flex flex-wrap`}
            onClick={onClickWordContainer}
            ref={wordContainer}
            style={{ transform: `translateY(-${caretYPos}px)` }}
          >
            {props.words.map((word, wIndex) => (
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
    </div>
  );
}
