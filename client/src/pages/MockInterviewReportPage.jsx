import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Trophy, Target, MessageSquare, ShieldCheck,
  TrendingUp, TrendingDown, AlertTriangle, FileText,
  ArrowLeft, BrainCircuit, BookOpen, Briefcase,
  ChevronDown, ChevronUp, Bot, User, Sparkles, Star
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import { getMockSession } from '../api/mockInterview.api';

// Circular score gauge
const ScoreGauge = ({ label, score, color, delay = 0 }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40" cy="40" r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="6"
            fill="none"
          />
          <motion.circle
            cx="40" cy="40" r={radius}
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, delay: delay + 0.3, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-space font-bold text-xl text-white">{score}</span>
        </div>
      </div>
      <span className="font-space text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">{label}</span>
    </motion.div>
  );
};

// Section card wrapper
const SectionCard = ({ title, icon, children, delay = 0, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-surface rounded-[2rem] border border-[rgba(255,255,255,0.05)] overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 sm:p-8 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl ai-gradient-bg flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(93,230,255,0.2)]">
            {icon}
          </div>
          <h3 className="font-space font-bold text-white text-base sm:text-lg">{title}</h3>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={20} className="text-[#94a3b8]" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MockInterviewReportPage = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [report, setReport] = useState(location.state?.report || null);
  const [qaHistory, setQaHistory] = useState(location.state?.qaHistory || []);
  const [role, setRole] = useState(location.state?.role || '');
  const [difficulty, setDifficulty] = useState(location.state?.difficulty || '');
  const [loading, setLoading] = useState(!location.state?.report);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!report) {
      fetchSession();
    }
  }, []);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const res = await getMockSession(sessionId);
      if (res.data.success) {
        const session = res.data.data;
        setReport(session.finalReport);
        setQaHistory(session.qaHistory || []);
        setRole(session.role);
        setDifficulty(session.difficulty);
      }
    } catch (err) {
      console.error('Failed to fetch session:', err);
      setError('Failed to load interview report.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex overflow-hidden font-inter relative z-10">
        <div className="flex w-full min-h-screen">
          <div className="w-[300px] h-full relative hidden xl:block z-50"><Sidebar /></div>
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="spinner mx-auto mb-4" style={{ width: 40, height: 40 }} />
              <p className="font-space text-[#94a3b8] text-sm">Loading interview report...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen text-white flex overflow-hidden font-inter relative z-10">
        <div className="flex w-full min-h-screen">
          <div className="w-[300px] h-full relative hidden xl:block z-50"><Sidebar /></div>
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center glass-surface rounded-[2rem] p-12 border border-[rgba(255,255,255,0.05)]">
              <AlertTriangle size={48} className="mx-auto text-red-400 mb-4" />
              <h2 className="font-space text-xl font-bold text-white mb-2">Report Unavailable</h2>
              <p className="text-[#94a3b8] text-sm mb-6">{error || 'No report data found for this session.'}</p>
              <button
                onClick={() => navigate('/dashboard/mock-interviews')}
                className="px-6 py-3 rounded-xl ai-gradient-bg text-[#0c0c1d] font-space font-bold text-xs uppercase tracking-wider"
              >
                Back to Mock Interviews
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const score = report.score || {};
  const overallPercent = ((score.overall || 0) / 10 * 100).toFixed(0);
  const answeredCount = qaHistory.filter(qa => qa.answer).length;

  return (
    <div className="min-h-screen text-white flex overflow-hidden font-inter relative z-10">
      <div className="flex w-full min-h-screen">
        <div className="w-[300px] h-full relative hidden xl:block z-50">
          <Sidebar />
        </div>

        <main className="flex-1 min-h-full relative scroll-smooth px-4 sm:px-6 xl:px-8 pb-12 z-10 overflow-x-hidden overflow-y-auto">
          <div className="max-w-[900px] mx-auto w-full pt-8">
            {/* Back button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => navigate('/dashboard/mock-interviews')}
              className="flex items-center gap-2 text-[#94a3b8] hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-inter text-sm">Back to Mock Interviews</span>
            </motion.button>

            {/* Report Header */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="glass-surface rounded-[2rem] border border-[rgba(93,230,255,0.15)] p-8 sm:p-10 mb-8"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                <div>
                  <span className="font-space text-[10px] uppercase font-bold text-[#5de6ff] tracking-[0.2em] block animate-pulse mb-1">
                    Interview Complete
                  </span>
                  <h1 className="font-space text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
                    {role || 'Interview'} Report
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                      style={{
                        color: difficulty === 'EASY' ? '#22c55e' : difficulty === 'HARD' ? '#ef4444' : '#f59e0b',
                        backgroundColor: `${difficulty === 'EASY' ? '#22c55e' : difficulty === 'HARD' ? '#ef4444' : '#f59e0b'}15`,
                      }}
                    >
                      {difficulty}
                    </span>
                    <span className="text-xs text-[#94a3b8]">{answeredCount} questions answered</span>
                  </div>
                </div>

                {/* Overall Score Badge */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{
                      background: `conic-gradient(${score.overall >= 7 ? '#22c55e' : score.overall >= 5 ? '#f59e0b' : '#ef4444'} ${overallPercent}%, rgba(255,255,255,0.05) 0%)`,
                      boxShadow: `0 0 30px ${score.overall >= 7 ? 'rgba(34,197,94,0.2)' : score.overall >= 5 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                      <div className="w-20 h-20 rounded-full bg-[#0c0c1d] flex items-center justify-center">
                        <span className="font-space text-2xl font-bold text-white">{score.overall || 0}</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-space text-[10px] uppercase font-bold text-[#c0c1ff] tracking-wider mt-2">Overall</span>
                </div>
              </div>

              {/* Score Gauges */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[rgba(255,255,255,0.05)]">
                <ScoreGauge label="Technical" score={score.technical || 0} color="#c0c1ff" delay={0.1} />
                <ScoreGauge label="Communication" score={score.communication || 0} color="#5de6ff" delay={0.2} />
                <ScoreGauge label="Confidence" score={score.confidence || 0} color="#e879f9" delay={0.3} />
              </div>
            </motion.div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-surface rounded-[2rem] border border-[rgba(34,197,94,0.15)] p-6 sm:p-8"
              >
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp size={18} className="text-green-400" />
                  <h3 className="font-space font-bold text-green-400 text-sm uppercase tracking-wider">Strengths</h3>
                </div>
                <ul className="space-y-3">
                  {(report.strengths || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#e2e8f0]">
                      <Star size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-surface rounded-[2rem] border border-[rgba(239,68,68,0.15)] p-6 sm:p-8"
              >
                <div className="flex items-center gap-2 mb-5">
                  <TrendingDown size={18} className="text-red-400" />
                  <h3 className="font-space font-bold text-red-400 text-sm uppercase tracking-wider">Weaknesses</h3>
                </div>
                <ul className="space-y-3">
                  {(report.weaknesses || []).map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#e2e8f0]">
                      <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Detail Sections */}
            <div className="space-y-6">
              <SectionCard
                title="Technical Analysis"
                icon={<BrainCircuit size={16} className="text-[#0c0c1d]" />}
                delay={0.5}
              >
                <p className="text-sm text-[#e2e8f0] leading-relaxed whitespace-pre-wrap">
                  {report.technicalQuestions || 'No technical analysis available.'}
                </p>
              </SectionCard>

              <SectionCard
                title="Behavioral Evaluation"
                icon={<MessageSquare size={16} className="text-[#0c0c1d]" />}
                delay={0.6}
              >
                <p className="text-sm text-[#e2e8f0] leading-relaxed whitespace-pre-wrap">
                  {report.behavioralQuestions || 'No behavioral evaluation available.'}
                </p>
              </SectionCard>

              <SectionCard
                title="Skill Gaps"
                icon={<AlertTriangle size={16} className="text-[#0c0c1d]" />}
                delay={0.7}
              >
                <p className="text-sm text-[#e2e8f0] leading-relaxed whitespace-pre-wrap">
                  {report.skillGaps || 'No skill gaps identified.'}
                </p>
              </SectionCard>

              <SectionCard
                title="Preparation Plan"
                icon={<BookOpen size={16} className="text-[#0c0c1d]" />}
                delay={0.8}
              >
                <p className="text-sm text-[#e2e8f0] leading-relaxed whitespace-pre-wrap">
                  {report.preparationPlan || 'No preparation plan available.'}
                </p>
              </SectionCard>

              <SectionCard
                title="Resume Feedback"
                icon={<FileText size={16} className="text-[#0c0c1d]" />}
                delay={0.9}
              >
                <p className="text-sm text-[#e2e8f0] leading-relaxed whitespace-pre-wrap">
                  {report.resumeFeedback || 'No resume feedback available.'}
                </p>
              </SectionCard>

              {/* Interview Transcript */}
              <SectionCard
                title="Interview Transcript"
                icon={<Sparkles size={16} className="text-[#0c0c1d]" />}
                delay={1.0}
                defaultOpen={false}
              >
                <div className="space-y-4">
                  {qaHistory.map((qa, idx) => (
                    <div key={idx} className="border-b border-[rgba(255,255,255,0.04)] pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-7 h-7 rounded-lg ai-gradient-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot size={14} className="text-[#0c0c1d]" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#5de6ff] tracking-wider">Question {idx + 1}</span>
                          <p className="text-sm text-[#e2e8f0] mt-1">{qa.question}</p>
                        </div>
                      </div>
                      {qa.answer && (
                        <div className="flex items-start gap-3 ml-10">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <User size={14} className="text-white" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#c0c1ff] tracking-wider">Your Answer</span>
                            <p className="text-sm text-[#94a3b8] mt-1">{qa.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="flex flex-col sm:flex-row gap-4 mt-8 mb-8"
            >
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate('/dashboard/mock-interviews')}
                className="flex-1 py-4 rounded-2xl ai-gradient-bg text-[#0c0c1d] font-space font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(93,230,255,0.2)]"
              >
                <Sparkles size={18} />
                Start New Interview
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-4 rounded-2xl glass-surface border border-[rgba(255,255,255,0.08)] text-[#94a3b8] hover:text-white font-space font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft size={18} />
                Back to Dashboard
              </motion.button>
            </motion.div>

            <div className="h-12 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MockInterviewReportPage;
