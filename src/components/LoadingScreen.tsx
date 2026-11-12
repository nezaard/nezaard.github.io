import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ARTIST_INFO } from '../data/portfolioData';
import { soundFx } from '../utils/audio';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 16) + 12;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        clearInterval(interval);
        const timer = setTimeout(() => {
          setVisible(false);
          setTimeout(onComplete, 450);
        }, 280);
        return () => clearTimeout(timer);
      } else {
        setProgress(current);
      }
    }, 55);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleEnterNow = () => {
    soundFx.playChirp(660, 0.08);
    setVisible(false);
    setTimeout(onComplete, 350);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-[90] bg-[#050505] flex flex-col justify-between p-8 sm:p-12 select-none"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span className="font-display font-medium text-zinc-300 tracking-tight">
              {ARTIST_INFO.name}
            </span>
            <span className="font-mono tabular-nums">{ARTIST_INFO.role}</span>
          </div>

          {/* Center Statement & Progress */}
          <div className="max-w-xl mx-auto w-full space-y-6 text-center">
            <p className="font-serif-editorial italic text-2xl sm:text-3xl text-zinc-200 tracking-tight">
              “Engineering zero-data-loss enterprise storage & resilient infrastructure.”
            </p>

            {/* Hairline Progress Bar */}
            <div className="w-full h-[1px] bg-white/[0.08] overflow-hidden relative">
              <motion.div
                className="h-full bg-white"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleEnterNow}
                className="px-5 py-2 rounded-full border border-white/[0.15] hover:border-white/40 text-xs font-medium text-zinc-300 hover:text-white transition-colors whitespace-nowrap"
              >
                Enter 3D Portfolio
              </button>
            </div>
          </div>

          {/* Bottom Oversized Tabular Counter */}
          <div className="flex items-end justify-between">
            <div className="text-xs text-zinc-500 max-w-xs">
              Initializing 3D Portfolio Environment
            </div>
            <div className="text-5xl sm:text-7xl font-display font-light text-white font-mono tabular-nums tracking-tighter leading-none">
              {String(progress).padStart(3, '0')}
              <span className="text-xl sm:text-2xl text-zinc-500 ml-1">%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
