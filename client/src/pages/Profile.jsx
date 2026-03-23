import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { logoutAllDevices } from '../api/auth.api';
import Button from '../components/ui/Button';

const Profile = () => {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async (all = false) => {
    if (all) setLoggingOutAll(true);
    else setLoggingOut(true);

    try {
      if (all) await logoutAllDevices();
      else await logout();
      
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setLoggingOut(false);
      setLoggingOutAll(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page-wrapper p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-2xl w-full p-8 md:p-12"
      >
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-indigo-500/20">
              {user.username?.[0]?.toUpperCase()}
            </div>
            <div className="absolute -inset-2 rounded-full border border-indigo-500/30 group-hover:border-indigo-500/50 transition-colors" />
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-[#050817] rounded-full" />
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-extrabold gradient-text mb-2">Hello, {user.username}!</h1>
            <p className="text-slate-400 font-medium">{user.email}</p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                Active Session
              </span>
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                MERN Stack
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-6 bg-white/2 border-white/5 shadow-none hover:bg-white/4 transition-colors">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Account Status</h3>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <p className="text-sm font-medium text-slate-200">Verified & Active</p>
            </div>
          </div>
          
          <div className="glass-card p-6 bg-white/2 border-white/5 shadow-none hover:bg-white/4 transition-colors">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">Last Login</h3>
            <p className="text-sm font-medium text-slate-200">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Button variant="primary" loading={loggingOut} onClick={() => handleLogout(false)}>
            Logout Current Device
          </Button>
          <Button variant="secondary" loading={loggingOutAll} onClick={() => handleLogout(true)}>
            Logout From All Devices
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
