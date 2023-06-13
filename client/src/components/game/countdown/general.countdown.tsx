import React, { useEffect, useState } from 'react';

interface IProps {
  seconds: number;
  onCountdownEnded?: Function;
}

export default function GeneralCountdown(props: IProps) {
  const [seconds, setSeconds] = useState<number>(props.seconds);
  useEffect(() => {
    const timer = setInterval(() => {
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

  return <div>{seconds}</div>;
}
