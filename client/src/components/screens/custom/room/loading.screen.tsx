'use client';

import { Loader } from '@/src/components/loader';

export default function CustomRoomLoadingScreen() {
  return (
    <div className="flex flex-col flex-1 justify-center items-center">
      <Loader className="loading-lg loading-ball text-indigo-500" />
      <div>
        <p className="pt-2 text-lg text-indigo-400">Waiting to room connection...</p>
      </div>
    </div>
  );
}
