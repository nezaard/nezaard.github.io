import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SpatialSection } from '../types';
import { MagneticButton } from './MagneticButton';
import { soundFx } from '../utils/audio';

interface NavbarProps {
  activeSection: SpatialSection;
  onSelectSection: (section: SpatialSection) => void;
  onDownloadMonograph: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onSelectSection,
  onDownloadMonograph,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { id: SpatialSection; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'work', label: 'Projects' },
    { id: 'philosophy', label: 'About' },
    { id: 'archive', label: 'Expertise' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNav = (section: SpatialSection) => {
    soundFx.playChirp(740, 0.05);
    onSelectSection(section);
    setMobileOpen(false);
  };

  return (
    <header
      data-ui-overlay="true"
      className="fixed top-0 left-0 right-0 z-40 px-6 sm:px-10 py-6 pointer-events-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => handleNav('overview')}
          className="pointer-events-auto text-base font-semibold tracking-tight text-white font-display whitespace-nowrap shrink-0 hover:opacity-80 transition-opacity"
        >
          Nezard Wildan
        </button>

        {/* Zone 2: Minimalist portfolio navigation links floating over the 3D canvas */}
        <nav className="pointer-events-auto hidden md:flex items-center gap-8 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`relative py-1 transition-colors duration-150 whitespace-nowrap shrink-0 ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-white" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="pointer-events-auto flex items-center gap-3 shrink-0">
          <div className="hidden sm:block">
            <MagneticButton
              strength={0.2}
              onClick={() => {
                soundFx.playClick();
                onDownloadMonograph();
              }}
              className="px-4 py-2 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold"
            >
              Download CV
            </MagneticButton>
          </div>

          <button
            type="button"
            aria-label="Toggle Navigation"
            onClick={() => {
              soundFx.playClick();
              setMobileOpen(!mobileOpen);
            }}
            className="md:hidden p-2 rounded-full bg-[#0c0c0f]/95 border border-white/[0.1] text-zinc-300 hover:text-white"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="pointer-events-auto md:hidden mt-4 p-6 rounded-2xl bg-[#0a0a0d]/95 border border-white/[0.1] space-y-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item.id)}
              className={`block w-full text-left py-2 text-sm font-medium ${
                activeSection === item.id ? 'text-white' : 'text-zinc-400'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onDownloadMonograph();
              }}
              className="w-full py-2.5 rounded-full bg-white text-zinc-950 text-xs font-semibold"
            >
              Download CV
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
