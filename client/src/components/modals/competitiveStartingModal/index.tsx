import { useEffect, useState } from 'react';

interface IProps {
  onCountdownEnded?: Function;
}

export default function CompetitiveStartingModal(props: IProps) {
  //? Props
  const { onCountdownEnded } = props;

  //? States
  const [countDown, setCountDown] = useState<number>(3);

  useEffect(() => {
    if (countDown <= 0) {
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

  return (
    <div className="w-full h-full absolute top-0 left-0 flex justify-center items-center">
      <div className="z-[1] w-full h-full absolute top-0 left-0 bg-slate-950 bg-opacity-50 backdrop-blur"></div>
      <div className="z-[2] rounded-lg bg-white p-8 shadow-2xl min-w-[50%]">
        <h2 className="text-center text-lg font-bold">Competitive Starting...</h2>
        <div className="text-center">
          <span className="text-[32px] font-bold">{countDown.toString()}</span>
        </div>
      </div>
    </div>
  );
}
