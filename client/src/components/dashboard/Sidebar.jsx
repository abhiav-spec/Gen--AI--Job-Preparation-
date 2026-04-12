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
    { icon: <Briefcase size={20} />, label: 'Analyse', path: '/dashboard/report-generator', exact: true },
    { icon: <Bot size={20} />, label: 'Mock Interview', path: '/dashboard/mock-interview', exact: false },
    { icon: <FileText size={20} />, label: 'Reports', path: '/dashboard/view-report', exact: true },
  ];

  return (
    <div className="flex flex-col h-full justify-between py-8 px-4">
      {/* Top: Logo + Nav */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 mb-10">
          <div className="w-10 h-10 rounded-xl premium-gradient-bg flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)] flex-shrink-0">
            <BrainCircuit className="text-white" size={22} />
          </div>
          <div>
            <h1 className="font-space text-lg font-bold text-white tracking-tight leading-none">HireStack</h1>
            <p className="text-[10px] uppercase text-primary-light opacity-80 tracking-widest font-semibold mt-0.5">Recruitment Suite</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2" role="navigation" aria-label="Main navigation">
          {navItems.map((item, idx) => {
            const active = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <motion.button
                key={idx}
                onClick={() => onNavigate(item.path)}
                whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 relative text-left w-full focus:outline-none ${ 
                  active 
                    ? 'premium-gradient-bg text-white active-glow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className={`flex-shrink-0 ${active ? 'text-white' : 'group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <span className="font-inter font-semibold text-sm tracking-tight">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-6">
        {/* Create New Job Button */}
        <div className="px-2">
            <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('/dashboard/report-generator')}
                className="w-full py-4 rounded-2xl premium-gradient-bg text-white font-space font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(124,58,237,0.3)] hover:shadow-[0_15px_35px_rgba(124,58,237,0.5)] transition-all"
            >
                <Briefcase size={16} />
                Analyse
            </motion.button>
        </div>

        {/* Footer info & Logout */}
        <div className="px-2 pt-6 border-t border-white/5">
          <div className="flex flex-col gap-1 mb-4">
             <button 
                onClick={() => setShowAbout(true)}
                className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-colors text-xs font-medium"
             >
                <Info size={16} />
                Support
             </button>
             <button 
                onClick={() => onNavigate('/dashboard/settings')}
                className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-colors text-xs font-medium"
             >
                <Settings size={16} />
                Settings
             </button>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all text-xs font-bold uppercase tracking-wider"
          >
            <LogOut size={16} />
            Sign Out
          </button>
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
