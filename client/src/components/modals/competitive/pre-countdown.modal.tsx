import { useEffect, useState } from 'react';

interface IProps {
  onSeenCountdown?: Function;
  onEndedCountdown?: Function;
  onPressedUnReady?: Function;
}

export default function CustomRoomPreCountdown(props: IProps) {
  const [isSeenCountdown, setIsSeenCountdown] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(5);
  const [isDisabledButton, setIsDisabledButton] = useState<boolean>(false);

  //? Effects
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isSeenCountdown && typeof props.onSeenCountdown === 'function') {
      setIsSeenCountdown(true);
      props.onSeenCountdown();
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

  const onPressedUnReadyBtn = () => {
    if (typeof props.onPressedUnReady !== 'undefined') props.onPressedUnReady();
    setIsDisabledButton(true);
  };

  return (
    <div className="modal visible opacity-100 pointer-events-auto bg-black bg-opacity-80">
      <div className="modal-box bg-transparent text-center">
        <h1 className="prose prose-2xl font-bold tracking-wider uppercase text-green-500">READY</h1>
        <p className="text-gray-300 font-bold">
          You will redirect to game, if you not ready for game press to
          <strong className="text-error pl-1">Not Ready</strong> button
        </p>
        <p className="py-3 text-[72px] text-center font-bold tracking-wider uppercase">{seconds}</p>
        <div className="mt-10 text-center">
          <button className="btn btn-error" type="button" onClick={onPressedUnReadyBtn} disabled={isDisabledButton}>
            Not Ready
          </button>
        </div>
      </div>
    </div>
  );
}
