import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Bot, 
  FileText, 
  Settings, 
  LogOut,
  BrainCircuit,
  PieChart,
  Code,
  Briefcase,
  Info,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

// ─── Desktop Sidebar (always visible on xl+) ────────────────────────────────
const SidebarContent = ({ onNavigate, user, handleLogout, setShowAbout }) => {
  const location = useLocation();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard', exact: true },
    { icon: <Bot size={20} />, label: 'Mock Interviews', path: '/dashboard/mock-interview', navPath: '/dashboard/mock-interviews', exact: false },
    { icon: <FileText size={20} />, label: 'Report Generator', path: '/dashboard/report-generator', exact: true },
    { icon: <PieChart size={20} />, label: 'View Report', path: '/dashboard/view-report', exact: true },
    { icon: <Settings size={20} />, label: 'Settings', path: '/dashboard/settings', exact: true },
  ];

  return (
    <div className="flex flex-col h-full justify-between py-8 px-4">
      {/* Top: Logo + Nav */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 mb-10">
          <div className="w-10 h-10 rounded-xl ai-gradient-bg flex items-center justify-center shadow-[0_0_15px_rgba(93,230,255,0.4)] flex-shrink-0">
            <BrainCircuit className="text-[#0c0c1d]" size={22} />
          </div>
          <div>
            <h1 className="font-space text-lg font-bold text-white tracking-tight leading-none">HireStack</h1>
            <p className="text-[10px] uppercase text-[#c0c1ff] opacity-70 tracking-widest font-semibold mt-0.5">AI Intelligence</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5" role="navigation" aria-label="Main navigation">
          {navItems.map((item, idx) => {
            const active = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <motion.button
                key={idx}
                onClick={() => onNavigate(item.navPath || item.path)}
                whileHover={{ x: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 relative text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5de6ff]/50 ${ 
                  active 
                    ? 'bg-[rgba(192,193,255,0.1)] text-white ai-ghost-border' 
                    : 'text-[#94a3b8] hover:text-[#c0c1ff]'
                }`}
              >
                <span className={`flex-shrink-0 ${active ? 'text-[#5de6ff] ai-glow-text' : ''}`}>
                  {item.icon}
                </span>
                <span className="font-inter font-medium text-sm">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-3 w-1.5 h-5 rounded-full ai-gradient-bg shadow-[0_0_10px_rgba(93,230,255,0.5)]"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: About, Social, Logout, Profile */}
      <div>
        {/* Info / Social */}
        <div className="px-4 mb-5 flex flex-col gap-3 pt-5 border-t border-[rgba(255,255,255,0.05)]">
          <button 
            onClick={() => setShowAbout(true)}
            className="flex items-center gap-3 text-[#94a3b8] hover:text-[#c0c1ff] transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5de6ff]/50 rounded-lg"
            aria-label="About HireStack"
          >
            <Info size={17} className="group-hover:text-[#5de6ff] transition-colors" />
            <span className="text-xs font-semibold font-inter">About Us</span>
          </button>
          
          <div className="flex flex-col gap-2">
            <span className="text-[9px] uppercase font-bold text-[#94a3b8] tracking-widest pl-0.5">Follow Us</span>
            <div className="flex gap-2">
              <a href="https://github.com" target="_blank" rel="noreferrer"
                aria-label="GitHub"
                className="p-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-[#94a3b8] hover:text-[#5de6ff] hover:border-[rgba(93,230,255,0.25)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5de6ff]/50">
                <Code size={14} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-[#c0c1ff] hover:text-white hover:border-[rgba(192,193,255,0.25)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5de6ff]/50">
                <Briefcase size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="px-4">
          <motion.button
            whileHover={{ x: 3 }}
            onClick={handleLogout}
            className="flex items-center gap-4 py-3 px-4 w-full rounded-xl text-[#94a3b8] hover:text-[#ef4444] transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5de6ff]/50"
            aria-label="Logout"
          >
            <LogOut size={18} className="flex-shrink-0 transition-colors" />
            <span className="font-inter font-medium text-sm">Logout</span>
          </motion.button>

          {/* User Mini Profile */}
          <div className="mt-4 flex items-center gap-3 p-3 rounded-2xl glass-surface-low ai-ghost-border">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[rgba(255,255,255,0.2)] flex-shrink-0">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}&background=random`} 
                alt={user?.username || 'User avatar'} 
              />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-sm font-semibold text-white truncate">{user?.username || 'User'}</span>
              <span className="text-[10px] text-[#c0c1ff]">Standard Member</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── About Modal ─────────────────────────────────────────────────────────────
const AboutModal = ({ show, onClose }) => (
  <AnimatePresence>
    {show && (
      <>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0c0c1d]/90 backdrop-blur-xl z-[200]"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md glass-surface p-8 sm:p-10 rounded-[2.5rem] z-[201] border border-[rgba(93,230,255,0.2)] text-center shadow-[0_0_60px_rgba(0,0,0,0.5)]"
        >
          <div className="w-16 h-16 rounded-2xl ai-gradient-bg flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(93,230,255,0.4)]">
            <BrainCircuit className="text-[#0c0c1d]" size={36} />
          </div>
          <h2 className="font-space text-2xl font-bold text-white mb-3">About HireStack</h2>
          <div className="w-10 h-0.5 bg-[#5de6ff]/30 rounded-full mb-5 mx-auto" />
          <p className="font-inter text-sm text-[#94a3b8] leading-relaxed mb-8">
            HireStack is a next-generation career intelligence platform. We use proprietary neural engines to simulate technical scenarios, identify skill trajectories, and generate predictive performance analytics.
          </p>
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-xl ai-gradient-bg text-[#0c0c1d] font-space font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(93,230,255,0.4)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5de6ff]"
          >
            Close
          </button>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ─── Main Sidebar Export ──────────────────────────────────────────────────────
const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false); // auto-close on mobile nav
  };

  const sharedProps = { onNavigate: handleNavigate, user, handleLogout, setShowAbout };

  return (
    <>
      {/* ── Mobile Hamburger Button (visible on < xl) ── */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        className="xl:hidden fixed top-5 left-4 z-[60] w-11 h-11 rounded-xl glass-surface border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#c0c1ff] hover:text-[#5de6ff] hover:border-[rgba(93,230,255,0.3)] transition-all shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5de6ff]/50"
      >
        <Menu size={20} />
      </button>

      {/* ── Desktop Sidebar ── */}
      <motion.aside
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="hidden xl:flex fixed left-4 top-4 bottom-4 w-64 glass-surface rounded-[2rem] flex-col z-50 border border-[rgba(255,255,255,0.08)] shadow-[0_0_60px_rgba(0,0,0,0.3)] overflow-hidden"
        aria-label="Desktop sidebar navigation"
      >
        <SidebarContent {...sharedProps} />
      </motion.aside>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="xl:hidden fixed inset-0 bg-[#0c0c1d]/80 backdrop-blur-md z-[70]"
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="xl:hidden fixed left-0 top-0 bottom-0 w-72 glass-surface flex flex-col z-[80] border-r border-[rgba(255,255,255,0.08)] shadow-2xl overflow-hidden"
              aria-label="Mobile navigation drawer"
            >
              {/* Close Button */}
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="absolute top-5 right-4 w-9 h-9 rounded-xl flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5de6ff]/50"
              >
                <X size={18} />
              </button>

              <div className="h-full overflow-y-auto">
                <SidebarContent {...sharedProps} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── About Modal ── */}
      <AboutModal show={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
};

export default Sidebar;
