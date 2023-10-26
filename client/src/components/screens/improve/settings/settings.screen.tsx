'use client';

import { useAppDispatch, useAppSelector } from '@/src/hooks/redux/hook';
import { ChangeEvent, useState } from 'react';
import { FaCog, FaRedo } from 'react-icons/fa';
import {
  changeWords,
  changeIsTime,
  changeTime,
  changeRestartRequest,
} from '@/src/redux/features/improve/improve.slice';

export default function ImproveSettingsScreen() {
  const dispatch = useAppDispatch();
  const [words] = useState<number[]>([50, 100, 150, 200, 250, 300, 350, 400, 450, 500]);
  const [times] = useState<number[]>([60, 120, 180, 240, 300]);
  const isTime = useAppSelector((e) => e.improveReducer.isTime);
  const time = useAppSelector((e) => e.improveReducer.time);

  const onChangeWordsLength = (e: ChangeEvent<HTMLSelectElement>) => {
    const wLength: number = parseInt(e.target.value);
    if (words.includes(wLength)) {
      dispatch(changeWords(wLength));
    }
  };

  const onChangeIsTime = (val: boolean) => {
    dispatch(changeIsTime(val));
  };

  const onChangeTime = (val: number) => {
    const result = times[val / (5 * times.length)];

    dispatch(changeTime(result));
  };

  const calcDefVal = () => {
    return times.indexOf(time) * 25;
  };

  const onClickRestartGame = () => {
    dispatch(changeRestartRequest(true));
  };

  return (
    <div className="drawer">
      <input id="options-change" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content mt-5 mx-auto">
        <label htmlFor="options-change" className="btn btn-ghost drawer-button">
          <FaCog size={20} />
          <span>Change Options</span>
        </label>
        <button className="btn btn-ghost drawer-button" onClick={onClickRestartGame}>
          <FaRedo size={20} />
          <span>Restart Game</span>
        </button>
      </div>
      <div className="drawer-side mt-[80px]">
        <label htmlFor="options-change" className="drawer-overlay"></label>
        <div className="min-w-[300px] min-h-full py-5 bg-base-200">
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
              defaultValue={words[0]}
            >
              {words.map((n, i) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div
            className={`${!isTime ? 'border-b' : ''} flex justify-between items-center py-3 px-3  border-b-slate-500`}
          >
            <label id="word-select" className="cursor-pointer label">
              <span className="label-text">Time</span>
              <span className="label-text">:</span>
            </label>
            <input
              type="checkbox"
              className="toggle toggle-accent"
              checked={isTime}
              onChange={(e) => onChangeIsTime(e.currentTarget.checked)}
            />
          </div>
          {isTime && (
            <div className="p-3 border-b border-b-slate-500 text-center">
              <input
                type="range"
                min={0}
                max="100"
                defaultValue={calcDefVal()}
                className="range range-sm"
                step="25"
                onChange={(e) => onChangeTime(parseInt(e.currentTarget.value))}
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
      </div>
    </div>
  );
}
