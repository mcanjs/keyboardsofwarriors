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
        if (typeof props.onCountdownEnded !== "undefined")
          props.onCountdownEnded();
        clearInterval(timer);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [seconds, props.isWaitProtocol]);

  const checkNeedPrefix = (num: number): string => {
    if (num < 10) {
      return `0${num}`;
    }

    return num.toString();
  };

  return (
    <div className="w-full relative text-center overflow-hidden">
      {props.withProgressBar && (
        <div
          className={`${
            (seconds / props.seconds) * 100 > 50
              ? "bg-green-400"
              : (seconds / props.seconds) * 100 > 20
              ? "bg-yellow-400"
              : "bg-red-400"
          } h-full absolute top-0 left-0 rounded-full transition-all`}
          style={{
            width: `${Math.min((seconds / props.seconds) * 100, 100)}%`,
          }}
        ></div>
      )}
      <span className="relative z-1 text-white">
        <span>{checkNeedPrefix(Math.floor(seconds / 60))}</span>
        <span>:</span>
        <span>
          {checkNeedPrefix(
            seconds > 60 ? seconds % 60 : seconds === 60 ? 0o0 : seconds
          )}
        </span>
      </span>
    </div>
  );
}
