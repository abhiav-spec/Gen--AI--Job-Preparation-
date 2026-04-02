import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Activity, CheckCircle, Clock, FileText } from 'lucide-react';

const CircularProgressIndicator = ({ percentage }) => {
  const radius = 64;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-full my-10">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 drop-shadow-[0_0_15px_rgba(93,230,255,0.4)]"
      >
        <circle
          stroke="rgba(255,255,255,0.05)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          stroke="url(#gradient)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + ' ' + circumference}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c0c1ff" />
            <stop offset="100%" stopColor="#5de6ff" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-space text-5xl font-bold tracking-tighter text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          {percentage}
        </span>
        <span className="font-space text-[10px] uppercase font-bold text-[#5de6ff] tracking-[0.2em]">
          Readiness
        </span>
      </div>
    </div>
  );
};

const AnimatedWaveform = () => {
  // Simple CSS animated bars
  const bars = Array.from({ length: 15 });
  
  return (
    <div className="flex items-end justify-center w-full h-12 gap-1 mb-8">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          initial={{ height: 4 }}
          animate={{ height: ['10%', '100%', '40%', '80%', '20%'] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
            delay: i * 0.1,
          }}
          className="w-1.5 rounded-full ai-gradient-bg shadow-[0_0_5px_rgba(93,230,255,0.6)]"
        />
      ))}
    </div>
  );
};

const RecentActivityItem = ({ icon, text, time, success }) => (
  <div className="flex items-start gap-3 py-3 border-b border-[rgba(255,255,255,0.05)] last:border-0 relative before:absolute before:left-2.5 before:top-8 before:bottom-[-8px] before:w-[2px] before:bg-[rgba(255,255,255,0.03)] last:before:hidden">
    <div className={`mt-0.5 p-1.5 rounded-full z-10 glass-surface border border-[rgba(255,255,255,0.1)] shadow-[0_0_10px_rgba(255,255,255,0.05)]
        ${success ? 'text-green-400' : 'text-[#c0c1ff]'}
    `}>
      {icon}
    </div>
    <div className="flex flex-col flex-1 pl-1">
      <span className="font-inter text-sm text-[#e2e8f0] font-medium leading-tight">
        {text}
      </span>
      <span className="font-inter text-xs text-[#94a3b8] mt-1 flex items-center gap-1">
        <Clock size={10} /> {time}
      </span>
    </div>
  </div>
);

const AIStatusPanel = () => {
  const [score, setScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setScore(94), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.aside
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
      className="sticky top-6 w-80 glass-surface rounded-[2rem] p-6 border border-l-[rgba(255,255,255,0.1)] border-t-[rgba(255,255,255,0.05)] shadow-none flex flex-col z-40 bg-[rgba(12,12,29,0.7)] h-[calc(100vh-3rem)] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-space text-lg font-bold text-white tracking-tight">AI Telemetry</h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#5de6ff] shadow-[0_0_8px_#5de6ff] animate-pulse"></span>
          <span className="font-space text-[10px] uppercase font-bold text-[#5de6ff] tracking-widest">Online</span>
        </div>
      </div>

      <div className="mt-6 glass-surface-low rounded-[1.5rem] p-4 border border-[rgba(255,255,255,0.03)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(93,230,255,0.05)_0%,transparent_70%)]" />
        <CircularProgressIndicator percentage={score} />
        
        <div className="flex items-center justify-between text-xs font-inter font-medium px-2">
          <div className="flex flex-col items-center">
            <span className="text-[#94a3b8] uppercase tracking-wider text-[9px] mb-1">Vocal Clarity</span>
            <span className="text-[#c0c1ff]">98%</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[#94a3b8] uppercase tracking-wider text-[9px] mb-1">Logic Pattern</span>
            <span className="text-[#c0c1ff]">89%</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Mic size={14} className="text-[#c0c1ff]" />
          <span className="font-space text-xs uppercase font-bold text-[#c0c1ff] tracking-widest">Live Audio Stream</span>
        </div>
        
        <div className="p-4 rounded-[1.5rem] glass-surface-low border border-[rgba(255,255,255,0.03)] relative">
          <AnimatedWaveform />
          <div className="text-center font-inter text-[11px] text-[#94a3b8] font-medium tracking-wide">
            Awaiting vocal input for immediate diagnosis...
          </div>
        </div>
      </div>

      <div className="mt-8 flex-1">
        <h4 className="font-space text-sm font-bold text-white tracking-tight mb-4 flex items-center gap-2">
          <Activity size={16} className="text-[#5de6ff]" />
          Recent Activity
        </h4>
        
        <div className="flex flex-col">
          <RecentActivityItem 
            icon={<CheckCircle size={12} />} 
            text="Core Database Sync" 
            time="2 mins ago" 
            success={true} 
          />
          <RecentActivityItem 
            icon={<FileText size={12} />} 
            text="Resume Optimization V2" 
            time="1 hour ago" 
            success={false} 
          />
          <RecentActivityItem 
            icon={<Activity size={12} />} 
            text="Full System Diagnostic" 
            time="3 hours ago" 
            success={false} 
          />
        </div>
      </div>
      
      {/* Footer sticky action button */}
      <div className="mt-auto pt-6">
        <button className="w-full py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#5de6ff] font-space text-xs uppercase tracking-widest font-bold hover:bg-[rgba(93,230,255,0.1)] transition-colors flex items-center justify-center gap-2 group">
          <Activity size={14} className="group-hover:animate-spin" />
          Initialize Sync
        </button>
      </div>
    </motion.aside>
  );
};

export default AIStatusPanel;
