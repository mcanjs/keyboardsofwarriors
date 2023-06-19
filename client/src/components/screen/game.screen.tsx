'use client';
import React, { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { words as fakeWords } from '@/src/json/fake/word.json';
import CompetitiveStat from '../stats/game.stats';
import GeneralCountdown from '../countdown/general.countdown';

export default function CompetitiveGameScreen() {
  //? Game states
  const [isGameStarted, setIsGameStarted] = useState<boolean>(true);

  //? Word states
  const [words, setWords] = useState<string[]>([]);
  const [activeWord, setActiveWord] = useState<number>(0);
  const [correctWord, setCorrectWord] = useState<number>(0);
  const [incorrectWord, setIncorrectWord] = useState<number>(0);
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

    if (isPressedSpace && inputRef.current !== null) {
      console.log('Target :', target.value.substring(0, target.value.length - 1));
      console.log('Word :', wordRef.current[activeWord].innerText);

      checkRow();
      removeActiveWordClassList();
      if (wordRef.current[activeWord].innerText === target.value.split(' ')[0]) {
        wordRef.current[activeWord].classList.add('bg-green-600');
        setCorrectWord((old) => old + 1);
      } else {
        wordRef.current[activeWord].classList.add('bg-red-600');
        setIncorrectWord((old) => old + 1);
      }
      inputRef.current.value = target.value.split(' ')[1];
      setActiveWord((old) => old + 1);
      setActiveWordClassList();
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
    wordRef.current[activeWord + 1].classList.add('bg-gray-100');
    wordRef.current[activeWord + 1].classList.add('text-black');
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
    setWords(fakeWords);
  }, []);

  const onCountdownEnded = () => {

  }

  return (
    <div className={!isGameStarted ? 'relative blur select-none' : ''}>
      <CompetitiveStat correct={correctWord} incorrect={incorrectWord} />
      <div className="border-t border-gray-800 p-3">
        <GeneralCountdown seconds={60} withProgressBar onCountdownEnded={onCountdownEnded} />
      </div>
      <div>
        <div className="max-h-[255px] overflow-hidden p-5 mb-4">
          <div ref={wordContainerRef} className="flex flex-wrap">
            {words.length > 0 ? (
              words.map((word, wIndex) => (
                <span
                  className={`py-1 px-2 ${0 === wIndex ? 'bg-gray-100 text-black' : ''}`}
                  key={wIndex}
                  ref={(el) => refCreator(el, wIndex)}
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
  );
}
