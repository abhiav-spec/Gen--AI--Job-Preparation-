import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';

const InterviewStartCard = () => {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative overflow-hidden glass-surface rounded-[2.5rem] p-10 flex flex-col justify-between border border-[rgba(93,230,255,0.15)] shadow-[0_40px_100px_rgba(0,0,0,0.4),0_0_80px_rgba(93,230,255,0.05)] min-h-[380px] group"
    >
      {/* Animated Deep Space Background elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(93,230,255,0.1)__0%,transparent_60%)] -translate-x-[10%] -translate-y-[20%] opacity-50 blur-xl mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(192,193,255,0.1)__0%,transparent_70%)] opacity-40 blur-xl mix-blend-screen" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBINDBWMHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxeHB4Ii8+Cjwvc3ZnPg==')] opacity-30 mask-image:linear-gradient(to_bottom,transparent,black)]"></div>

      <div className="relative z-10 flex flex-col items-start gap-4">
        <div className="w-16 h-16 rounded-[1.5rem] glass-surface flex items-center justify-center bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] shadow-[0_0_30px_rgba(93,230,255,0.2)] mb-4">
          <Zap className="text-[#5de6ff] animate-pulse" size={28} />
        </div>
        
        <h2 className="font-space text-4xl sm:text-5xl font-bold tracking-tight text-white m-0">
          Initiate <br /> <span className="ai-gradient-text drop-shadow-[0_0_12px_rgba(93,230,255,0.8)]">Simulation</span>
        </h2>
        
        <p className="font-inter text-[#94a3b8] text-base leading-relaxed max-w-sm mt-2">
          Run a fresh AI diagnostic on your latest skills. The neural engine is fully primed.
        </p>
      </div>

      <div className="relative z-10 mt-10">
        <motion.button
          whileHover={{ scale: 1.02, textShadow: "0 0 8px rgba(255,255,255,0.5)" }}
          whileTap={{ scale: 0.98 }}
          className="group relative flex items-center justify-between w-full sm:w-auto px-8 py-4 bg-[linear-gradient(135deg,#c0c1ff_0%,#5de6ff_100%)] text-[#0c0c1d] rounded-2xl font-inter font-bold text-lg overflow-hidden outline-none border-none ai-button-glow shadow-[0_0_30px_rgba(93,230,255,0.4)] transition-all duration-300 transform-gpu"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.4)] to-transparent" />
          
          Start AI Interview
          <ChevronRight className="ml-4 opacity-70 group-hover:opacity-100 transition-opacity" size={22} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default InterviewStartCard;
