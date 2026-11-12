/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { SpatialSection, SculptureForm, SpatialWorkItem } from './types';
import { ThreeHeroScene } from './components/ThreeHeroScene';
import { Navbar } from './components/Navbar';
import { SpatialOverlays } from './components/SpatialOverlays';
import { CustomCursor } from './components/CustomCursor';
import { LoadingScreen } from './components/LoadingScreen';
import { downloadResume } from './utils/resumeGenerator';
import { soundFx } from './utils/audio';

const SECTION_ORDER: SpatialSection[] = [
  'overview',
  'work',
  'philosophy',
  'archive',
  'contact',
];

export default function App() {
  const [activeSection, setActiveSection] = useState<SpatialSection>('overview');
  const [sculptureForm, setSculptureForm] = useState<SculptureForm>('wireframe');
  const [selectedWork, setSelectedWork] = useState<SpatialWorkItem | null>(null);
  const [hovering3DPlane, setHovering3DPlane] = useState(false);
  const [hoveredPlaneWork, setHoveredPlaneWork] = useState<SpatialWorkItem | null>(null);
  const [loaded, setLoaded] = useState(false);

  const lastWheelTime = useRef<number>(0);
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchScrollContainer = useRef<HTMLElement | null>(null);

  // Smooth wheel & mobile touch-swipe camera flight between spatial sections
  useEffect(() => {
    const canTransitionFromScrollable = (
      scrollable: HTMLElement | null,
      direction: 'next' | 'prev'
    ): boolean => {
      if (!scrollable) return true;
      const hasVerticalOverflow = scrollable.scrollHeight > scrollable.clientHeight + 4;
      if (!hasVerticalOverflow) return true;

      if (direction === 'next') {
        const atBottom =
          scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 6;
        return atBottom;
      } else {
        const atTop = scrollable.scrollTop <= 6;
        return atTop;
      }
    };

    const navigateSection = (direction: 'next' | 'prev') => {
      const now = performance.now();
      if (now - lastWheelTime.current < 850) return;
      lastWheelTime.current = now;

      setActiveSection((prev) => {
        const currentIndex = SECTION_ORDER.indexOf(prev);
        if (direction === 'next' && currentIndex < SECTION_ORDER.length - 1) {
          soundFx.playChirp(680, 0.04);
          return SECTION_ORDER[currentIndex + 1];
        } else if (direction === 'prev' && currentIndex > 0) {
          soundFx.playChirp(620, 0.04);
          return SECTION_ORDER[currentIndex - 1];
        }
        return prev;
      });
    };

    const handleWheel = (e: WheelEvent) => {
      if (selectedWork) return;
      if (Math.abs(e.deltaY) <= 28) return;

      const target = e.target as HTMLElement | null;
      const scrollable = target ? (target.closest('.overflow-y-auto') as HTMLElement | null) : null;
      const direction = e.deltaY > 0 ? 'next' : 'prev';

      if (!canTransitionFromScrollable(scrollable, direction)) {
        return;
      }

      navigateSection(direction);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (selectedWork || e.touches.length !== 1) return;
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
      const target = e.target as HTMLElement | null;
      touchScrollContainer.current = target
        ? (target.closest('.overflow-y-auto') as HTMLElement | null)
        : null;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (
        selectedWork ||
        touchStartY.current === null ||
        touchStartX.current === null ||
        e.changedTouches.length === 0
      ) {
        return;
      }

      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      const deltaX = touchStartX.current - e.changedTouches[0].clientX;
      touchStartY.current = null;
      touchStartX.current = null;

      // Ignore horizontal swipes or tiny taps
      if (Math.abs(deltaY) < 48 || Math.abs(deltaX) > Math.abs(deltaY)) {
        return;
      }

      const direction = deltaY > 0 ? 'next' : 'prev';
      if (!canTransitionFromScrollable(touchScrollContainer.current, direction)) {
        return;
      }

      navigateSection(direction);
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [selectedWork]);

  const handleHoverPlaneChange = (
    hovering: boolean,
    work?: SpatialWorkItem | null
  ) => {
    setHovering3DPlane(hovering);
    setHoveredPlaneWork(work || null);
  };

  const handleSelectWork = (work: SpatialWorkItem | null) => {
    setSelectedWork(work);
    if (work && activeSection !== 'work') {
      setActiveSection('work');
    }
  };

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-[#050505] text-zinc-100 select-none">
      {/* Cinematic Preloader */}
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      {/* Custom Sleek Magnetic Cursor Dot & Ring */}
      <CustomCursor hovering3DPlane={hovering3DPlane} />

      {/* Full-Viewport Interactive Three.js Spatial World */}
      <ThreeHeroScene
        activeSection={activeSection}
        sculptureForm={sculptureForm}
        selectedWork={selectedWork}
        onSelectWork={(work) => handleSelectWork(work)}
        onHoverPlaneChange={handleHoverPlaneChange}
      />

      {/* Minimalist Top Bar Navigation (Camera Waypoint Triggers) */}
      <Navbar
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setSelectedWork(null);
          setActiveSection(sec);
        }}
        onDownloadMonograph={downloadResume}
      />

      {/* Synchronized Spatial Stage Overlays & Collapsible Bottom Dock */}
      <SpatialOverlays
        activeSection={activeSection}
        sculptureForm={sculptureForm}
        selectedWork={selectedWork}
        hoveredPlaneWork={hoveredPlaneWork}
        onSelectSection={setActiveSection}
        onSelectSculptureForm={setSculptureForm}
        onSelectWork={handleSelectWork}
        onDownloadMonograph={downloadResume}
      />
    </div>
  );
}
