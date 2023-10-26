'use client';

import { useAppDispatch, useAppSelector } from '@/src/hooks/redux/hook';
import { changeCanPlay, changeSoundType } from '@/src/redux/features/sounder/sounder.slice';
import { useEffect, useRef } from 'react';

export default function Sounder() {
  const dispatch = useAppDispatch();
  const soundType = useAppSelector(({ sounderReducer }) => sounderReducer.soundType);
  const canPlay = useAppSelector(({ sounderReducer }) => sounderReducer.canPlay);
  const soundRef = useRef<HTMLAudioElement>(null);

  const prefix = '/fx';
  const fxPaths = {
    founded: `${prefix}/match:founded.wav`,
    victory: `${prefix}/game:victory-premium.wav`,
    defeat: `${prefix}/game:defeat.wav`,
    new: `${prefix}/general:new.wav`,
  };

  useEffect(() => {
    if (typeof soundType !== 'undefined' && canPlay && soundRef.current) {
      var source = document.createElement('source');
      soundRef.current.appendChild(source);
      source.setAttribute('src', fxPaths[soundType]);
      source.setAttribute('type', 'audio/wav');
      soundRef.current.play();

      soundRef.current.addEventListener('ended', () => {
        dispatch(changeSoundType(undefined));
        dispatch(changeCanPlay(false));
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canPlay, soundType]);

  return <audio ref={soundRef} className="hidden invisible"></audio>;
}
