import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
} from 'lucide-react';
import {
  ARTIST_INFO,
  SELECTED_WORKS,
  PHILOSOPHY_PILLARS,
  ARCHIVE_ENTRIES,
} from '../data/portfolioData';
import { SpatialSection, SculptureForm, SpatialWorkItem } from '../types';
import { MagneticButton } from './MagneticButton';
import { soundFx } from '../utils/audio';

interface SpatialOverlaysProps {
  activeSection: SpatialSection;
  sculptureForm: SculptureForm;
  selectedWork: SpatialWorkItem | null;
  hoveredPlaneWork: SpatialWorkItem | null;
  onSelectSection: (section: SpatialSection) => void;
  onSelectSculptureForm: (form: SculptureForm) => void;
  onSelectWork: (work: SpatialWorkItem | null) => void;
  onDownloadMonograph: () => void;
}

const TYPEWRITER_LINES = [
  'Engineering Enterprise IT Infrastructure',
  'Managing Data Center & Disaster Recovery Operations',
  'Specializing in NetApp Storage & SAN Infrastructure',
  'Executing Enterprise Infrastructure Transformation',
  'Building Reliable Server Windows & Linux Environments',
];

const CERTIFICATIONS = [
  { code: 'NCIE-DP', title: 'NetApp Certified Data Protection Engineer' },
  { code: 'NCDA', title: 'NetApp Certified Data Administrator ONTAP' },
  { code: 'BCFA', title: 'Brocade Certified Fabric Administrator' },
  { code: 'MTCNA / MTCRE', title: 'MikroTik Certified Network & Routing Engineer' },
  { code: 'RHCSA', title: 'Red Hat Certified System Administrator' },
];

export const SpatialOverlays: React.FC<SpatialOverlaysProps> = ({
  activeSection,
  sculptureForm,
  selectedWork,
  hoveredPlaneWork,
  onSelectSection,
  onSelectSculptureForm,
  onSelectWork,
  onDownloadMonograph,
}) => {
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Typewriter state for Overview Hero
  const [lineIndex, setLineIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullLine = TYPEWRITER_LINES[lineIndex];
    const speed = isDeleting ? 22 : 45;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        const next = fullLine.slice(0, typedText.length + 1);
        setTypedText(next);
        if (next.length === fullLine.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        const next = fullLine.slice(0, typedText.length - 1);
        setTypedText(next);
        if (next.length === 0) {
          setIsDeleting(false);
          setLineIndex((prev) => (prev + 1) % TYPEWRITER_LINES.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, lineIndex]);

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    project: '',
  });
  const [formSent, setFormSent] = useState(false);

  // Keyboard shortcut 'H' for Zen Mode drawer & 'Escape' to close work modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key.toLowerCase() === 'h') {
        setDockCollapsed((prev) => !prev);
      } else if (e.key === 'Escape' && selectedWork) {
        onSelectWork(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWork, onSelectWork]);

  const handleToggleAudio = () => {
    const state = soundFx.toggle();
    setAudioEnabled(state);
  };

  const handleCopyEmail = () => {
    soundFx.playChirp(880, 0.05);
    navigator.clipboard.writeText(ARTIST_INFO.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.project) return;
    soundFx.playChirp(980, 0.08);
    setFormSent(true);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between overflow-hidden">
      {/* =====================================================================
          MAIN SPATIAL STAGE CONTENT (Ample pb-32 so bottom dock never overlaps cards)
      ===================================================================== */}
      <div className="flex-1 relative w-full max-w-7xl mx-auto px-4 sm:px-10 pt-20 sm:pt-24 pb-24 sm:pb-32 flex items-center">
        <AnimatePresence mode="wait">
          {/* -----------------------------------------------------------------
              CHAPTER 00: OVERVIEW (Portfolio Hero + 3D Sculpture Centerpiece)
          ----------------------------------------------------------------- */}
          {activeSection === 'overview' && (
            <motion.div
              key="stage-overview"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full flex flex-col justify-end sm:justify-between"
            >
              {/* Left-aligned Portfolio Hero leaving center/top 3D sculpture unobstructed */}
              <div className="max-w-xl sm:my-auto pointer-events-auto">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-zinc-400 mb-2 sm:mb-3">
                  <span className="font-mono text-sky-400">PORTFOLIO</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-zinc-200 font-medium">{ARTIST_INFO.role}</span>
                </div>

                <h1
                  className="font-display font-semibold tracking-tight text-white leading-[1.06] mb-2 sm:mb-3"
                  style={{ fontSize: 'clamp(1.85rem, 4.8vw, 4.25rem)' }}
                >
                  Nezard Wildan{' '}
                  <span className="font-serif-editorial italic font-normal text-zinc-300 block mt-0.5 sm:mt-1">
                    Kurniawan Syah
                  </span>
                </h1>

                {/* Smooth Typewriter Effect */}
                <div className="h-6 sm:h-7 flex items-center mb-2.5 sm:mb-4">
                  <span className="text-xs sm:text-base font-medium text-sky-300 truncate">
                    {typedText}
                  </span>
                  <span className="inline-block w-[1.5px] h-3.5 sm:h-4 bg-sky-400 ml-1 shrink-0" />
                </div>

                <p className="text-xs sm:text-base text-zinc-300 sm:text-zinc-400 leading-relaxed max-w-md mb-4 sm:mb-8 line-clamp-3 sm:line-clamp-none">
                  {ARTIST_INFO.statement}
                </p>

                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
                  <MagneticButton
                    strength={0.22}
                    onClick={() => {
                      soundFx.playChirp(780, 0.06);
                      onSelectSection('work');
                    }}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 text-xs sm:text-sm font-semibold gap-2"
                  >
                    <span>Explore My Projects</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </MagneticButton>

                  <MagneticButton
                    strength={0.18}
                    onClick={() => {
                      soundFx.playClick();
                      onSelectSection('archive');
                    }}
                    className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-[#0c0c10]/90 hover:bg-[#14141c] border border-white/[0.12] text-zinc-200 text-xs sm:text-sm font-medium"
                  >
                    <span>Expertise</span>
                  </MagneticButton>
                </div>
              </div>

              {/* 4-Column Portfolio Impact Strip at Bottom of Overview Stage */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 pt-3.5 sm:pt-5 mt-4 sm:mt-0 border-t border-white/[0.08] pointer-events-auto">
                {ARTIST_INFO.recognitions.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="text-base sm:text-xl font-display font-semibold text-white font-mono tabular-nums">
                      {item.value}
                    </div>
                    <div className="text-[11px] sm:text-xs font-medium text-zinc-300 line-clamp-1">
                      {item.label}
                    </div>
                    <div className="hidden sm:block text-[11px] text-zinc-500">
                      {item.detail}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* -----------------------------------------------------------------
              CHAPTER 01: PROJECTS (Floating 3D Planes in Right Viewport + Index Left)
          ----------------------------------------------------------------- */}
          {activeSection === 'work' && (
            <motion.div
              key="stage-work"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
            >
              {/* Left Column: Portfolio Projects Index */}
              <div
                data-ui-overlay="true"
                className="pointer-events-auto w-full max-w-md bg-[#08080b]/85 border border-white/[0.09] rounded-2xl p-6 max-h-[60vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span className="text-sky-400 font-medium">01 · Featured Projects</span>
                  <span className="font-mono tabular-nums">Click 3D Card or Title</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight mb-4">
                  Infrastructure & Storage Case Studies
                </h2>

                <div className="divide-y divide-white/[0.07]">
                  {SELECTED_WORKS.map((work) => {
                    const isHovered = hoveredPlaneWork?.id === work.id;
                    return (
                      <button
                        key={work.id}
                        type="button"
                        onClick={() => {
                          soundFx.playChirp(820, 0.06);
                          onSelectWork(work);
                        }}
                        className={`w-full py-3 text-left flex items-center justify-between gap-4 transition-colors group ${
                          isHovered ? 'text-white' : 'text-zinc-300 hover:text-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-0.5">
                            <span className="font-mono text-sky-400">{work.index}</span>
                            <span aria-hidden="true">·</span>
                            <span>{work.discipline}</span>
                          </div>
                          <div className="text-sm sm:text-base font-display font-semibold group-hover:translate-x-1 transition-transform">
                            {work.title}
                          </div>
                          <div className="text-xs text-zinc-400 line-clamp-1">
                            {work.subtitle}
                          </div>
                        </div>

                        <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Viewport Helper Caption for 3D Floating Project Planes */}
              {hoveredPlaneWork && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pointer-events-none hidden lg:block bg-[#09090d]/92 border border-white/[0.12] rounded-xl px-5 py-3.5 max-w-xs self-end"
                >
                  <div className="text-[11px] font-mono text-sky-400 mb-1">
                    {hoveredPlaneWork.index} · {hoveredPlaneWork.discipline}
                  </div>
                  <div className="text-sm font-semibold text-white font-display">
                    {hoveredPlaneWork.title}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Click 3D plane to inspect architecture & SLA metrics
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* -----------------------------------------------------------------
              CHAPTER 02: ABOUT ME (Positioned left so 3D sculpture is clearly visible on right)
          ----------------------------------------------------------------- */}
          {activeSection === 'philosophy' && (
            <motion.div
              key="stage-philosophy"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl pointer-events-auto bg-[#08080b]/82 border border-white/[0.09] rounded-2xl p-6 sm:p-8 max-h-[60vh] overflow-y-auto"
            >
              <div className="text-xs text-sky-400 mb-1.5">
                02 · About Nezard Wildan Kurniawan Syah
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight mb-5">
                System Engineer & Storage Enterprise Specialist
              </h2>

              <div className="space-y-5">
                {PHILOSOPHY_PILLARS.map((pillar) => (
                  <div
                    key={pillar.index}
                    className="pt-4 border-t border-white/[0.08] first:border-t-0 first:pt-0 space-y-1.5"
                  >
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-mono text-xs text-sky-400">
                        {pillar.index}.
                      </span>
                      <h3 className="text-sm sm:text-base font-display font-semibold text-white">
                        {pillar.title}
                      </h3>
                    </div>
                    <p className="font-serif-editorial italic text-sm sm:text-base text-zinc-200">
                      “{pillar.italicLead}”
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {pillar.body}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* -----------------------------------------------------------------
              CHAPTER 03: SKILLS & CERTIFICATIONS (Compact height so bottom dock never overlaps)
          ----------------------------------------------------------------- */}
          {activeSection === 'archive' && (
            <motion.div
              key="stage-archive"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl mx-auto pointer-events-auto bg-[#08080b]/82 border border-white/[0.09] rounded-2xl p-6 sm:p-8 max-h-[60vh] overflow-y-auto"
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-white/[0.08] mb-4">
                <div>
                  <div className="text-xs text-sky-400 mb-1">
                    03 · Technical Expertise
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                    Core Infrastructure Stack
                  </h2>
                </div>
                <div className="text-xs text-zinc-400 font-mono tabular-nums">
                  NetApp · Brocade · ONTAP · Windows Server · Linux Server
                </div>
              </div>

              {/* Technical Competencies List */}
              <div className="divide-y divide-white/[0.07] mb-5">
                {ARCHIVE_ENTRIES.map((entry) => (
                  <div
                    key={entry.index}
                    onClick={() => {
                      soundFx.playChirp(860, 0.04);
                      onSelectSculptureForm(
                        entry.index === '01' || entry.index === '03'
                          ? 'wireframe'
                          : entry.index === '02' || entry.index === '04'
                          ? 'metaball'
                          : 'constellation'
                      );
                    }}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer group hover:bg-white/[0.03] px-3 -mx-3 rounded-lg transition-colors"
                  >
                    <div className="space-y-0.5 max-w-xl">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-sky-400 tabular-nums">
                          {entry.index}
                        </span>
                        <span className="text-sm font-display font-semibold text-white group-hover:text-sky-300 transition-colors">
                          {entry.title}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 pl-7">
                        {entry.note}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-400 pl-7 sm:pl-0 shrink-0">
                      <span>{entry.medium}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums text-white font-semibold">
                        {entry.year}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Verified Certifications Strip */}
              {/* <div className="pt-4 border-t border-white/[0.08]">
                <div className="text-xs text-zinc-400 mb-2.5">
                  Verified Professional Certifications
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {CERTIFICATIONS.map((c) => (
                    <div key={c.code} className="space-y-0.5">
                      <div className="text-xs font-mono font-semibold text-sky-400">
                        {c.code}
                      </div>
                      <div className="text-[11px] text-zinc-300 leading-snug">
                        {c.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}
            </motion.div>
          )}

          {/* -----------------------------------------------------------------
              CHAPTER 04: CONTACT (Direct Contact & Resume Download)
          ----------------------------------------------------------------- */}
          {activeSection === 'contact' && (
            <motion.div
              key="stage-contact"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl mx-auto pointer-events-auto grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#08080b]/85 border border-white/[0.09] rounded-2xl p-6 sm:p-8 max-h-[60vh] overflow-y-auto"
            >
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs text-sky-400 mb-1.5">
                    04 · Get in Touch
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight mb-2">
                    Contact Nezard Wildan
                  </h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Open to opportunities in Enterprise Infrastructure Engineering, NetApp Storage, Data Center & Disaster Recovery, and SAN Infrastructure.
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                  <div>
                    <div className="text-[11px] text-zinc-500 mb-0.5">Direct Email</div>
                    <a
                      href={`mailto:${ARTIST_INFO.email}`}
                      className="text-sm font-medium text-white hover:text-sky-300 transition-colors break-all"
                    >
                      {ARTIST_INFO.email}
                    </a>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-medium text-zinc-200 transition-colors"
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Copy Email</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        onDownloadMonograph();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-medium text-zinc-300 transition-colors"
                    >
                      <span>Download CV</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                {formSent ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-6 space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    <h3 className="text-lg font-display font-semibold text-white">
                      Message Sent
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-sm">
                      Thank you, {formData.name}. Your message has been registered for {ARTIST_INFO.name}.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFormSent(false);
                        setFormData({ name: '', email: '', project: '' });
                      }}
                      className="px-4 py-1.5 rounded-full border border-white/[0.12] text-xs text-zinc-300 hover:text-white"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Alex Morgan"
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-xs focus:border-white/40 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Your Email</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="alex@enterprise.com"
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-xs focus:border-white/40 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">
                        Message or Project Inquiry
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={formData.project}
                        onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                        placeholder="Describe your storage infrastructure project, role opportunity, or consultation inquiry..."
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-xs focus:border-white/40 focus:outline-hidden resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold transition-colors"
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* =====================================================================
          FULL-DETAIL PROJECT CASE STUDY MODAL (Opens when clicking a 3D Plane)
      ===================================================================== */}
      <AnimatePresence>
        {selectedWork && (
          <motion.div
            data-ui-overlay="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
            onClick={() => onSelectWork(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl bg-[#0b0b0f] border border-white/[0.12] p-8 sm:p-10 space-y-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                    <span className="font-mono text-sky-400">{selectedWork.index}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedWork.client}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{selectedWork.year}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                    {selectedWork.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">{selectedWork.subtitle}</p>
                </div>

                <button
                  type="button"
                  aria-label="Close Case Study"
                  onClick={() => onSelectWork(null)}
                  className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                {selectedWork.description}
              </p>

              {/* Quantitative Project Metrics */}
              <div
                className={`grid gap-4 py-4 border-y border-white/[0.08] ${
                  selectedWork.metrics.length >= 4
                    ? 'grid-cols-2 sm:grid-cols-4'
                    : 'grid-cols-3'
                }`}
              >
                {selectedWork.metrics.map((m, idx) => (
                  <div key={idx}>
                    <div className="text-lg sm:text-xl font-display font-semibold text-white font-mono tabular-nums">
                      {m.value}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Architectural Implementation Highlights */}
              <div className="space-y-2.5">
                <div className="text-xs font-medium text-zinc-500">
                  Key Architectural Implementations
                </div>
                {selectedWork.conceptNotes.map((note, nIdx) => (
                  <div key={nIdx} className="flex items-baseline gap-3 text-xs sm:text-sm text-zinc-300">
                    <span className="font-mono text-xs text-sky-400 shrink-0">
                      0{nIdx + 1}.
                    </span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          UNIFIED SINGLE-LINE BOTTOM CONTROL DOCK (Never wraps or covers text)
      ===================================================================== */}
      <div
        data-ui-overlay="true"
        className="pointer-events-auto fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center transition-transform duration-300"
        style={{
          maxWidth: 'min(940px, 94vw)',
          transform: dockCollapsed ? 'translate(0, calc(100% - 26px))' : 'translate(0, 0)',
        }}
      >
        {/* Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            setDockCollapsed(!dockCollapsed);
          }}
          className="mb-1 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0a0a0f]/95 border border-white/[0.1] text-[11px] font-medium text-zinc-400 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3 h-3" />
              <span>Show 3D Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              <span>Hide Controls (H)</span>
            </>
          )}
        </button>

        {/* Single-Line Compact Dock */}
        {!dockCollapsed && (
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full bg-[#0a0a0f]/95 border border-white/[0.12] shadow-2xl overflow-x-auto max-w-[95vw]">
            <span className="text-[11px] text-zinc-500 pl-2 pr-1 hidden sm:inline whitespace-nowrap shrink-0">
              3D Shape:
            </span>
            {(
              [
                { id: 'wireframe', label: 'Geodesic Mesh' },
                { id: 'metaball', label: 'Liquid Core' },
                { id: 'constellation', label: 'Particle Wave' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  soundFx.playChirp(760, 0.05);
                  onSelectSculptureForm(item.id);
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  sculptureForm === item.id
                    ? 'bg-white text-zinc-950 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="h-3.5 w-[1px] bg-white/[0.1] mx-1 shrink-0" />

            {/* Procedural Audio Toggle */}
            <button
              type="button"
              onClick={handleToggleAudio}
              aria-label="Toggle Sound"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {audioEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-white hidden sm:inline">Audio On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Muted</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
