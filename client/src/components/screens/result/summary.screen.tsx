import { Matches, Prisma } from '@prisma/client';

interface IProps {
  data: Matches | null;
  userId: string | null;
}

export default function ResultSummaryScreen({ data, userId }: IProps) {
  const resultColor = () => {
    if (data?.winnerId === userId) {
      return 'text-green-500';
    } else if (data?.loserId === userId) {
      return 'text-red-400';
    }
    return 'text-gray-500';
  };

  const resultText = () => {
    if (data?.winnerId === userId) {
      return 'Victory';
    } else if (data?.loserId === userId) {
      return 'Defeat';
    } else if (data?.loserId === '' && data?.winnerId === '') {
      return 'Draw';
    }

    return 'Not found';
  };

  return (
    <div className="w-full flex flex-col p-1 sm:flex-row">
      <div className="flex-1 basis-1/2">
        <span
          className={`${resultColor()} flex justify-center text-[32px] font-medium text-white text-center sm:justify-start`}
        >
          {resultText()}
        </span>
        <div className="flex flex-col items-center w-full text-[14px] text-yellow-100 font-light sm:flex-row sm:items-start">
          <span>Competitive</span>
          <span className="indicator"></span>
          <span>1 Minute</span>
          <span className="indicator"></span>
          {data && <span>{new Date(data.matchDate).toLocaleString()}</span>}
        </div>
      </div>
      <div className="flex flex-row flex-1 basis-1/2 justify-center items-end sm:flex-col">
        {data?.winnerId === userId && (
          <div className="flex items-center gap-1 text-green-500">
            <span className="text-[24px] font-semibold">+</span>
            <span className="text-[48px] font-semibold">{data.winnerPoint.toString()}</span>
            <span>LP</span>
          </div>
        )}
        {data?.loserId === userId && (
          <div className="flex items-center gap-1 text-red-500">
            <span className="text-[24px] font-semibold">-</span>
            <span className="text-[48px] font-semibold">{data.loserPoint.toString()}</span>
            <span>LP</span>
          </div>
        )}
        {data?.winnerId === '' && data.loserId === '' && (
          <div className="flex items-center gap-1 text-gray-500">
            <span className="text-[24px] font-semibold">+</span>
            <span className="text-[48px] font-semibold">0</span>
            <span>LP</span>
          </div>
        )}
      </div>
    </div>
  );
}
