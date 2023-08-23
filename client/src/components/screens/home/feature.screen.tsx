'use client';

import { GiCrossedSwords, GiLockedDoor, GiTabletopPlayers, GiTrophyCup } from 'react-icons/gi';
import { MdMoneyOff } from 'react-icons/md';
import { TbTournament } from 'react-icons/tb';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function HomeFeatureScreen() {
  const { scrollYProgress } = useScroll();
  const translateY0 = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const translateY15 = useTransform(scrollYProgress, [0, 1], [125, 15]);
  const translateY25 = useTransform(scrollYProgress, [0, 1], [125, 25]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="features" className="bg-base-200 pb-10">
      <div className="container mx-auto">
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            className="block rounded-xl border border-gray-800 p-8 shadow-xl transition hover:border-indigo-500/10 hover:shadow-indigo-500/10"
            style={{
              translateY: translateY0,
              opacity,
            }}
            viewport={{ once: true }}
          >
            <GiTabletopPlayers className="w-10 h-10 text-indigo-500" />

            <h2 className="mt-4 text-xl font-bold text-white">Multiplayer</h2>
            <p className="mt-1 text-sm text-gray-300">
              You can automatically match with players of different skill levels and compete and improve yourself in a
              way that suits your skill level.
            </p>
          </motion.div>

          <motion.div
            className="block rounded-xl border border-gray-800 p-8 shadow-xl transition hover:border-indigo-500/10 hover:shadow-indigo-500/10"
            style={{
              translateY: translateY25,
              opacity,
            }}
            viewport={{ once: true }}
          >
            <GiCrossedSwords className="w-10 h-10 text-indigo-500" />

            <h2 className="mt-4 text-xl font-bold text-white">Competitive</h2>

            <p className="mt-1 text-sm text-gray-300">
              We create a duel environment where you can have fun and show your skills to your opponents while competing
              with them.
            </p>
          </motion.div>

          <motion.div
            className="block rounded-xl border border-gray-800 p-8 shadow-xl transition hover:border-indigo-500/10 hover:shadow-indigo-500/10"
            style={{
              translateY: translateY15,
              opacity,
            }}
            viewport={{ once: true }}
          >
            <GiTrophyCup className="w-10 h-10 text-indigo-500" />

            <h2 className="mt-4 text-xl font-bold text-white">League System</h2>

            <p className="mt-1 text-sm text-gray-300">
              Players are grouped according to their skill level using a league system and compete with other players in
              their leagues.
            </p>
          </motion.div>

          <motion.div
            className="block rounded-xl border border-gray-800 p-8 shadow-xl transition hover:border-indigo-500/10 hover:shadow-indigo-500/10"
            style={{
              translateY: translateY0,
              opacity,
            }}
            viewport={{ once: true }}
          >
            <GiLockedDoor className="w-10 h-10 text-indigo-500" />

            <h2 className="mt-4 text-xl font-bold text-white">Private Rooms</h2>
            <p className="mt-1 text-sm text-gray-300">
              With the private room system, you can create a room and play private games with your friends. You can
              customize the game rules and settings.
            </p>
          </motion.div>

          <motion.div
            className="block rounded-xl border border-gray-800 p-8 shadow-xl transition hover:border-indigo-500/10 hover:shadow-indigo-500/10"
            style={{
              translateY: translateY25,
              opacity,
            }}
            viewport={{ once: true }}
          >
            <TbTournament className="w-10 h-10 text-indigo-500" />

            <h2 className="mt-4 text-xl font-bold text-white">Tournaments</h2>

            <p className="mt-1 text-sm text-gray-300">
              It allows you to compete with other players and win prizes with organized tournaments.
            </p>
          </motion.div>

          <motion.div
            className="block rounded-xl border border-gray-800 p-8 shadow-xl transition hover:border-indigo-500/10 hover:shadow-indigo-500/10"
            style={{
              translateY: translateY0,
              opacity,
            }}
            viewport={{ once: true }}
          >
            <MdMoneyOff className="w-10 h-10 text-indigo-500" />

            <h2 className="mt-4 text-xl font-bold text-white">Free</h2>

            <p className="mt-1 text-sm text-gray-300">
              It is a free accessible game for everyone. You can play without paying for any mod in the game.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
