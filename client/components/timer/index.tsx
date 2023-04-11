import { useEffect, useState } from 'react';

interface IProps {
  continueTimer: boolean;
}

export default function Timer(props: IProps) {
  const { continueTimer } = props;
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);

  useEffect(() => {
    if (continueTimer) {
      const interval = setInterval(() => {
        setSecond((old) => {
          if (old >= 59) {
            setMinute((old) => old + 1);
            return 0;
          }
          return old + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
    return;
  }, []);

  return (
    <div>
      <div>
        <span>{minute < 10 ? '0' + minute : minute}</span>
        <span>:</span>
        <span>{second < 10 ? '0' + second : second}</span>
      </div>
    </div>
  );
}
