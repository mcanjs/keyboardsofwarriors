'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function PageProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnimatePresence>
        <motion.main
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ delay: 0.5 }}
          className="flex flex-1 flex-col"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </>
  );
}
