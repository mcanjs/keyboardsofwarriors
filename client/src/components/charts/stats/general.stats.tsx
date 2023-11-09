import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ICompetitiveIncorrectLetter } from '@/src/interfaces/competitive.interface';
import { FaCheck, FaTimes } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface IProps {
  wordsTyped: number;
  startTime: Date;
  endTime: Date;
  corrects: number;
  incorrects: number;
  mistakes: ICompetitiveIncorrectLetter;
}

export function GeneralGameStat(props: IProps) {
  const calculateWPM = (): number => {
    const startTime = props.startTime.getTime();
    const endTime = props.endTime.getTime();
    const timeDiffInSeconds = (endTime - startTime) / 1000;

    return Math.floor((props.wordsTyped / timeDiffInSeconds) * 60);
  };

  const calculateAllMistakes = (): number => {
    let finalMistake = 0;
    for (let i = 0; i < Object.keys(props.mistakes).length; i++) {
      const mistake = props.mistakes[Object.keys(props.mistakes)[i]];
      console.log(mistake);
      finalMistake += mistake.length;
    }

    return finalMistake;
  };

  console.log(props);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };

  const labels = ['Words Per Minute'];

  const data = {
    labels,
    datasets: [
      {
        label: 'WPM',
        data: [calculateWPM()],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-9 md:col-span-6">
        <div className="w-full h-[60vh] relative">
          <Bar options={options} data={data} />
        </div>
      </div>
      <div className="col-span-3 flex flex-col gap-4 md:col-span-6">
        <div className="flex items-center justify-between rounded-lg border border-base-200 bg-base-200 p-6">
          <div>
            <p className="text-lg font-bold text-green-500">Corrects</p>
          </div>

          <div className="flex items-center gap-2 rounded bg-green-100 p-1 text-green-600">
            <FaCheck />

            <span className="text-[24px] font-bold"> {props.corrects} </span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-base-200 bg-base-200 p-6">
          <div>
            <p className="text-lg font-bold text-red-500">Incorrects</p>
          </div>

          <div className="flex items-center gap-2 rounded bg-red-100 p-1 text-red-600">
            <FaTimes />

            <span className="text-[24px] font-bold"> {props.incorrects} </span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-base-200 bg-base-200 p-6">
          <div>
            <p className="text-lg font-bold text-yellow-500">Mistakes</p>
          </div>

          <div className="flex items-center gap-2 rounded bg-yellow-100 p-1 text-yellow-600">
            <FaTimes />

            <span className="text-[24px] font-bold"> {calculateAllMistakes()} </span>
          </div>
        </div>
      </div>
    </div>
  );
}
