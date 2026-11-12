import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface CustomCursorProps {
  hovering3DPlane: boolean;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ hovering3DPlane }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringDOM, setIsHoveringDOM] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springX = useSpring(cursorX, { stiffness: 420, damping: 32, mass: 0.3 });
  const springY = useSpring(cursorY, { stiffness: 420, damping: 32, mass: 0.3 });

  useEffect(() => {
    // Only show custom cursor on fine-pointer devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('a, button, input, textarea, [data-interactive="true"]');
        setIsHoveringDOM(Boolean(interactive));
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  const isExpanded = isHoveringDOM || hovering3DPlane;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden hidden md:block">
      {/* Precision Inner Dot */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isExpanded ? 0.5 : 1,
          opacity: isExpanded ? 0.9 : 1,
        }}
        transition={{ duration: 0.15 }}
        className="w-2 h-2 rounded-full bg-white mix-blend-difference"
      />

      {/* Spring-Damped Outer Halo */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: hovering3DPlane ? 68 : isHoveringDOM ? 48 : 30,
          height: hovering3DPlane ? 68 : isHoveringDOM ? 48 : 30,
          borderColor: hovering3DPlane
            ? 'rgba(255, 255, 255, 0.75)'
            : isHoveringDOM
            ? 'rgba(255, 255, 255, 0.5)'
            : 'rgba(255, 255, 255, 0.22)',
          backgroundColor: hovering3DPlane
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(255, 255, 255, 0)',
        }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-full border flex items-center justify-center"
      >
        {hovering3DPlane && (
          <span className="text-[9px] font-mono tracking-wider text-white uppercase">
            View
          </span>
        )}
      </motion.div>
    </div>
  );
};
