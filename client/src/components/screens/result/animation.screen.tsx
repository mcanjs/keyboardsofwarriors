'use client';

import Lottie from 'lottie-react';
import winnerBadge from '@/src/json/animations/winner-badge.json';
import drawBadge from '@/src/json/animations/hand-in-hand.json';
import loserBadge from '@/src/json/animations/loser-badge.json';
import { Matches } from '@prisma/client';

interface IProps {
  data: Matches | null;
  userId: string | null;
}

export default function ResultLottieScreen({ data, userId }: IProps) {
  return (
    <>
      {data?.winnerId === userId && <Lottie animationData={winnerBadge} loop={false} className="w-[100px] h-[75px]" />}
      {data?.loserId === userId && <Lottie animationData={loserBadge} loop={false} className="w-[100px] h-[75px]" />}
      {data?.winnerId === '' && data?.loserId === '' && (
        <Lottie animationData={drawBadge} loop={false} className="w-[100px] h-[75px]" />
      )}
    </>
  );
}
