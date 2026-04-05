import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Shield, Bell, Moon, 
  LogOut, Save, Camera, Check, AlertCircle,
  RefreshCcw, Smartphone, Globe, Lock
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, logoutAllDevices } from '../api/auth.api';

const SettingsPage = () => {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user?.username || '');
  const [email] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error'
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const res = await updateUserProfile({ username: name });
      if (res.data.user) {
        setUser(prev => ({ ...prev, username: res.data.user.username }));
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (error) {
      console.error('Update profile failed:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('This will sign you out of all devices including this one. Continue?')) return;
    setIsLoggingOutAll(true);
    try {
      await logoutAllDevices();
      logout(); // Logout locally
    } catch (error) {
      console.error('Logout all devices failed:', error);
      alert('Failed to logout from all devices. Please try again.');
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  const sections = [
    { title: 'Account', icon: <User size={18} />, active: true },
    { title: 'Security', icon: <Shield size={18} />, active: false },
    { title: 'Notifications', icon: <Bell size={18} />, active: false },
    { title: 'Appearance', icon: <Moon size={18} />, active: false },
  ];

  return (
    <div className="min-h-screen text-white flex overflow-hidden font-inter relative z-10">
      <div className="flex w-full min-h-screen">
        <div className="w-[300px] h-full relative hidden xl:block z-50">
          <Sidebar />
        </div>

        <main className="flex-1 min-h-full relative scroll-smooth px-4 sm:px-6 xl:px-8 pb-12 z-10 overflow-hidden">
          <div className="max-w-[1000px] mx-auto w-full">
            <DashboardHeader />

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <h1 className="font-space text-3xl font-bold tracking-tight text-white mb-2">
                User Settings
              </h1>
              <p className="font-inter text-[#94a3b8] text-sm">
                Manage your account preferences, neural interface configuration, and security authentication.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Tabs */}
              <div className="lg:col-span-1 flex flex-col gap-2">
                {sections.map((section, idx) => (
                  <button
                    key={idx}
                    disabled={!section.active}
                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-space font-bold text-sm text-left
                      ${section.active 
                        ? 'ai-gradient-bg text-[#0c0c1d] shadow-[0_10px_20px_rgba(93,230,255,0.1)]' 
                        : 'text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.03)] cursor-not-allowed opacity-50'}
                    `}
                  >
                    {section.icon}
                    {section.title}
                  </button>
                ))}
              </div>

              {/* Main Content Pane */}
              <div className="lg:col-span-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="glass-surface rounded-[2.5rem] border border-[rgba(255,255,255,0.05)] p-8 sm:p-10"
                >
                  {/* Profile Header */}
                  <div className="flex flex-col sm:flex-row items-center gap-8 mb-12 pb-12 border-b border-[rgba(255,255,255,0.05)]">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-3xl ai-gradient-bg p-[1px] shadow-[0_20px_40px_rgba(93,230,255,0.15)]">
                        <div className="w-full h-full rounded-3xl bg-[#0c0c1d] flex items-center justify-center overflow-hidden">
                          <User size={64} className="text-[#c0c1ff] opacity-50" />
                        </div>
                      </div>
                      <button className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-[#5de6ff] text-[#0c0c1d] shadow-lg hover:scale-110 transition-transform">
                        <Camera size={18} />
                      </button>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-space text-2xl font-bold text-white mb-2">{user?.username}</h3>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                        <span className="px-3 py-1 rounded-full bg-[rgba(93,230,255,0.1)] border border-[rgba(93,230,255,0.2)] text-[#5de6ff] text-[10px] font-bold uppercase tracking-widest">
                          Pro Member
                        </span>
                        <span className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-[#94a3b8] text-[10px] font-bold uppercase tracking-widest">
                          Neural ID: {user?._id?.slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-3">
                        <label className="font-space text-xs uppercase tracking-[0.2em] text-[#c0c1ff] font-bold">
                          Neural Alias
                        </label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#5de6ff] transition-colors" size={18} />
                          <input 
                            type="text" 
                            className="glass-input !pl-12" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="font-space text-xs uppercase tracking-[0.2em] text-[#c0c1ff] font-bold opacity-50">
                          Communication Uplink
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] opacity-50" size={18} />
                          <input 
                            type="email" 
                            className="glass-input !pl-12 bg-transparent opacity-50 cursor-not-allowed" 
                            value={email}
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-6 pt-4">
                       <button
                        type="button"
                        onClick={handleLogoutAll}
                        disabled={isLoggingOutAll}
                        className="text-[#ef4444] text-sm font-space font-bold uppercase tracking-widest hover:underline flex items-center gap-2 group transition-all"
                      >
                         <Smartphone size={16} className="group-hover:scale-110 transition-transform" />
                         Logout from all devices
                      </button>

                      <div className="flex items-center gap-4 ml-auto">
                        <AnimatePresence>
                          {saveStatus === 'success' && (
                            <motion.span 
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="text-[#22c55e] text-sm font-bold flex items-center gap-1"
                            >
                              <Check size={16} /> Saved
                            </motion.span>
                          )}
                          {saveStatus === 'error' && (
                            <motion.span 
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="text-[#f43f5e] text-sm font-bold flex items-center gap-1"
                            >
                              <AlertCircle size={16} /> Error
                            </motion.span>
                          )}
                        </AnimatePresence>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isSaving || (name === user?.username)}
                          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-space font-bold uppercase tracking-widest text-[#0c0c1d] transition-all
                            ${(isSaving || name === user?.username) ? 'bg-[#94a3b8] opacity-50 grayscale cursor-not-allowed' : 'ai-gradient-bg shadow-[0_15px_30px_rgba(93,230,255,0.2)]'}
                          `}
                        >
                          {isSaving ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />}
                          Save Changes
                        </motion.button>
                      </div>
                    </div>
                  </form>

                  {/* Danger Zone */}
                  <div className="mt-16 pt-10 border-t border-[rgba(239,68,68,0.1)]">
                    <h4 className="font-space text-xs uppercase tracking-[0.2em] text-[#ef4444] font-bold mb-6">Danger Protocol</h4>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-3xl border border-[rgba(239,68,68,0.1)] bg-[rgba(239,68,68,0.02)]">
                      <div>
                        <p className="text-white font-bold text-sm mb-1">Permanent Core Shutdown</p>
                        <p className="text-[#94a3b8] text-xs">Permanently delete your profile and all stored neural reports.</p>
                      </div>
                      <button className="px-6 py-3 rounded-xl border border-[#ef4444] text-[#ef4444] text-xs font-bold uppercase tracking-widest hover:bg-[#ef4444] hover:text-white transition-all">
                        Deactivate Core
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="h-24 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
