'use client';

import ImproveGameScreen from '@/src/components/screens/improve/game/game.screen';
import ImproveSettingsScreen from '@/src/components/screens/improve/settings/settings.screen';
import { useState } from 'react';

export default function ImprovePage() {
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const onEndedGame = () => setIsEnded(true);

  return (
    <div className="container mx-auto h-[calc(100vh-160px)]">
      <div className="w-full h-full flex flex-col justify-center items-center">
        <ImproveGameScreen onFinished={onEndedGame} />
        <div className="flex">
          <ImproveSettingsScreen />
        </div>
      </div>
    </div>
  );
}
