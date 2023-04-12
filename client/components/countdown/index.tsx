import React, { useEffect, useState } from 'react';

interface IProps {
  isStart: boolean;
  callback?: Function;
}

export default function Countdown(props: IProps) {
  const [remaining, setRemaining] = useState<number>(10);
  useEffect(() => {
    if (remaining === 0) {
      setRemaining(0);
      //? Callback FN
      if (typeof props.callback !== 'undefined') props.callback();
    }

    if (!remaining) return;

    const intervalId = setInterval(() => {
      setRemaining(remaining - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [props, remaining]);

  return (
    <div>
      <div>Countdown</div>
      <div>{remaining}</div>
    </div>
  );
}
