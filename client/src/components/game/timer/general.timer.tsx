import React, { useEffect, useState } from 'react';

export default function GeneralTimer() {
  const [time, setTime] = useState<number>(110);

  useEffect(() => {
    const timer = setInterval(() => setTime((old) => old + 1), 1000);
    return () => {
      clearInterval(timer);
    };
  });

  return (
    <div>
      <div>
        {time > 60 ? (
          <span>{Math.floor(time / 60) < 10 ? `0${Math.floor(time / 60)}` : Math.floor(time / 60)}</span>
        ) : (
          <span>00</span>
        )}
        <span>:</span>
        <span>{time % 60 < 10 ? `0${time % 60}` : time % 60}</span>
      </div>
    </div>
  );
}
