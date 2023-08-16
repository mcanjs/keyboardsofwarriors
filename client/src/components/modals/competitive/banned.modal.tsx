"use client";


import { useEffect, useState } from "react";

interface IProps {
  seconds: number;
  onEndedCountdown?: Function;
  onApproved?: Function;
}

export default function CompetitiveBannedModal(props: IProps) {
  //? States
  const [seconds, setSeconds] = useState<number>(props.seconds);

  //? Effects
  useEffect(() => {
    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds((old) => old - 1);
      } else {
        if (typeof props.onEndedCountdown !== "undefined") {
          props.onEndedCountdown();
        }
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  });

  return (
    <>
      <div className="modal visible opacity-100 pointer-events-auto bg-black bg-opacity-80">
        <div className="modal-box bg-transparent text-center">
          <h1 className="prose prose-2xl font-bold tracking-wider uppercase text-red-500">
            Suspended
          </h1>
          <p className="text-gray-300 font-bold">
            You have been suspended from competitive queue for not accepting the
            last created match
          </p>
          <p className="py-3 text-[72px] text-center font-bold tracking-wider uppercase">
            {seconds}
          </p>
        </div>
      </div>
    </>
  );
}
