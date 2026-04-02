import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Hexagon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DashboardHeader = ({ onSearch }) => {
  const { user } = useAuth();
  
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
      className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 w-full pt-8 px-2 gap-6"
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-space text-3xl sm:text-4xl font-semibold text-white tracking-tight flex items-center gap-3">
          Welcome back, {user?.name ? user.name.split(' ')[0] : 'Commander'} 
          <span className="text-[#5de6ff] animate-pulse">
            <Hexagon size={24} className="fill-[rgba(93,230,255,0.2)]" />
          </span>
        </h1>
        <p className="font-inter text-[#94a3b8] text-sm sm:text-base tracking-wide mt-2 font-medium">
          Let's prepare for your next technical interview. Systems optimal.
        </p>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
        {/* Search Bar */}
        <div className="relative group flex items-center h-12 glass-surface-low rounded-full px-5 flex-1 md:w-64 border border-[rgba(255,255,255,0.05)] transition-all hover:border-[rgba(192,193,255,0.3)] hover:shadow-[0_0_20px_rgba(93,230,255,0.1)]">
          <Search size={18} className="text-[#94a3b8] mr-3 group-hover:text-[#5de6ff] transition-colors" />
          <input 
            type="text" 
            placeholder="Search reports..." 
            onChange={(e) => onSearch(e.target.value)}
            className="bg-transparent text-sm w-full outline-none text-white placeholder-[rgba(192,193,255,0.5)] font-inter"
          />
        </div>

        {/* Notifications */}
        <button className="relative shrink-0 w-12 h-12 flex items-center justify-center rounded-full glass-surface border border-[rgba(255,255,255,0.1)] transition-transform hover:scale-105 ai-glow-shadow">
          <Bell size={20} className="text-[#c0c1ff]" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[#5de6ff] border-2 border-[#121223] shadow-[0_0_10px_#5de6ff]"></span>
        </button>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
