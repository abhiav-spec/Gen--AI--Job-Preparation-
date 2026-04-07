import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Mic, Plus, Clock, Target, Trophy, ChevronRight,
  BrainCircuit, Sparkles, CalendarDays, BarChart3,
  Trash2, Loader2
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { getAllMockSessions, deleteMockInterview } from '../api/mockInterview.api';

const difficultyColors = {
  EASY: '#22c55e',
  MEDIUM: '#f59e0b',
  HARD: '#ef4444',
};

const statusConfig = {
  active: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  completed: { label: 'Completed', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  abandoned: { label: 'Abandoned', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

const MockInterviewsListPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await getAllMockSessions();
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation(); // Prevent card click (navigation)
    
    if (!window.confirm('Are you sure you want to delete this interview record permanently? This cannot be undone.')) {
      return;
    }

    setDeletingId(sessionId);
    try {
      const res = await deleteMockInterview(sessionId);
      if (res.data.success) {
        setSessions(prev => prev.filter(s => s._id !== sessionId));
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Failed to delete record. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const avgScore = completedSessions.length > 0
    ? (completedSessions.reduce((sum, s) => sum + (s.finalReport?.score?.overall || 0), 0) / completedSessions.length).toFixed(1)
    : '—';

  const stats = [
    { label: 'Total Sessions', value: sessions.length.toString(), icon: <BarChart3 size={20} />, color: '#c0c1ff' },
    { label: 'Completed', value: completedSessions.length.toString(), icon: <Trophy size={20} />, color: '#22c55e' },
    { label: 'Avg Score', value: avgScore, icon: <Target size={20} />, color: '#5de6ff' },
  ];

  return (
    <div className="min-h-screen text-white flex overflow-hidden font-inter relative z-10">
      <div className="flex w-full min-h-screen">
        <div className="w-[300px] h-full relative hidden xl:block z-50">
          <Sidebar />
        </div>

        <main className="flex-1 min-h-full relative scroll-smooth px-4 sm:px-6 xl:px-8 pb-12 z-10 overflow-x-hidden">
          <div className="max-w-[1200px] mx-auto w-full">
            <DashboardHeader />

            {/* Page Header */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl ai-gradient-bg flex items-center justify-center shadow-[0_0_20px_rgba(93,230,255,0.4)]">
                    <Mic className="text-[#0c0c1d]" size={22} />
                  </div>
                  <div>
                    <span className="font-space text-[10px] uppercase font-bold text-[#5de6ff] tracking-[0.2em] block animate-pulse">
                      Neural Simulations
                    </span>
                    <h1 className="font-space text-3xl font-bold tracking-tight text-white">
                      Mock Interviews
                    </h1>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard/mock-interview/setup')}
                  className="px-6 py-3 rounded-xl ai-gradient-bg text-[#0c0c1d] font-space font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(93,230,255,0.3)] hover:shadow-[0_0_30px_rgba(93,230,255,0.5)] transition-shadow"
                >
                  <Plus size={16} />
                  New Interview
                </motion.button>
              </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
            >
              {stats.map((stat, idx) => (
                <div key={idx} className="glass-surface rounded-[1.5rem] border border-[rgba(255,255,255,0.05)] p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{
                    backgroundColor: `${stat.color}12`,
                    border: `1px solid ${stat.color}25`,
                  }}>
                    <span style={{ color: stat.color }}>{stat.icon}</span>
                  </div>
                  <div>
                    <span className="font-space text-xl font-bold text-white">{stat.value}</span>
                    <p className="text-[10px] uppercase tracking-wider text-[#94a3b8] font-semibold mt-0.5">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Sessions List */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="font-space text-lg font-bold text-white mb-6 flex items-center gap-2">
                <CalendarDays size={18} className="text-[#c0c1ff]" />
                Session History
              </h2>

              {loading ? (
                <div className="text-center py-20">
                  <div className="spinner mx-auto mb-4" style={{ width: 32, height: 32 }} />
                  <p className="text-[#94a3b8] text-sm">Loading sessions...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-20 glass-surface rounded-[2rem] border border-[rgba(255,255,255,0.05)]">
                  <BrainCircuit size={48} className="mx-auto text-[#5de6ff] mb-4 opacity-50" />
                  <h3 className="font-space text-lg font-bold text-white mb-2">No Interviews Yet</h3>
                  <p className="text-[#94a3b8] text-sm mb-6 max-w-md mx-auto">
                    Start your first AI-powered mock interview to get personalized feedback and improve your skills.
                  </p>
                  <button
                    onClick={() => navigate('/dashboard/mock-interview/setup')}
                    className="px-8 py-3 rounded-xl ai-gradient-bg text-[#0c0c1d] font-space font-bold text-xs uppercase tracking-widest inline-flex items-center gap-2"
                  >
                    <Sparkles size={16} />
                    Start First Interview
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session, idx) => {
                    const status = statusConfig[session.status] || statusConfig.abandoned;
                    const score = session.finalReport?.score?.overall;
                    const qCount = session.qaHistory?.length || 0;

                    return (
                      <motion.div
                        key={session._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => {
                          if (session.status === 'completed') {
                            navigate(`/dashboard/mock-interview/${session._id}/report`);
                          } else if (session.status === 'active') {
                            navigate(`/dashboard/mock-interview/${session._id}`);
                          }
                        }}
                        className="glass-surface rounded-[1.5rem] border border-[rgba(255,255,255,0.05)] p-5 sm:p-6 cursor-pointer hover:border-[rgba(192,193,255,0.15)] transition-all group"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl ai-gradient-bg flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(93,230,255,0.15)] group-hover:shadow-[0_0_15px_rgba(93,230,255,0.3)] transition-shadow">
                              <Mic size={18} className="text-[#0c0c1d]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-space font-bold text-white text-sm truncate">
                                {session.role}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <span
                                  className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                                  style={{
                                    color: difficultyColors[session.difficulty],
                                    backgroundColor: `${difficultyColors[session.difficulty]}12`,
                                  }}
                                >
                                  {session.difficulty}
                                </span>
                                <span className="text-[#94a3b8] text-[10px] flex items-center gap-1">
                                  <Clock size={10} />
                                  {session.duration} min
                                </span>
                                <span className="text-[#94a3b8] text-[10px]">
                                  {qCount} questions
                                </span>
                                <span className="text-[#94a3b8] text-[10px]">
                                  {new Date(session.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Status Badge */}
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg"
                              style={{ color: status.color, backgroundColor: status.bg }}
                            >
                              {status.label}
                            </span>

                            {/* Score (if completed) */}
                            {score !== undefined && (
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-space font-bold text-sm" style={{
                                backgroundColor: score >= 7 ? 'rgba(34,197,94,0.1)' : score >= 5 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                color: score >= 7 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444',
                                border: `1px solid ${score >= 7 ? 'rgba(34,197,94,0.2)' : score >= 5 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
                              }}>
                                {score}
                              </div>
                            )}

                            {/* Delete Button */}
                            <button
                              onClick={(e) => handleDelete(e, session._id)}
                              disabled={deletingId === session._id}
                              className={`p-2.5 rounded-xl transition-all ${
                                deletingId === session._id 
                                  ? 'bg-white/5 text-white/20' 
                                  : 'text-[#94a3b8] hover:text-red-400 hover:bg-red-400/10'
                              }`}
                              title="Delete Session"
                            >
                              {deletingId === session._id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>

                            <ChevronRight size={18} className="text-[#94a3b8] group-hover:text-[#5de6ff] group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            <div className="h-24 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MockInterviewsListPage;
