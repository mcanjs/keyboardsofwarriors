import { useAppDispatch, useAppSelector } from '@/src/hooks/redux/hook';
import { IMatchFoundedModalProps } from '@/src/interfaces/matchFoundedModal.interfaces';
import { changeIsMatchFounded, changeIsUserAccepted } from '@/src/redux/features/matchmakingSlice';
import React, { useEffect, useState } from 'react';

export default function MatchFoundModal(props: IMatchFoundedModalProps) {
  //? Props
  const {onCountdownEnded} = props;
  
  //? Hooks
  const dispatch = useAppDispatch();

  //? States
  const [countDown, setCountDown] = useState<number>(10);

  //? Store selectors
  const isUserAccepted = useAppSelector((state) => state.matchmakingReducer.isUserAccepted);

  //? Effects
  useEffect(() => {
    if (countDown <= 0) {
      dispatch(changeIsMatchFounded(false));
      if (onCountdownEnded) {
        onCountdownEnded();
      }
      return;
    }

    const interval = setInterval(() => {
      if (countDown > 0) setCountDown((old) => --old);
    }, 1000);
    return () => clearInterval(interval);
  }, [countDown]);

  const onAccepted = () => {
    dispatch(changeIsUserAccepted(true));
  };

  return (
    <div className="w-full h-full fixed top-0 left-0 flex justify-center items-center bg-slate-950 bg-opacity-50">
      <div className=" rounded-lg bg-white p-8 shadow-2xl min-w-[50%]">
        <h2 className="text-center text-lg font-bold">Match Founded</h2>
        <div>
          <span id="ProgressLabel" className="sr-only">
            Loading
          </span>

          <span role="progressbar" className="block rounded-full bg-gray-200">
            <span
              className="block h-4 mt-4 rounded-full bg-indigo-600 text-center text-[10px]/4 transition-all"
              style={{ width: `${countDown}0%` }}
            >
              {countDown > 0 && <span className="font-bold text-white">{countDown}</span>}
            </span>
          </span>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="rounded-full mx-auto bg-green-400 px-4 py-2 text-sm font-medium text-white disabled:bg-green-50 transition-all"
            disabled={countDown < 1 || isUserAccepted}
            onClick={onAccepted}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
