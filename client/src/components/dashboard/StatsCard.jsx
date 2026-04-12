import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon, delay = 0, progress = 75, trend = "+4% from last week" }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: delay }}
      className="glass-surface-low rounded-3xl p-6 flex flex-col gap-4 border border-white/5 hover:border-secondary/20 transition-all hover:bg-white/5 hover:-translate-y-1 shadow-lg h-full group"
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary group-hover:scale-110 group-hover:bg-secondary/20 transition-all duration-300">
          {icon}
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">{trend}</span>
        </div>
      </div>

      <div className="flex flex-col">
        <span className="font-space text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1 group-hover:text-slate-300 transition-colors">
          {title}
        </span>
        <div className="flex items-end gap-2 mb-4">
            <span className="font-space text-4xl font-bold text-white tracking-tighter">
                {value}
            </span>
            <span className="text-slate-600 text-sm font-bold mb-1.5 uppercase">/100</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-900/60 rounded-full overflow-hidden border border-white/5">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, delay: delay + 0.5, ease: "circOut" }}
                className="h-full premium-gradient-bg shadow-[0_0_10px_rgba(124,58,237,0.5)]"
            />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
