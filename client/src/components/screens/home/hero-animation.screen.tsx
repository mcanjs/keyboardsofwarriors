'use client';

import { useState } from 'react';
import { TypeAnimation } from 'react-type-animation';

export default function HomeHeroAnimationScreen() {
  const [textColor, setTextColor] = useState<string>('');

  return (
    <h1 className={`${textColor} text-[10px] leading-6 font-bold md:text-md md:leading-none`}>
      <TypeAnimation
        preRenderFirstString={true}
        sequence={[
          500,
          'Improve Your', // initially rendered starting point
          400,
          'Improve Your Typing Skils!',
          () => setTextColor('text-red-500'),
          400,
          'Improve Your Typing Skills!',
          () => setTextColor('text-green-500'),
          1000,
          () => setTextColor(''),
          'Improve Your Typing Skills with Our Multiplayer Typing Race',
          1000,
          'Improve Your Typing Speed By Learning New Typing Techniques.',
          1000,
          'Improve Your Friends in a Fun and Competitive Typing Race',
          1000,
        ]}
        speed={40}
        deletionSpeed={50}
        style={{ fontSize: '2em' }}
        repeat={Infinity}
      />
    </h1>
  );
}
