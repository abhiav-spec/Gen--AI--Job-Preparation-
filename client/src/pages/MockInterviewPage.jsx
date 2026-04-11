import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Send, StopCircle, Clock, BrainCircuit, User,
  Bot, Mic, ChevronDown, AlertCircle, Loader2
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import { submitMockAnswer, endMockInterview, getMockSession } from '../api/mockInterview.api';
import useSpeech from '../hooks/useSpeech';
import VideoMonitor from '../components/interview/VideoMonitor';
import { Camera, CameraOff, ShieldCheck, Smile, Activity, Eye, Zap } from 'lucide-react';

const MockInterviewPage = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Voice Hook
  const {
    isListening,
    transcript,
    isSpeaking,
    supported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    setTranscript
  } = useSpeech();

  // Settings
  const [voiceMode, setVoiceMode] = useState(location.state?.voiceMode || false);
  const [isMuted, setIsMuted] = useState(false);

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

  // Behavior Tracking
  const [visionStatus, setVisionStatus] = useState({
    faceDetected: true,
    emotion: 'neutral',
    confidenceScore: 0
  });
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [behaviorFlags, setBehaviorFlags] = useState([]);
  
  // Ref for accumulating metrics without triggering re-renders (crucial for timer stability)
  const behaviorMetricsRef = useRef({
    faceMissingDuration: 0,
    faceMissingCount: 0,
    totalDetections: 0,
    confidenceSum: 0,
    emotions: {},
    lastFaceDetected: true
  });

  const handleStatusUpdate = useCallback((status) => {
    setVisionStatus(prev => ({ ...prev, ...status }));
    
    // Accumulate metrics in Ref
    const m = behaviorMetricsRef.current;
    m.totalDetections += 1;
    m.confidenceSum += status.confidenceScore;
    
    // Track face missing stats
    if (!status.faceDetected) {
        m.faceMissingDuration += 0.5; // Detection loop runs every 500ms
        if (m.lastFaceDetected !== false) {
           m.faceMissingCount += 1;
        }
    }
    
    // Track emotions
    const emo = status.emotion || 'unknown';
    m.emotions[emo] = (m.emotions[emo] || 0) + 1;
    
    m.lastFaceDetected = status.faceDetected;
  }, []);

  // Auto-speak AI messages & restart listening
  useEffect(() => {
    if (messages.length > 0 && !isMuted) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.type === 'ai' && !lastMsg.spoken) {
        speak(lastMsg.content, () => {
          // If voiceMode is on, start listening after AI finishes speaking
          if (supported.recognition && voiceMode && !interviewEnded) {
             startListening();
          }
        });
        lastMsg.spoken = true; // Mark as spoken to avoid repeat on re-renders
      }
    }
  }, [messages, isMuted, speak, voiceMode, supported.recognition, interviewEnded, startListening]);

  // Update currentAnswer when transcript changes
  useEffect(() => {
    if (isListening && transcript) {
      setCurrentAnswer(transcript);
    }
  }, [transcript, isListening]);

  // Initialize chat with first question
  useEffect(() => {
    if (location.state?.firstQuestion) {
      setMessages([{
        type: 'ai',
        content: location.state.firstQuestion,
        timestamp: new Date(),
        spoken: false,
      }]);
      setQuestionCount(1);
    } else {
      fetchSession();
    }
  }, []);

  const fetchSession = useCallback(async () => {
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

        const msgs = [];
        session.qaHistory.forEach((qa) => {
          msgs.push({ type: 'ai', content: qa.question, timestamp: qa.askedAt, spoken: true });
          if (qa.answer) {
            msgs.push({ type: 'user', content: qa.answer, timestamp: qa.answeredAt });
          }
        });
        setMessages(msgs);
        setQuestionCount(session.qaHistory.length);
      }
    } catch (err) {
      console.error('Failed to fetch session:', err);
      if (err.response?.status === 401) {
        navigate('/login', { state: { from: location.pathname } });
      } else {
        setError('Failed to load interview session.');
      }
    }
  }, [sessionId, navigate]);

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking(); // Stop AI if user starts speaking
      startListening();
    }
  };

  // Submit answer
  const handleSubmitAnswer = useCallback(async () => {
    if ((!currentAnswer.trim() && !transcript.trim()) || isSubmitting || interviewEnded) return;
    
    if (isListening) stopListening();
    
    setIsSubmitting(true);
    setError('');

    const answerText = currentAnswer.trim() || transcript.trim();
    setCurrentAnswer('');
    setTranscript('');

    setMessages((prev) => [...prev, {
      type: 'user',
      content: answerText,
      timestamp: new Date(),
    }]);

    setMessages((prev) => [...prev, {
      type: 'typing',
      content: '',
      timestamp: new Date(),
    }]);

    try {
      const res = await submitMockAnswer(sessionId, answerText);
      if (res.data.success) {
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.type !== 'typing');
          return [...filtered, {
            type: 'ai',
            content: res.data.data.question,
            timestamp: new Date(),
            spoken: false,
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
  }, [sessionId, currentAnswer, transcript, isSubmitting, interviewEnded, isListening, stopListening, setTranscript]);

  // End interview
  const handleEndInterview = useCallback(async (reason) => {
    // Note: If called from React onClick, 'reason' is an event object.
    // If called from our internal logic, it's a string.
    let terminationReason = 'Manual termination';
    let isTerminated = false;

    if (typeof reason === 'string') {
        terminationReason = reason;
        isTerminated = true;
    }
    
    if (isEnding || interviewEnded) return;
    
    // Stop all active processes immediately
    if (isListening) stopListening();
    if (isSpeaking) stopSpeaking();
    
    setIsEnding(true);
    setInterviewEnded(true);

    if (isTerminated) {
       setError(`Interview Terminated: ${terminationReason}`);
    }

    // We use a functional state update to get the latest messages without depending on them
    setMessages(prevMessages => {
        // If the last message is an AI question without an answer, pass empty
        const lastMsg = prevMessages[prevMessages.length - 1];
        const pendingAnswer = lastMsg?.type === 'ai' ? '' : undefined;

        // Trigger the API call inside the state update (safe here as it's an async separation)
        (async () => {
            try {
                console.log('[MockInterview] Ending interview session:', sessionId, 'Reason:', terminationReason);
                
                const m = behaviorMetricsRef.current;
                const metrics = {
                    faceMissingDuration: Math.round(m.faceMissingDuration),
                    faceMissingCount: m.faceMissingCount,
                    averageConfidence: m.totalDetections > 0 
                          ? Math.round(m.confidenceSum / m.totalDetections) 
                          : 0,
                    dominantEmotion: Object.keys(m.emotions).length > 0
                          ? Object.keys(m.emotions).reduce((a, b) => m.emotions[a] > m.emotions[b] ? a : b)
                          : 'neutral'
                };

                const res = await endMockInterview(sessionId, pendingAnswer, {
                    behaviorReport: {
                        ...visionStatus,
                        metrics,
                        flags: behaviorFlags,
                        terminated: isTerminated,
                        reason: terminationReason
                    }
                });
                
                if (res.data.success) {
                    navigate(`/dashboard/mock-interview/${sessionId}/report`, {
                        replace: true, 
                        state: {
                            report: res.data.data.report,
                            qaHistory: res.data.data.qaHistory,
                            role: res.data.data.role,
                            difficulty: res.data.data.difficulty,
                            duration: res.data.data.duration,
                        },
                    });
                } else {
                    throw new Error(res.data.message || 'Failed to generate report');
                }
            } catch (err) {
                console.error('[MockInterview] Failed to end interview:', err);
                setError(err.response?.data?.error || err.message || 'Failed to end interview. Please try again.');
                setIsEnding(false);
                setInterviewEnded(false);
            }
        })();

        return prevMessages;
    });
  }, [sessionId, isEnding, interviewEnded, isListening, isSpeaking, stopListening, stopSpeaking, visionStatus, behaviorFlags, navigate]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  // Timer logic - Refactored to handle clock skew
  const [timeLeftSet, setTimeLeftSet] = useState(false);

  useEffect(() => {
    if (!startedAt || !duration || interviewEnded || timeLeftSet) return;
    
    const startTimeServer = new Date(startedAt).getTime();
    const nowServer = Date.now(); // Local approximation
    const elapsedSeconds = Math.max(0, Math.floor((nowServer - startTimeServer) / 1000));
    
    // If elapsed time is suspiciously high or negative, assume it's a fresh start
    // otherwise use the server-synced elapsed time
    const initialRemaining = Math.max(0, (duration * 60) - elapsedSeconds);
    
    setTimeLeft(initialRemaining);
    setTimeLeftSet(true);
  }, [startedAt, duration, interviewEnded, timeLeftSet]);

  useEffect(() => {
    if (!timeLeftSet || interviewEnded || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = Math.max(0, prev - 1);
        if (next <= 0) {
          handleEndInterview('Time limit exceeded');
          clearInterval(interval);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeftSet, interviewEnded, handleEndInterview, timeLeft]);

  // Warning logic
  useEffect(() => {
    setTimerWarning(timeLeft <= 120 && timeLeft > 0);
  }, [timeLeft]);

  // Format time helper
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const difficultyColors = {
    EASY: '#22c55e',
    MEDIUM: '#f59e0b',
    HARD: '#ef4444',
  };

  return (
    <div className="min-h-screen text-white flex overflow-hidden font-inter relative z-10">
      <div className="flex w-full min-h-screen">
        <div className="hidden xl:block w-[280px] flex-shrink-0" aria-hidden="true" />
        <Sidebar />

        <main className="flex-1 min-h-screen relative z-10 flex flex-col">
          {/* Top Bar */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-surface border-b border-[rgba(255,255,255,0.05)] px-6 py-4 flex items-center justify-between flex-shrink-0 pl-16 xl:pl-6"
          >
            <div className="flex items-center gap-3">
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

            <div className="flex items-center gap-3">
              {/* Voice Controls */}
              <div className="flex items-center gap-2 mr-4 bg-white/5 p-1.5 rounded-xl border border-white/5">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2 rounded-lg transition-all ${isMuted ? 'text-[#94a3b8]' : 'text-[#5de6ff] bg-[#5de6ff]/10'}`}
                  title={isMuted ? 'Unmute AI' : 'Mute AI'}
                >
                  {isMuted ? <Bot size={16} className="opacity-50" /> : <Bot size={16} />}
                </button>
                <div className="h-4 w-[1px] bg-white/10" />
                <button 
                  onClick={() => setIsCameraOn(!isCameraOn)}
                  className={`p-2 rounded-lg transition-all ${!isCameraOn ? 'text-red-400 bg-red-400/10' : 'text-[#5de6ff] bg-[#5de6ff]/10'}`}
                  title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
                  disabled={interviewEnded || isEnding}
                >
                  {isCameraOn ? <Camera size={16} /> : <CameraOff size={16} />}
                </button>
                <div className="h-4 w-[1px] bg-white/10" />
                <div className="flex items-center gap-1.5 px-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${voiceMode ? 'bg-[#5de6ff] animate-pulse shadow-[0_0_8px_#5de6ff]' : 'bg-white/10'}`} />
                   <span className="text-[9px] font-space font-bold uppercase tracking-widest text-[#94a3b8]">
                      {voiceMode ? 'Speech Live' : 'Text Only'}
                   </span>
                </div>
              </div>

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
                    <span>Ending...</span>
                  </>
                ) : (
                  <>
                    <StopCircle size={14} />
                    <span>End</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Main Area with Video Panel */}
          <div className="flex-1 flex overflow-hidden">
             {/* Chat Area (Left/Main) */}
             <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-1 relative" style={{ scrollBehavior: 'smooth' }}>
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
                           className={`rounded-2xl px-5 py-4 max-w-[70%] text-sm leading-relaxed whitespace-pre-wrap relative group ${
                             msg.type === 'ai'
                               ? 'glass-surface-low rounded-tl-md border border-[rgba(255,255,255,0.05)] text-[#e2e8f0]'
                               : 'bg-gradient-to-br from-[rgba(192,193,255,0.15)] to-[rgba(93,230,255,0.08)] rounded-tr-md border border-[rgba(192,193,255,0.15)] text-white'
                           }`}
                         >
                           {msg.content}
                           
                           {msg.type === 'ai' && !isMuted && (
                              <motion.div
                                animate={isSpeaking && idx === messages.length - 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                                className="absolute -right-2 top-0 w-5 h-5 rounded-full ai-gradient-bg flex items-center justify-center shadow-lg"
                              >
                                <div className="flex gap-0.5">
                                  <span className="w-0.5 h-2 bg-[#0c0c1d] animate-pulse" />
                                  <span className="w-0.5 h-3 bg-[#0c0c1d] animate-pulse" style={{ animationDelay: '0.2s' }} />
                                  <span className="w-0.5 h-2 bg-[#0c0c1d] animate-pulse" style={{ animationDelay: '0.4s' }} />
                                </div>
                              </motion.div>
                           )}
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

             {/* Vision Dashboard (Right Side Panel) */}
             <div className="w-[320px] h-full glass-surface border-l border-white/5 flex flex-col hidden lg:flex">
               <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg ai-gradient-bg flex items-center justify-center shadow-[0_0_12px_rgba(93,230,255,0.3)]">
                      <Eye className="text-[#0c0c1d]" size={16} />
                    </div>
                    <span className="font-space font-bold text-xs uppercase tracking-widest text-[#5de6ff]">Live Vision</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-[#22c55e]/10 text-[#22c55e]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse shadow-[0_0_8px_#22c55e]" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">Compliant</span>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                  {/* Camera Preview Box */}
                  <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                    <VideoMonitor 
                       isActive={isCameraOn && !interviewEnded && !isEnding}
                       isInterviewing={!interviewEnded && !isEnding}
                       onStatusUpdate={handleStatusUpdate}
                       onAutoEnd={(reason) => handleEndInterview(reason)}
                       onBehaviorLogged={(flag) => setBehaviorFlags(prev => [...prev, flag])}
                    />
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass-surface-low rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-[#94a3b8]">
                           <Activity size={12} />
                           <span className="text-[9px] uppercase font-bold tracking-widest">Presence</span>
                        </div>
                        <p className={`text-xs font-space font-bold ${visionStatus.faceDetected ? 'text-[#22c55e]' : 'text-red-400'}`}>
                           {visionStatus.faceDetected ? 'Locked' : 'Missing'}
                        </p>
                    </div>
                    <div className="glass-surface-low rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-[#94a3b8]">
                           <Smile size={12} />
                           <span className="text-[9px] uppercase font-bold tracking-widest">Expression</span>
                        </div>
                        <p className="text-xs font-space font-bold text-[#5de6ff] capitalize">
                           {visionStatus.emotion}
                        </p>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="glass-surface-low rounded-2xl p-4 border border-white/5">
                     <div className="flex items-center justify-between mb-3 text-[#94a3b8]">
                        <div className="flex items-center gap-2">
                           <Zap size={12} className="text-[#f59e0b]" />
                           <span className="text-[9px] uppercase font-bold tracking-widest">AI Confidence Score</span>
                        </div>
                        <span className="text-[10px] font-space font-bold text-white">{Math.round(visionStatus.confidenceScore)}%</span>
                     </div>
                     <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${visionStatus.confidenceScore}%` }}
                          className="h-full bg-gradient-to-r from-[#f59e0b] via-[#5de6ff] to-[#c0c1ff]" 
                        />
                     </div>
                  </div>

                  {/* Guidance Section */}
                  <div className="p-4 rounded-2xl bg-[#5de6ff]/5 border border-[#5de6ff]/10">
                     <h4 className="text-[9px] font-space font-bold uppercase tracking-[0.2em] text-[#5de6ff] mb-2 flex items-center gap-2">
                        <AlertCircle size={10} /> Smart Vision Assistant
                     </h4>
                     <p className="text-[10px] text-[#94a3b8] leading-relaxed italic">
                        "Your expression is {visionStatus.emotion}. Maintain neutral eye contact for a professional score."
                     </p>
                  </div>
               </div>

               <div className="p-5 border-t border-white/5">
                  <div className="flex items-center gap-3 text-[9px] font-bold text-[#475569] uppercase tracking-widest">
                     <ShieldCheck size={12} /> Privacy Protected · On-Device AI
                  </div>
               </div>
             </div>
          </div>

          {/* Voice Visualization Overlay */}
          <AnimatePresence>
            {(isListening || isSpeaking) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mx-auto mb-4 flex flex-col items-center gap-2"
              >
                 <div className="flex gap-1.5 h-8 items-center">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          height: isListening ? [10, 24, 10] : [10, 16, 10], 
                          backgroundColor: isListening ? '#5de6ff' : '#c0c1ff' 
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 0.5, 
                          delay: i * 0.1 
                        }}
                        className="w-1 rounded-full shadow-[0_0_10px_rgba(93,230,255,0.4)]"
                      />
                    ))}
                 </div>
                 <span className="font-space text-[10px] uppercase font-bold tracking-[0.2em] text-[#5de6ff] flex items-center gap-2">
                    {isListening ? 'Listening for your response...' : 'AI is speaking...'}
                 </span>
              </motion.div>
            )}
          </AnimatePresence>

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
            {supported.recognition === false && voiceMode && (
               <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mx-4 sm:mx-8 mb-2"
               >
                 <div className="max-w-[800px] mx-auto p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3 text-yellow-500 text-[10px] font-bold uppercase tracking-wider">
                   <AlertCircle size={14} />
                   Voice recognition not supported in this browser. Use Chrome or Safari for speech features.
                 </div>
               </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="glass-surface border-t border-[rgba(255,255,255,0.05)] px-4 sm:px-8 py-4 flex-shrink-0">
            <div className="max-w-[800px] mx-auto w-full">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative group">
                  <textarea
                    ref={textareaRef}
                    id="mock-interview-answer"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={interviewEnded ? 'Interview has ended.' : isListening ? 'Listening...' : 'Type your answer...'}
                    disabled={isSubmitting || interviewEnded || isEnding}
                    rows={2}
                    className={`glass-input resize-none text-sm pr-4 py-3 transition-all ${isListening ? 'border-[#5de6ff] shadow-[0_0_15px_rgba(93,230,255,0.1)]' : ''}`}
                    style={{ minHeight: '56px', maxHeight: '160px' }}
                  />
                  
                  {supported.recognition && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleToggleMic}
                      className={`absolute right-4 bottom-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isListening 
                          ? 'ai-gradient-bg text-[#0c0c1d] shadow-[0_0_20px_rgba(93,230,255,0.4)] animate-pulse' 
                          : 'bg-white/5 text-[#94a3b8] hover:text-[#5de6ff] hover:bg-[#5de6ff]/10'
                      }`}
                    >
                       <Mic size={18} />
                    </motion.button>
                  )}
                </div>

                <motion.button
                  whileHover={!isSubmitting && !interviewEnded ? { scale: 1.05 } : {}}
                  whileTap={!isSubmitting && !interviewEnded ? { scale: 0.95 } : {}}
                  onClick={handleSubmitAnswer}
                  disabled={(!currentAnswer.trim() && !transcript.trim()) || isSubmitting || interviewEnded}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                    (currentAnswer.trim() || transcript.trim()) && !isSubmitting && !interviewEnded
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
                {isListening ? (
                  <span className="text-[#5de6ff] font-bold animate-pulse">Recording neural input... Click mic again to stop.</span>
                ) : (
                  <>Press <span className="text-[#c0c1ff] font-medium">Enter</span> to send · <span className="text-[#c0c1ff] font-medium">Shift+Enter</span> for new line · {voiceMode && <span className="text-[#5de6ff] font-medium">Microphone</span>} activated</>
                )}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MockInterviewPage;
