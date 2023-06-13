'use client';
import Lottie from 'lottie-react';
import winnerBadge from '@/src/json/animations/winner-badge.json';
import draw from '@/src/json/animations/hand-in-hand.json';
import disconnected from '@/src/json/animations/disconnected.json';
import loserBadge from '@/src/json/animations/loser-badge.json';
import Link from 'next/link';

export default function ResultPage() {
  const resultColor = (result: string) => {
    switch (result) {
      case 'victory':
        return 'text-green-500';
      case 'defeat':
        return 'text-red-500';
      case 'tie':
        return 'text-gray-500';
      case 'terminated':
        return 'text-red-400';
      default:
        break;
    }
  };

  return (
    <div className="max-w-lg h-[calc(100vh-234px)] relative flex items-center justify-center mx-auto">
      <div className="mx-auto max-w-xl text-center">
        <Lottie animationData={disconnected} loop={true} className="w-[250px] h-[250px] mx-auto" />

        <h1 className="text-3xl font-extrabold sm:text-5xl">
          <strong className={resultColor('tie')}>Berabere</strong>
        </h1>

        <p className="mt-4 sm:text-xl/relaxed">Rakip oyuna bağlanamadığından olayı oyun bozuldu.</p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            className="block w-full rounded bg-blue-500 px-12 py-3 transition-all text-sm font-medium text-white shadow hover:bg-blue-600 focus:outline-none focus:ring active:bg-blue-400 sm:w-auto"
            href="/matchmaker"
          >
            Re-play
          </Link>
        </div>
      </div>
    </div>
  );
}
