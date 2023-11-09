'use client';

import { ISocketCustomRoomParameters } from '@/src/interfaces/custom.interface';
import { IGameLanguages, IGameTimes, IGameWords } from '@/src/interfaces/game.interface';
import { ChangeEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface IProps {
  parameters: ISocketCustomRoomParameters;
  isEditable: boolean;
  onChange?: Function;
}

export default function CustomSettingsScreen(props: IProps) {
  const { parameters, isEditable } = props;
  const [language, setLanguage] = useState<IGameLanguages>(parameters.language);
  const [word, setWord] = useState<IGameWords>(parameters.words);
  const [time, setTime] = useState<IGameTimes>(parameters.time);
  const [words] = useState<number[]>([50, 100, 150, 200, 250, 300, 350, 400, 450, 500]);
  const [times] = useState<number[]>([60, 120, 180, 240, 300]);
  const [isTime, setIsTime] = useState<boolean>(parameters.isTime);

  useEffect(() => {
    if (parameters && !isEditable) {
      setLanguage(parameters.language);
      setWord(parameters.words);
      setTime(parameters.time);
      setIsTime(parameters.isTime);
      calcDefVal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parameters]);

  const onChangeWordsLength = (e: ChangeEvent<HTMLSelectElement>) => {
    const wLength: IGameWords = parseInt(e.target.value) as IGameWords;

    if (words.includes(wLength)) {
      setWord(wLength);
      if (props.onChange)
        props.onChange({
          language,
          words: wLength,
          time,
          isTime,
        });
    } else {
      toast.error('Not valid parameters please do not manually change the setting values');
    }
  };

  const onChangeIsTime = (val: boolean) => {
    setIsTime(val);
    if (props.onChange)
      props.onChange({
        language,
        words: word,
        time,
        isTime: val,
      });
  };

  const onChangeTime = (val: number) => {
    const result: IGameTimes = times[val / (5 * times.length)] as IGameTimes;
    setTime(result);
    if (props.onChange)
      props.onChange({
        language,
        words: word,
        time: result,
        isTime,
      });
  };

  const calcDefVal = () => {
    return times.indexOf(time) * 25;
  };

  return (
    <>
      <div className="border border-slate-500">
        <div className="flex justify-between items-center py-3 px-3 border-b border-b-slate-500">
          <label id="word-select" className="cursor-pointer label">
            <span className="label-text">Words</span>
            <span className="label-text">:</span>
          </label>
          <select
            name="word-select"
            id="word-select"
            className="select select-ghost focus:outline-none focus:bg-transparent"
            onChange={(e) => onChangeWordsLength(e)}
            value={word}
            disabled={!props.isEditable}
          >
            {words.map((n, i) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className={`${!isTime ? '' : ''} flex justify-between items-center py-3 px-3  border-b-slate-500`}>
          <label id="word-select" className="cursor-pointer label">
            <span className="label-text">Time</span>
            <span className="label-text">:</span>
          </label>
          <input
            type="checkbox"
            className="toggle toggle-accent"
            checked={isTime}
            onChange={(e) => onChangeIsTime(e.currentTarget.checked)}
            disabled={!props.isEditable}
          />
        </div>
        {isTime && (
          <div className="p-3 text-center">
            <input
              type="range"
              min={0}
              max="100"
              value={calcDefVal()}
              className="range range-sm"
              step="25"
              onChange={(e) => onChangeTime(parseInt(e.currentTarget.value))}
              disabled={!props.isEditable}
            />
            <div className="w-full flex justify-between text-xs px-2">
              {times.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <small className="text-xs">Seconds</small>
          </div>
        )}
      </div>
      {!props.isEditable && (
        <small className="text-xs text-warning">*You can not change settings, only room owner can change</small>
      )}
    </>
  );
}
