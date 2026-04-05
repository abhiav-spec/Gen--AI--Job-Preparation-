import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Send, StopCircle, Clock, BrainCircuit, User,
  Bot, Mic, ChevronDown, AlertCircle, Loader2
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import { submitMockAnswer, endMockInterview, getMockSession } from '../api/mockInterview.api';

const MockInterviewPage = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // State from navigation or fetched
  const [role, setRole] = useState(location.state?.role || '');
  const [difficulty, setDifficulty] = useState(location.state?.difficulty || 'MEDIUM');
  const [duration, setDuration] = useState(location.state?.duration || 15);
  const [startedAt, setStartedAt] = useState(location.state?.startedAt || null);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [interviewEnded, setInterviewEnded] = useState(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerWarning, setTimerWarning] = useState(false);

  // Initialize chat with first question
  useEffect(() => {
    if (location.state?.firstQuestion) {
      setMessages([{
        type: 'ai',
        content: location.state.firstQuestion,
        timestamp: new Date(),
      }]);
      setQuestionCount(1);
    } else {
      // If no state (e.g. page refresh), fetch session
      fetchSession();
    }
  }, []);

  const fetchSession = async () => {
    try {
      const res = await getMockSession(sessionId);
      if (res.data.success) {
        const session = res.data.data;
        setRole(session.role);
        setDifficulty(session.difficulty);
        setDuration(session.duration);
        setStartedAt(session.startedAt);

        if (session.status === 'completed') {
          setInterviewEnded(true);
          navigate(`/dashboard/mock-interview/${sessionId}/report`, {
            state: { fromSession: true },
          });
          return;
        }

        // Rebuild messages from qaHistory
        const msgs = [];
        session.qaHistory.forEach((qa) => {
          msgs.push({ type: 'ai', content: qa.question, timestamp: qa.askedAt });
          if (qa.answer) {
            msgs.push({ type: 'user', content: qa.answer, timestamp: qa.answeredAt });
          }
        });
        setMessages(msgs);
        setQuestionCount(session.qaHistory.length);
      }
    } catch (err) {
      console.error('Failed to fetch session:', err);
      setError('Failed to load interview session.');
    }
  };

  // Timer logic
  useEffect(() => {
    if (!startedAt || !duration) return;
    const endTime = new Date(startedAt).getTime() + duration * 60 * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(remaining);
      setTimerWarning(remaining <= 120 && remaining > 0);

      if (remaining <= 0 && !interviewEnded) {
        clearInterval(interval);
        handleEndInterview();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, duration, interviewEnded]);

  // Format time
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Submit answer
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || isSubmitting || interviewEnded) return;
    setIsSubmitting(true);
    setError('');

    const answerText = currentAnswer.trim();
    setCurrentAnswer('');

    // Add user message immediately
    setMessages((prev) => [...prev, {
      type: 'user',
      content: answerText,
      timestamp: new Date(),
    }]);

    // Add typing indicator
    setMessages((prev) => [...prev, {
      type: 'typing',
      content: '',
      timestamp: new Date(),
    }]);

    try {
      const res = await submitMockAnswer(sessionId, answerText);
      if (res.data.success) {
        // Remove typing indicator and add AI question
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.type !== 'typing');
          return [...filtered, {
            type: 'ai',
            content: res.data.data.question,
            timestamp: new Date(),
          }];
        });
        setQuestionCount(res.data.data.questionNumber);
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      setMessages((prev) => prev.filter((m) => m.type !== 'typing'));
      setError(err.response?.data?.error || 'Failed to process your answer.');
    } finally {
      setIsSubmitting(false);
      textareaRef.current?.focus();
    }
  };

  // End interview
  const handleEndInterview = async () => {
    if (isEnding || interviewEnded) return;
    setIsEnding(true);
    setInterviewEnded(true);

    // If the last message is an AI question without an answer, pass empty
    const lastMsg = messages[messages.length - 1];
    const pendingAnswer = lastMsg?.type === 'ai' ? '' : undefined;

    try {
      const res = await endMockInterview(sessionId, pendingAnswer);
      if (res.data.success) {
        navigate(`/dashboard/mock-interview/${sessionId}/report`, {
          state: {
            report: res.data.data.report,
            qaHistory: res.data.data.qaHistory,
            role: res.data.data.role,
            difficulty: res.data.data.difficulty,
            duration: res.data.data.duration,
          },
        });
      }
    } catch (err) {
      console.error('Failed to end interview:', err);
      setError('Failed to end interview. Please try again.');
      setIsEnding(false);
      setInterviewEnded(false);
    }
  };

  // Handle enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  const difficultyColors = {
    EASY: '#22c55e',
    MEDIUM: '#f59e0b',
    HARD: '#ef4444',
  };

  return (
    <div className="min-h-screen text-white flex overflow-hidden font-inter relative z-10">
      <div className="flex w-full min-h-screen">
        <div className="w-[300px] h-full relative hidden xl:block z-50">
          <Sidebar />
        </div>

        <main className="flex-1 min-h-screen relative z-10 flex flex-col">
          {/* Top Bar */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-surface border-b border-[rgba(255,255,255,0.05)] px-6 py-4 flex items-center justify-between flex-shrink-0"
          >
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl ai-gradient-bg flex items-center justify-center shadow-[0_0_15px_rgba(93,230,255,0.3)]">
                <Mic className="text-[#0c0c1d]" size={18} />
              </div>
              <div>
                <h2 className="font-space font-bold text-white text-sm leading-tight">{role || 'Mock Interview'}</h2>
                <div className="flex items-center gap-3 mt-0.5">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                    style={{
                      color: difficultyColors[difficulty],
                      backgroundColor: `${difficultyColors[difficulty]}15`,
                      border: `1px solid ${difficultyColors[difficulty]}30`,
                    }}
                  >
                    {difficulty}
                  </span>
                  <span className="text-[#94a3b8] text-[10px]">
                    Q{questionCount} Active
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                timerWarning
                  ? 'border-red-500/40 bg-red-500/10 text-red-400'
                  : 'border-[rgba(255,255,255,0.06)] glass-surface-low text-[#94a3b8]'
              }`}>
                <Clock size={16} className={timerWarning ? 'animate-pulse' : ''} />
                <span className="font-space font-bold text-lg tabular-nums">
                  {formatTime(timeLeft)}
                </span>
              </div>

              {/* End Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEndInterview}
                disabled={isEnding}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all font-space font-bold text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {isEnding ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Generating Report...</span>
                  </>
                ) : (
                  <>
                    <StopCircle size={14} />
                    <span>End Interview</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-1" style={{ scrollBehavior: 'smooth' }}>
            <div className="max-w-[800px] mx-auto w-full space-y-4">
              {/* Interview started indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-surface-low border border-[rgba(255,255,255,0.05)] text-[#94a3b8] text-xs">
                  <BrainCircuit size={14} className="text-[#5de6ff]" />
                  <span>Neural Interview Simulation Started</span>
                </div>
              </motion.div>

              {/* Messages */}
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.type === 'ai' && (
                      <div className="w-8 h-8 rounded-xl ai-gradient-bg flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(93,230,255,0.2)]">
                        <Bot size={16} className="text-[#0c0c1d]" />
                      </div>
                    )}

                    {msg.type === 'typing' ? (
                      <div className="glass-surface-low rounded-2xl rounded-tl-md px-5 py-4 max-w-[70%] border border-[rgba(255,255,255,0.05)]">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#5de6ff] animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 rounded-full bg-[#c0c1ff] animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 rounded-full bg-[#5de6ff] animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-xs text-[#94a3b8] ml-2">AI is thinking...</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`rounded-2xl px-5 py-4 max-w-[70%] text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.type === 'ai'
                            ? 'glass-surface-low rounded-tl-md border border-[rgba(255,255,255,0.05)] text-[#e2e8f0]'
                            : 'bg-gradient-to-br from-[rgba(192,193,255,0.15)] to-[rgba(93,230,255,0.08)] rounded-tr-md border border-[rgba(192,193,255,0.15)] text-white'
                        }`}
                      >
                        {msg.content}
                      </div>
                    )}

                    {msg.type === 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                        <User size={16} className="text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Error Bar */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mx-4 sm:mx-8 mb-2"
              >
                <div className="max-w-[800px] mx-auto alert-error flex items-center gap-2 text-xs">
                  <AlertCircle size={14} />
                  {error}
                  <button onClick={() => setError('')} className="ml-auto text-white/50 hover:text-white">✕</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="glass-surface border-t border-[rgba(255,255,255,0.05)] px-4 sm:px-8 py-4 flex-shrink-0">
            <div className="max-w-[800px] mx-auto w-full">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    id="mock-interview-answer"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={interviewEnded ? 'Interview has ended.' : 'Type your answer... (Shift+Enter for new line)'}
                    disabled={isSubmitting || interviewEnded || isEnding}
                    rows={2}
                    className="glass-input resize-none text-sm pr-4 py-3"
                    style={{ minHeight: '56px', maxHeight: '160px' }}
                  />
                </div>
                <motion.button
                  whileHover={!isSubmitting && !interviewEnded ? { scale: 1.05 } : {}}
                  whileTap={!isSubmitting && !interviewEnded ? { scale: 0.95 } : {}}
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim() || isSubmitting || interviewEnded}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                    currentAnswer.trim() && !isSubmitting && !interviewEnded
                      ? 'ai-gradient-bg text-[#0c0c1d] shadow-[0_0_15px_rgba(93,230,255,0.3)]'
                      : 'glass-surface-low border border-[rgba(255,255,255,0.06)] text-[#94a3b8]'
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </motion.button>
              </div>
              <p className="text-[10px] text-[#94a3b8] mt-2 ml-1">
                Press <span className="text-[#c0c1ff] font-medium">Enter</span> to send · <span className="text-[#c0c1ff] font-medium">Shift+Enter</span> for new line · <span className="text-[#c0c1ff] font-medium">End Interview</span> to finish
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MockInterviewPage;
