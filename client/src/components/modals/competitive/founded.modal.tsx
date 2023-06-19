'use client';

import { useAppDispatch, useAppSelector } from '@/src/hooks/redux/hook';
import { changeIsUserAccepted } from '@/src/redux/features/matchmaker/matchmaker.slice';
import { changeCanPlay, changeSoundType } from '@/src/redux/features/sounder/sounder.slice';
import { useEffect, useState } from 'react';

interface IProps {
  seconds: number;
  onEndedCountdown?: Function;
}

export default function CompetitiveFoundedModal(props: IProps) {
  //? Hooks
  const dispatch = useAppDispatch();

  //? Store selectors
  const isMatchFounded = useAppSelector((state) => state.matchmakerReducer.isMatchFounded);
  const isUserAccepted = useAppSelector((state) => state.matchmakerReducer.isUserAccepted);

  //? States
  const [seconds, setSeconds] = useState<number>(props.seconds);
  const [soundCanPlay, setSoundCanPlay] = useState<boolean>(true);

  //? Effects
  useEffect(() => {
    if (soundCanPlay) {
      dispatch(changeSoundType('founded'));
      dispatch(changeCanPlay(true));
      setSoundCanPlay(false);
    }
    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds((old) => old - 1);
      } else {
        if (typeof props.onEndedCountdown !== 'undefined') {
          props.onEndedCountdown();
        }
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  });

  const onClickApprovalButton = () => {
    if (!isUserAccepted) {
      dispatch(changeIsUserAccepted(true));
    }
  };

  return (
    <>
      <div className="modal visible opacity-100 pointer-events-auto bg-black bg-opacity-80">
        <div className="modal-box bg-transparent text-center">
          <h1 className="prose prose-2xl font-bold tracking-wider uppercase">Match Founded</h1>
          <p className="py-3 text-[72px] text-center font-bold tracking-wider uppercase">{seconds}</p>
          <button className="btn btn-primary" onClick={onClickApprovalButton} disabled={isUserAccepted}>
            Approve
          </button>
        </div>
      </div>
    </>
  );
}
