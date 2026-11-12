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

  // Smooth wheel-driven camera flight between spatial sections
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Do not hijack scroll when inside a scrollable modal or overlay card
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.overflow-y-auto')) {
        return;
      }
      if (selectedWork) return;

      const now = performance.now();
      if (now - lastWheelTime.current < 950) return;

      if (Math.abs(e.deltaY) > 32) {
        lastWheelTime.current = now;
        setActiveSection((prev) => {
          const currentIndex = SECTION_ORDER.indexOf(prev);
          if (e.deltaY > 0 && currentIndex < SECTION_ORDER.length - 1) {
            soundFx.playChirp(680, 0.04);
            return SECTION_ORDER[currentIndex + 1];
          } else if (e.deltaY < 0 && currentIndex > 0) {
            soundFx.playChirp(620, 0.04);
            return SECTION_ORDER[currentIndex - 1];
          }
          return prev;
        });
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
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
    <div className="relative w-screen h-screen overflow-hidden bg-[#050505] text-zinc-100 select-none">
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
