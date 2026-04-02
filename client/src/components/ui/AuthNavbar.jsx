import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Briefcase, BrainCircuit, ExternalLink, Info, Heart } from 'lucide-react';

const AuthNavbar = () => {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
    >
      {/* Brand - HireStack */}
      <div className="flex items-center gap-2 group cursor-pointer">
        <div className="w-8 h-8 rounded-lg ai-gradient-bg flex items-center justify-center shadow-[0_0_15px_rgba(93,230,255,0.3)] group-hover:scale-110 transition-transform">
          <BrainCircuit className="text-[#0c0c1d]" size={18} />
        </div>
        <span className="font-space text-xl font-bold text-white tracking-tight">HireStack</span>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-8">
        {/* Follow Us */}
        <div className="flex items-center gap-4">
          <span className="font-space text-[10px] sm:text-xs uppercase font-bold text-[#94a3b8] tracking-widest hidden sm:block">Follow Us</span>
          <div className="flex gap-2">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="w-8 h-8 rounded-full glass-surface border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#c0c1ff] hover:text-white hover:border-[#5de6ff] transition-all hover:shadow-[0_0_10px_rgba(93,230,255,0.2)]"
            >
              <Code size={16} />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noreferrer"
              className="w-8 h-8 rounded-full glass-surface border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#c0c1ff] hover:text-white hover:border-[#5de6ff] transition-all hover:shadow-[0_0_10px_rgba(93,230,255,0.2)]"
            >
              <Briefcase size={16} />
            </a>
          </div>
        </div>

        {/* About Us Link */}
        <button 
          onClick={() => setShowAbout(true)}
          className="font-space text-[10px] sm:text-xs uppercase font-bold text-[#c0c1ff] hover:text-[#5de6ff] tracking-widest transition-colors flex items-center gap-2"
        >
          <Info size={14} />
          About Us
        </button>
      </div>

      {/* About Us Modal Overlay */}
      <AnimatePresence>
        {showAbout && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAbout(false)}
              className="fixed inset-0 bg-[#0c0c1d]/80 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg glass-surface border border-[rgba(93,230,255,0.2)] rounded-[2.5rem] p-8 sm:p-10 z-[101] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl ai-gradient-bg flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(93,230,255,0.4)]">
                  <BrainCircuit className="text-[#0c0c1d]" size={36} />
                </div>
                <h2 className="font-space text-3xl font-bold text-white mb-4">About HireStack</h2>
                <div className="w-12 h-1 bg-[#5de6ff]/30 rounded-full mb-6" />
                
                <p className="font-inter text-[#94a3b8] leading-relaxed mb-6">
                  HireStack is an advanced AI-driven diagnostic platform designed to bridge the gap between technical expertise and interview performance. 
                  Our neural engine analyzes your persona against industry benchmarks to generate predictive interview simulations.
                </p>

                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                  <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-4 rounded-2xl">
                    <span className="text-[#5de6ff] font-space font-bold text-sm block mb-1">Precision</span>
                    <p className="text-[10px] text-[#94a3b8]">AI-extracted technical insights.</p>
                  </div>
                  <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-4 rounded-2xl">
                    <span className="text-[#c0c1ff] font-space font-bold text-sm block mb-1">Automation</span>
                    <p className="text-[10px] text-[#94a3b8]">Seamless report generation.</p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowAbout(false)}
                  className="px-8 py-3 rounded-xl ai-gradient-bg text-[#0c0c1d] font-space font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(93,230,255,0.4)] transition-all"
                >
                  Close Diagnostic
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default AuthNavbar;
