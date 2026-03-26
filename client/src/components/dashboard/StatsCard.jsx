import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon, delay = 0 }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: delay }}
      className="glass-surface-low rounded-[2rem] p-6 flex items-start gap-4 border border-[rgba(255,255,255,0.05)] ai-ghost-border transition-all hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(192,193,255,0.2)] hover:shadow-[0_0_20px_rgba(93,230,255,0.05)] flex-1 min-w-[200px]"
    >
      <div className="w-12 h-12 rounded-2xl glass-surface flex items-center justify-center text-[#5de6ff] border border-[rgba(93,230,255,0.2)] shadow-[inset_0_0_15px_rgba(93,230,255,0.1)]">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="font-space text-[11px] uppercase tracking-widest text-[#c0c1ff] font-semibold mb-1">
          {title}
        </span>
        <span className="font-space text-3xl font-bold text-white tracking-tighter ai-glow-text">
          {value}
        </span>
      </div>
    </motion.div>
  );
};

export default StatsCard;
