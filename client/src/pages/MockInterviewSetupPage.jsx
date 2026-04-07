import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Mic, BrainCircuit, Zap, Target, Clock,
  ChevronRight, Sparkles, Shield, AlertCircle, Volume2
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { startMockInterview } from '../api/mockInterview.api';
import VideoMonitor from '../components/interview/VideoMonitor';
import { Camera, CameraOff, ShieldCheck, AlertTriangle } from 'lucide-react';

const difficultyConfig = {
  EASY: {
    label: 'Easy',
    desc: 'Basic concepts, definitions & simple examples',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.3)',
    icon: <Shield size={20} />,
  },
  MEDIUM: {
    label: 'Medium',
    desc: 'Practical scenarios & problem-solving',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.3)',
    icon: <Target size={20} />,
  },
  HARD: {
    label: 'Hard',
    desc: 'System design, optimization & edge cases',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.3)',
    icon: <Zap size={20} />,
  },
};

const durationOptions = [10, 15, 20, 30];

const MockInterviewSetupPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [duration, setDuration] = useState(15);
  const [jobDescription, setJobDescription] = useState('');
  const [voiceMode, setVoiceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const canStart = role.trim() && jobDescription.trim() && isCameraReady;

  const handleStart = async () => {
    if (!canStart) return;
    setIsLoading(true);
    setError('');

    try {
      console.log('[MockInterview] Starting interview...', { role: role.trim(), difficulty, duration, voiceMode });
      
      const res = await startMockInterview({
        role: role.trim(),
        difficulty,
        duration,
        jobDescription: jobDescription.trim(),
      });

      console.log('[MockInterview] Response:', res.data);

      if (res.data.success) {
        navigate(`/dashboard/mock-interview/${res.data.data.sessionId}`, {
          state: {
            sessionId: res.data.data.sessionId,
            role: res.data.data.role,
            difficulty: res.data.data.difficulty,
            duration: res.data.data.duration,
            firstQuestion: res.data.data.question,
            questionNumber: res.data.data.questionNumber,
            startedAt: res.data.data.startedAt,
            voiceMode: voiceMode,
          },
        });
      } else {
        setError(res.data?.error || 'Unexpected response from server.');
      }
    } catch (err) {
      console.error('[MockInterview] Failed to start:', err);
      const status = err.response?.status;
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      
      if (status === 401) {
        setError('Session expired. Please refresh the page and try again.');
      } else if (status === 429) {
        setError('AI service is rate limited. Please wait a moment and try again.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot reach the server. Is the backend running on port 3000?');
      } else {
        setError(serverMsg || `Failed to start interview (${status || 'network error'}). Please try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white flex overflow-hidden font-inter relative z-10">
      <div className="flex w-full min-h-screen">
        <div className="w-[300px] h-full relative hidden xl:block z-50">
          <Sidebar />
        </div>

        <main className="flex-1 min-h-full relative scroll-smooth px-4 sm:px-6 xl:px-8 pb-12 z-10 overflow-x-hidden">
          <div className="max-w-[1200px] mx-auto w-full">
            <DashboardHeader />

            {/* Hero Section */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl ai-gradient-bg flex items-center justify-center shadow-[0_0_20px_rgba(93,230,255,0.4)]">
                  <Mic className="text-[#0c0c1d]" size={22} />
                </div>
                <div>
                  <span className="font-space text-[10px] uppercase font-bold text-[#5de6ff] tracking-[0.2em] block animate-pulse">
                    Neural Simulation
                  </span>
                  <h1 className="font-space text-3xl font-bold tracking-tight text-white">
                    Mock Interview
                  </h1>
                </div>
              </div>
              <p className="font-inter text-[#94a3b8] text-sm max-w-xl ml-[52px]">
                Configure your AI-powered interview session. Our neural engine will adapt questions in real-time based on your performance.
              </p>
            </motion.div>

            {/* Setup Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Left Column — Form */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="lg:col-span-7"
              >
                <div className="glass-surface rounded-[2rem] border border-[rgba(255,255,255,0.05)] p-8">
                  {/* Role */}
                  <div className="mb-6">
                    <label className="block font-space text-xs uppercase tracking-widest text-[#c0c1ff] font-bold mb-3">
                      Target Role
                    </label>
                    <input
                      id="mock-interview-role"
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g., Senior Frontend Developer"
                      className="glass-input text-base"
                    />
                  </div>

                  {/* Difficulty Select */}
                  <div className="mb-6">
                    <label className="block font-space text-xs uppercase tracking-widest text-[#c0c1ff] font-bold mb-3">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(difficultyConfig).map(([key, cfg]) => {
                        const selected = difficulty === key;
                        return (
                          <motion.button
                            key={key}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setDifficulty(key)}
                            className="relative p-4 rounded-2xl border transition-all duration-300 text-left"
                            style={{
                              background: selected ? `rgba(${key === 'EASY' ? '34,197,94' : key === 'MEDIUM' ? '245,158,11' : '239,68,68'},0.08)` : 'rgba(255,255,255,0.03)',
                              borderColor: selected ? cfg.color : 'rgba(255,255,255,0.06)',
                              boxShadow: selected ? `0 0 20px ${cfg.glow}` : 'none',
                            }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span style={{ color: cfg.color }}>{cfg.icon}</span>
                              <span className="font-space font-bold text-sm" style={{ color: selected ? cfg.color : '#94a3b8' }}>
                                {cfg.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#94a3b8] leading-relaxed">{cfg.desc}</p>
                            {selected && (
                              <motion.div
                                layoutId="difficultyIndicator"
                                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                                style={{ backgroundColor: cfg.color, boxShadow: `0 0 8px ${cfg.glow}` }}
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="mb-8">
                    <label className="block font-space text-xs uppercase tracking-widest text-[#c0c1ff] font-bold mb-3">
                      <Clock size={14} className="inline mr-2" />
                      Duration
                    </label>
                    <div className="flex gap-3">
                      {durationOptions.map((d) => (
                        <motion.button
                          key={d}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDuration(d)}
                          className={`px-5 py-3 rounded-xl font-space font-bold text-sm transition-all ${
                            duration === d
                              ? 'ai-gradient-bg text-[#0c0c1d] shadow-[0_0_15px_rgba(93,230,255,0.3)]'
                              : 'glass-surface-low border border-[rgba(255,255,255,0.06)] text-[#94a3b8] hover:text-white'
                          }`}
                        >
                          {d} min
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Voice Mode Toggle */}
                  <div className="mb-8 p-6 rounded-[2rem] glass-surface-low border border-[rgba(93,230,255,0.1)] flex items-center justify-between group hover:border-[rgba(93,230,255,0.25)] transition-all">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${voiceMode ? 'ai-gradient-bg text-[#0c0c1d] shadow-[0_0_15px_rgba(93,230,255,0.3)]' : 'bg-white/5 text-[#94a3b8]'}`}>
                        <Volume2 size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-space font-bold text-white text-sm">Speech Mode</h4>
                          <span className="px-1.5 py-0.5 rounded bg-secondary/10 border border-secondary/20 text-secondary text-[8px] font-bold uppercase tracking-widest">
                            Beta
                          </span>
                        </div>
                        <p className="text-[11px] text-[#94a3b8] max-w-xs leading-relaxed">
                          AI will speak questions aloud and you can answer using your microphone for a total simulation.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setVoiceMode(!voiceMode)}
                      className={`relative w-14 h-8 rounded-full transition-colors ${voiceMode ? 'ai-gradient-bg' : 'bg-white/10'}`}
                    >
                      <motion.div
                        animate={{ x: voiceMode ? 26 : 4 }}
                        className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
                      />
                    </button>
                  </div>

                  {/* Job Description */}
                  <div className="mb-8">
                    <label className="block font-space text-xs uppercase tracking-widest text-[#c0c1ff] font-bold mb-3">
                      Job Description
                    </label>
                    <textarea
                      id="mock-interview-jd"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the full job description here. The AI will tailor questions to match the exact requirements..."
                      rows={8}
                      className="glass-input resize-none text-sm leading-relaxed"
                    />
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {!isCameraReady && !error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3 mb-6"
                      >
                        <ShieldCheck className="text-yellow-500" size={18} />
                        <div>
                          <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest leading-none mb-1">Mandatory Vision Check</p>
                          <p className="text-[10px] text-yellow-500/70">Neural simulation requires camera and microphone permissions to proceed.</p>
                        </div>
                      </motion.div>
                    )}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="alert-error flex items-center gap-2 mb-6"
                      >
                        <AlertCircle size={16} />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Start Button */}
                  <motion.button
                    id="start-mock-interview-btn"
                    whileHover={canStart && !isLoading ? { scale: 1.01 } : {}}
                    whileTap={canStart && !isLoading ? { scale: 0.99 } : {}}
                    onClick={handleStart}
                    disabled={!canStart || isLoading}
                    className={`w-full py-4 rounded-2xl font-space font-bold text-base uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 ${
                      canStart && !isLoading
                        ? 'ai-gradient-bg text-[#0c0c1d] shadow-[0_0_30px_rgba(93,230,255,0.3)] hover:shadow-[0_0_40px_rgba(93,230,255,0.5)]'
                        : 'bg-[rgba(255,255,255,0.05)] text-[#94a3b8] cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner" style={{ borderTopColor: '#0c0c1d' }} />
                        <span>Initializing Neural Simulation...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        <span>Begin Interview</span>
                        <ChevronRight size={18} />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>

              {/* Right Column — Info Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-5 flex flex-col gap-6"
              >
                {/* Vision Setup Check */}
                <div className="glass-surface rounded-[2rem] border border-[rgba(255,255,255,0.05)] p-0 overflow-hidden relative group">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#5de6ff]/10 flex items-center justify-center border border-[#5de6ff]/20">
                         <Camera className="text-[#5de6ff]" size={16} />
                      </div>
                      <h3 className="font-space font-bold text-white text-sm">Neural Vision Preview</h3>
                    </div>
                    {isCameraReady && (
                       <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] text-[9px] font-bold uppercase tracking-widest">
                          <ShieldCheck size={10} /> Verified
                       </div>
                    )}
                  </div>
                  
                  <div className="aspect-video w-full relative bg-[#0c0c1d] flex items-center justify-center">
                    {!isCameraOn ? (
                      <div className="flex flex-col items-center gap-4 text-center p-6">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                           <CameraOff size={24} className="text-[#94a3b8]" />
                        </div>
                        <div>
                           <p className="text-[10px] font-space font-bold uppercase tracking-widest text-[#94a3b8] mb-1">Vision Locked</p>
                           <p className="text-[9px] text-[#475569] max-w-[140px]">Enable vision feed to verify interview environment.</p>
                        </div>
                        <button 
                           onClick={() => setIsCameraOn(true)}
                           className="px-4 py-2 rounded-xl ai-gradient-bg text-[#0c0c1d] font-space font-bold text-[10px] uppercase tracking-widest shadow-lg"
                        >
                           Enable Neural Vision
                        </button>
                      </div>
                    ) : (
                      <>
                        <VideoMonitor 
                           isActive={isCameraOn}
                           isInterviewing={false}
                           onPermissionGranted={(granted) => setIsCameraReady(granted)}
                        />
                        <button 
                          onClick={() => setIsCameraOn(false)}
                          className="absolute bottom-4 right-4 p-2 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-black/70 transition-all z-30"
                          title="Disable Camera"
                        >
                           <CameraOff size={16} />
                        </button>
                      </>
                    )}
                  </div>
                  
                  <div className="p-5 bg-white/5 space-y-3">
                    <div className="flex gap-3 items-start">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isCameraReady ? 'bg-[#22c55e]' : 'bg-white/10'}`} />
                        <p className="text-[10px] text-[#94a3b8] leading-relaxed">System requires face-to-face simulation environment validation.</p>
                    </div>
                    <div className="flex gap-3 items-start">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isCameraReady ? 'bg-[#22c55e]' : 'bg-white/10'}`} />
                        <p className="text-[10px] text-[#94a3b8] leading-relaxed">Ensure adequate lighting and centered framing.</p>
                    </div>
                  </div>
                </div>

                {/* How it works */}
                <div className="glass-surface rounded-[2rem] border border-[rgba(255,255,255,0.05)] p-8">
                  <div className="flex items-center gap-2 mb-5">
                    <BrainCircuit size={20} className="text-[#5de6ff]" />
                    <h3 className="font-space font-bold text-white text-base">How It Works</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { step: '01', title: 'Configure', desc: 'Set your target role, difficulty, and paste the job description.' },
                      { step: '02', title: 'Interview', desc: 'The AI asks one question at a time. Type your answer and submit.' },
                      { step: '03', title: 'Adapt', desc: 'Questions adapt in real-time based on your performance.' },
                      { step: '04', title: 'Report', desc: 'Get a comprehensive evaluation with scores and improvement plan.' },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4 items-start group">
                        <div className="w-8 h-8 rounded-lg ai-gradient-bg flex items-center justify-center flex-shrink-0 text-[#0c0c1d] font-space font-bold text-xs shadow-[0_0_10px_rgba(93,230,255,0.2)] group-hover:shadow-[0_0_15px_rgba(93,230,255,0.4)] transition-shadow">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-space font-bold text-sm text-white mb-0.5">{item.title}</h4>
                          <p className="text-xs text-[#94a3b8] leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="glass-surface-low rounded-[2rem] border border-[rgba(255,255,255,0.05)] p-8">
                  <h3 className="font-space font-bold text-white text-base mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-[#c0c1ff]" />
                    Practice Tips
                  </h3>
                  <ul className="space-y-3 text-xs text-[#94a3b8] leading-relaxed">
                    <li className="flex gap-2">
                      <span className="text-[#5de6ff] mt-0.5">•</span>
                      Answer as if you're in a real interview — the AI evaluates completeness and clarity.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#5de6ff] mt-0.5">•</span>
                      Use the STAR method for behavioral questions (Situation, Task, Action, Result).
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#5de6ff] mt-0.5">•</span>
                      Don't rush — take time to structure your thoughts before answering.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#5de6ff] mt-0.5">•</span>
                      Paste a detailed JD for more targeted and relevant questions.
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>

            <div className="h-24 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MockInterviewSetupPage;
