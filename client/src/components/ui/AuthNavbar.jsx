import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Briefcase, BrainCircuit, Info, X } from 'lucide-react';

const AuthNavbar = () => {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      {/* ── Navbar ── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between"
        aria-label="Site navigation"
      >
        {/* ── Brand ── */}
        <div className="flex items-center gap-2.5 group cursor-pointer select-none">
          <div className="w-9 h-9 rounded-xl ai-gradient-bg flex items-center justify-center shadow-[0_0_15px_rgba(93,230,255,0.3)] group-hover:scale-110 transition-transform duration-200">
            <BrainCircuit className="text-[#0c0c1d]" size={18} />
          </div>
          <span className="font-space text-xl font-bold text-white tracking-tight">HireStack</span>
        </div>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-5 sm:gap-7">
          {/* Social Links — hidden on very small screens */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-[#94a3b8] tracking-widest hidden md:block">Follow</span>
            <div className="flex gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-full glass-surface border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#c0c1ff] hover:text-white hover:border-[#5de6ff] transition-all duration-200 hover:shadow-[0_0_10px_rgba(93,230,255,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5de6ff]/50"
              >
                <Code size={15} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full glass-surface border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#c0c1ff] hover:text-white hover:border-[#5de6ff] transition-all duration-200 hover:shadow-[0_0_10px_rgba(93,230,255,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5de6ff]/50"
              >
                <Briefcase size={15} />
              </a>
            </div>
          </div>

          {/* About Button */}
          <button
            onClick={() => setShowAbout(true)}
            aria-label="About HireStack"
            className="flex items-center gap-1.5 font-space text-[11px] sm:text-xs uppercase font-bold text-[#c0c1ff] hover:text-[#5de6ff] tracking-widest transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5de6ff]/50 rounded-lg px-1 py-1"
          >
            <Info size={14} className="flex-shrink-0" />
            <span className="hidden sm:inline">About Us</span>
          </button>
        </div>
      </motion.nav>

      {/* ── About Modal ── */}
      <AnimatePresence>
        {showAbout && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAbout(false)}
              className="fixed inset-0 bg-[#0c0c1d]/80 backdrop-blur-md z-[100]"
              aria-hidden="true"
            />

            {/* Modal Panel */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="About HireStack"
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[440px] glass-surface border border-[rgba(93,230,255,0.2)] rounded-[2.5rem] p-8 sm:p-10 z-[101] shadow-[0_0_60px_rgba(0,0,0,0.5)]"
            >
              {/* Close */}
              <button
                onClick={() => setShowAbout(false)}
                aria-label="Close modal"
                className="absolute top-5 right-5 w-9 h-9 rounded-xl flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-white/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5de6ff]/50"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl ai-gradient-bg flex items-center justify-center mb-6 shadow-[0_0_24px_rgba(93,230,255,0.4)]">
                  <BrainCircuit className="text-[#0c0c1d]" size={36} />
                </div>
                <h2 className="font-space text-2xl font-bold text-white mb-3">About HireStack</h2>
                <div className="w-10 h-0.5 bg-[#5de6ff]/30 rounded-full mb-5" />

                <p className="font-inter text-sm text-[#94a3b8] leading-relaxed mb-7">
                  HireStack is an advanced AI-driven diagnostic platform designed to bridge the gap between technical
                  expertise and interview performance. Our neural engine analyzes your persona against industry
                  benchmarks to generate predictive interview simulations.
                </p>

                <div className="grid grid-cols-2 gap-3 w-full mb-8">
                  <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-4 rounded-2xl text-left">
                    <span className="text-[#5de6ff] font-space font-bold text-sm block mb-1">Precision</span>
                    <p className="text-[11px] text-[#94a3b8] leading-relaxed">AI-extracted technical insights.</p>
                  </div>
                  <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-4 rounded-2xl text-left">
                    <span className="text-[#c0c1ff] font-space font-bold text-sm block mb-1">Automation</span>
                    <p className="text-[11px] text-[#94a3b8] leading-relaxed">Seamless report generation.</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAbout(false)}
                  className="px-8 py-3 rounded-xl ai-gradient-bg text-[#0c0c1d] font-space font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(93,230,255,0.4)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5de6ff]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AuthNavbar;
