import React, { useEffect, useState } from "react";

interface IProps {
  seconds: number;
  onCountdownEnded?: Function;
  withProgressBar?: boolean;
  isWaitProtocol?: boolean;
}

export default function GeneralCountdown(props: IProps) {
  const [seconds, setSeconds] = useState<number>(props.seconds);
  useEffect(() => {
    const timer = setInterval(() => {
      if (props.isWaitProtocol) return;
      if (seconds > 0) {
        setSeconds((old) => old - 1);
      } else {
        clearInterval(timer);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  });

  return (
    <div className="w-full relative text-center">
      {props.withProgressBar && (
        <div
          className={`${
            (seconds / props.seconds) * 100 > 50
              ? "bg-green-400"
              : (seconds / props.seconds) * 100 > 20
              ? "bg-yellow-400"
              : "bg-red-400"
          } h-full absolute top-0 left-0 rounded-full transition-all`}
          style={{ width: `${(seconds / 60) * 100}%` }}
        ></div>
      )}
      <span className="relative z-1 text-white">{seconds}</span>
    </div>
  );
}
