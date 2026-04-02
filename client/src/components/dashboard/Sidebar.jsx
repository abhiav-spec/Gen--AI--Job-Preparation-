import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Bot, 
  FileText, 
  Settings, 
  LogOut,
  BrainCircuit,
  PieChart,
  RefreshCw,
  Code,
  Briefcase,
  Info
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Bot size={20} />, label: 'Mock Interviews', path: '/dashboard/mock-interviews' },
    { icon: <FileText size={20} />, label: 'Report Generator', path: '/dashboard/report-generator' },
    { icon: <PieChart size={20} />, label: 'Skill Analysis', path: '/dashboard/skill-analysis' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/dashboard/settings' },
  ];

  const [showAbout, setShowAbout] = React.useState(false);

  return (
    <>
    <motion.aside 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed left-6 top-6 bottom-6 w-64 glass-surface rounded-[2rem] flex flex-col justify-between py-8 px-4 z-50 border border-t-[rgba(255,255,255,0.1)] border-l-[rgba(255,255,255,0.05)] border-r-0 border-b-0 shadow-[0_0_40px_rgba(192,193,255,0.03)]"
    >
      <div>
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-4 mb-10">
          <div className="w-10 h-10 rounded-xl ai-gradient-bg flex items-center justify-center shadow-[0_0_15px_rgba(93,230,255,0.4)]">
            <BrainCircuit className="text-[#0c0c1d]" size={24} />
          </div>
          <div>
            <h1 className="font-space text-lg font-bold text-white tracking-tight">HireStack</h1>
            <p className="text-[10px] uppercase text-[#c0c1ff] opacity-70 tracking-widest font-semibold">AI Intelligence</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item, idx) => {
            const active = location.pathname === item.path;
            return (
            <motion.button
              key={idx}
              onClick={() => navigate(item.path)}
              whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative ${
                active 
                  ? 'bg-[rgba(192,193,255,0.1)] text-white ai-ghost-border' 
                  : 'text-[#94a3b8] hover:text-[#c0c1ff]'
              }`}
            >
              <span className={`${active ? 'text-[#5de6ff] ai-glow-text' : ''}`}>
                {item.icon}
              </span>
              <span className="font-inter font-medium text-sm">{item.label}</span>
              {active && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="absolute right-2 w-1.5 h-6 rounded-full ai-gradient-bg shadow-[0_0_10px_rgba(93,230,255,0.5)]" 
                />
              )}
            </motion.button>
            );
          })}
        </nav>
      </div>

      <div>
        {/* Info Section */}
        <div className="px-4 mb-6 flex flex-col gap-3 pt-6 border-t border-[rgba(255,255,255,0.05)]">
          <button 
            onClick={() => setShowAbout(true)}
            className="flex items-center gap-3 text-[#94a3b8] hover:text-[#c0c1ff] transition-colors group"
          >
            <Info size={18} className="group-hover:text-[#5de6ff]" />
            <span className="text-xs font-semibold">About Us</span>
          </button>
          
          <div className="flex flex-col gap-2">
             <span className="text-[9px] uppercase font-bold text-[#94a3b8] tracking-widest pl-1">Follow Us</span>
             <div className="flex gap-2">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-[#94a3b8] hover:text-[#5de6ff] transition-all">
                   <Code size={14} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-[#c0c1ff] hover:text-white transition-all">
                   <Briefcase size={14} />
                </a>
             </div>
          </div>
        </div>

        {/* Footer Nav */}
        <div className="px-4">
          <motion.button
            whileHover={{ x: 4 }}
            onClick={handleLogout}
            className="flex items-center gap-4 py-3 px-4 w-full rounded-xl text-[#94a3b8] hover:text-white transition-colors group"
          >
            <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
            <span className="font-inter font-medium text-sm">Logout</span>
          </motion.button>

          {/* User Mini Profile */}
          <div className="mt-6 flex items-center gap-3 p-3 rounded-2xl glass-surface-low ai-ghost-border">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 overflow-hidden border border-[rgba(255,255,255,0.2)]">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}&background=random`} alt="User" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-white">{user?.username || 'User'}</span>
              <span className="text-[10px] text-[#c0c1ff]">Pro Member</span>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>

    {/* About Modal */}
    <AnimatePresence>
      {showAbout && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAbout(false)}
            className="fixed inset-0 bg-[#0c0c1d]/90 backdrop-blur-xl z-[200]"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg glass-surface p-10 rounded-[3rem] z-[201] border border-[rgba(93,230,255,0.2)] text-center"
          >
            <div className="w-16 h-16 rounded-2xl ai-gradient-bg flex items-center justify-center mx-auto mb-6">
              <BrainCircuit className="text-[#0c0c1d]" size={36} />
            </div>
            <h3 className="font-space text-2xl font-bold text-white mb-4">InsideHireStack</h3>
            <p className="font-inter text-sm text-[#94a3b8] leading-relaxed mb-8">
              HireStack is a next-generation career intelligence platform. We use proprietary neural engines to simulate technical scenarios, identify skill trajectories, and generate predictive performance analytics to help you dominate your next high-stakes interview.
            </p>
            <button 
              onClick={() => setShowAbout(false)}
              className="px-8 py-3 rounded-xl ai-gradient-bg text-[#0c0c1d] font-space font-bold uppercase tracking-widest text-xs"
            >
              Resume Mission
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
};

export default Sidebar;
