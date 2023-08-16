'use client';

import Image from 'next/image';
import HomeHeroAnimationScreen from './hero-animation.screen';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function HomeHeroScreen() {
  const { scrollYProgress } = useScroll();
  const translateY = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const negativeTranslateY = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const [isPressedR, setIsPressedR] = useState<boolean>(false);
  const [isPressedN, setIsPressedN] = useState<boolean>(false);

  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.code === 'KeyR') {
        setIsPressedR(true);
      } else if (e.code === 'KeyN') {
        setIsPressedN(true);
      }
    };
    document.addEventListener('keydown', keyDownHandler);

    // clean up
    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, []);

  const pressedAnimationR = () => {
    setTimeout(() => {
      setIsPressedR(false);
    }, 100);

    return 'invert';
  };

  const pressedAnimationN = () => {
    setTimeout(() => {
      setIsPressedN(false);
    }, 100);

    return 'invert';
  };

  return (
    <section id="hero" className="relative overflow-hidden">
      <motion.div
        style={{
          translateY: negativeTranslateY,
          opacity: opacity,
        }}
        className="hero min-h-[calc(100vh-80px)] bg-base-100"
      >
        <div className="container mx-auto">
          <div className="hero-content flex-col text-center">
            <div className="max-w-[85%]">
              <HomeHeroAnimationScreen />
            </div>
            <div className="max-w-[65%]">
              <div className="text-gray-500">
                <p>
                  Typing Speed Race is a great way to test your typing skills. The game has different modes so you can
                  find a mode that suits your skill level. You can compete with your friends in the private room mode or
                  race with the whole world in the multiplayer mode. Typing Speed Race is both fun and educational. It
                  is a great opportunity to improve your typing speed and learn new things.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        className="absolute bottom-2/4 left-0"
        initial={{ translateX: '-100%' }}
        animate={{ translateX: 0 }}
        style={{
          translateY,
        }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
      >
        <motion.div
          initial={{ scale: 0.6 }}
          animate={{ scale: 0.5 }}
          transition={{
            repeat: Infinity,
            duration: 0.5,
            type: 'spring',
            stiffness: 260,
            damping: 50,
            repeatType: 'reverse',
          }}
        >
          <Image
            src="/img/key-r.png"
            alt=""
            width={160}
            height={80}
            className={isPressedR ? pressedAnimationR() : ''}
          />
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute bottom-2/4 right-0"
        initial={{ translateX: '100%' }}
        animate={{ translateX: 0 }}
        style={{
          translateY,
        }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 50,
        }}
      >
        <motion.div
          initial={{ scale: 0.6 }}
          animate={{ scale: 0.5 }}
          transition={{
            repeat: Infinity,
            duration: 0.5,
            type: 'spring',
            stiffness: 260,
            damping: 50,
            repeatType: 'reverse',
          }}
        >
          <Image
            src="/img/key-n.png"
            alt=""
            width={160}
            height={80}
            className={isPressedN ? pressedAnimationN() : ''}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
