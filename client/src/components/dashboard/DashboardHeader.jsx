import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Hexagon, User, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAsRead, markAllAsRead } from '../../api/notification.api';

const DashboardHeader = ({ onSearch }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setShowNotifs(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
        const res = await getNotifications();
        if (res.data.success) {
            setNotifications(res.data.data);
        }
    } catch (err) {
        console.error('Failed to fetch notifications:', err);
    }
  };

  const handleMarkAsRead = async (id, link) => {
    try {
        await markAsRead(id);
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        if (link) navigate(link);
        setShowNotifs(false);
    } catch (err) {
        console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
        await markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
        console.error('Failed to mark all read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
      className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 w-full pt-8 px-2 gap-6 relative z-[100]"
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-space text-3xl sm:text-4xl font-semibold text-white tracking-tight flex items-center gap-3">
          Welcome back, {user?.username ? user.username.split(' ')[0] : 'Commander'} 
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
            onChange={(e) => onSearch?.(e.target.value)}
            className="bg-transparent text-sm w-full outline-none text-white placeholder-[rgba(192,193,255,0.5)] font-inter"
          />
        </div>

        {/* Notifications & Profile */}
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className={`relative shrink-0 w-12 h-12 flex items-center justify-center rounded-full glass-surface border ${showNotifs ? 'border-[#5de6ff] shadow-[0_0_15px_rgba(93,230,255,0.3)]' : 'border-[rgba(255,255,255,0.1)]'} transition-all hover:scale-105 ai-glow-shadow`}
          >
            <Bell size={20} className={unreadCount > 0 ? 'text-[#5de6ff]' : 'text-[#c0c1ff]'} />
            {unreadCount > 0 && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[#5de6ff] border-2 border-[#121223] shadow-[0_0_10px_#5de6ff] animate-pulse"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute top-16 right-0 w-[320px] sm:w-[380px] glass-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[101]"
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <span className="font-space font-bold text-xs uppercase tracking-widest text-white">Neural Alerts</span>
                  {unreadCount > 0 && (
                    <button 
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-[#5de6ff] hover:underline font-bold"
                    >
                        Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif._id}
                        onClick={() => handleMarkAsRead(notif._id, notif.link)}
                        className={`p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/[0.03] relative group ${!notif.isRead ? 'bg-[#5de6ff]/[0.02]' : ''}`}
                      >
                        {!notif.isRead && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 ai-gradient-bg" />
                        )}
                        <div className="flex gap-3">
                           <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.type === 'MOCK_INTERVIEW' ? 'bg-[#5de6ff]/10 text-[#5de6ff]' : 'bg-[#c0c1ff]/10 text-[#c0c1ff]'}`}>
                             {notif.type === 'MOCK_INTERVIEW' ? <Bot size={16} /> : <Sparkles size={16} />}
                           </div>
                           <div className="flex-1">
                             <div className="flex justify-between items-start mb-1">
                                <h4 className="text-[11px] font-bold text-white uppercase tracking-tight">{notif.title}</h4>
                                <span className="text-[9px] text-[#475569]">{new Date(notif.createdAt).toLocaleDateString()}</span>
                             </div>
                             <p className="text-[10px] text-[#94a3b8] leading-relaxed mb-2 line-clamp-2">{notif.message}</p>
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-[9px] text-[#475569]">
                                   <Clock size={10} /> {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <span className="text-[9px] font-bold text-[#5de6ff] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                   View Report <ExternalLink size={8} />
                                </span>
                             </div>
                           </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                        <Bell size={24} className="mx-auto mb-3 text-[#1e293b] opacity-20" />
                        <p className="text-xs text-[#475569] font-medium">No alerts detected in system log.</p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                    <div className="p-3 bg-white/[0.02] text-center">
                        <button 
                            onClick={() => { setShowNotifs(false); navigate('/dashboard/mock-interviews'); }}
                            className="text-[9px] uppercase font-bold tracking-widest text-[#94a3b8] hover:text-white transition-colors"
                        >
                            View All Interviews
                        </button>
                    </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => navigate('/dashboard/settings')}
            className="group relative shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl glass-surface-low border border-[rgba(93,230,255,0.15)] transition-all hover:border-secondary hover:shadow-[0_0_15px_rgba(93,230,255,0.2)]"
          >
            <div className="w-8 h-8 rounded-xl ai-gradient-bg flex items-center justify-center text-[#0c0c1d] font-space font-bold text-xs uppercase">
              {user?.username ? user.username[0] : <User size={16} />}
            </div>
            {/* Tooltip hint */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-[#121223] border border-white/10 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Account Settings
            </div>
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
