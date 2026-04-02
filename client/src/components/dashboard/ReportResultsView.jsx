import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Shield, TrendingUp, Clock, AlertTriangle, ChevronDown, ChevronUp, Star, CheckCircle, AlertCircle
} from 'lucide-react';

// ─── Score Ring ────────────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
  const radius = 54;
  const stroke = 7;
  const norm = radius - stroke * 2;
  const circ = norm * 2 * Math.PI;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#5de6ff' : score >= 50 ? '#c0c1ff' : '#f87171';

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg width={radius * 2} height={radius * 2} className="transform -rotate-90">
        <circle stroke="rgba(255,255,255,0.05)" fill="transparent" strokeWidth={stroke} r={norm} cx={radius} cy={radius} />
        <motion.circle
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          r={norm}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-space text-3xl font-bold text-white">{score}</span>
        <span className="text-[9px] font-space uppercase tracking-widest font-bold" style={{ color }}>/100</span>
      </div>
    </div>
  );
};

// ─── Severity Badge ─────────────────────────────────────────────────────────
const SeverityBadge = ({ severity }) => {
  const cfg = {
    high: { bg: 'bg-[rgba(239,68,68,0.12)]', border: 'border-red-500/30', text: 'text-red-400', icon: <AlertTriangle size={10} /> },
    medium: { bg: 'bg-[rgba(251,191,36,0.12)]', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: <AlertCircle size={10} /> },
    low: { bg: 'bg-[rgba(34,197,94,0.12)]', border: 'border-green-500/30', text: 'text-green-400', icon: <CheckCircle size={10} /> },
  }[severity?.toLowerCase()] || {};
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-space font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      {cfg.icon} {severity}
    </span>
  );
};

// ─── Expandable Q&A Card ────────────────────────────────────────────────────
const QACard = ({ item, index, color = '#5de6ff' }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] overflow-hidden"
    >
      <button
        className="w-full flex items-start justify-between gap-4 p-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-space font-bold text-[#0c0c1d] mt-0.5" style={{ background: color }}>
            {index + 1}
          </span>
          <p className="text-sm text-white font-medium leading-relaxed">{item.question}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-[#94a3b8] shrink-0 mt-0.5" /> : <ChevronDown size={16} className="text-[#94a3b8] shrink-0 mt-0.5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-3 border-t border-[rgba(255,255,255,0.05)] pt-3">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#94a3b8] font-space block mb-1">Interviewer's Intention</span>
                <p className="text-xs text-[#c0c1ff] leading-relaxed">{item.intention}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#94a3b8] font-space block mb-1">How to Answer</span>
                <p className="text-xs text-[#e2e8f0] leading-relaxed whitespace-pre-line">{item.answer}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ReportResultsView = ({ report }) => {
  const { matchScore, technicalQuestions, behavioralQuestions, skillGaps, preparationPlan, title } = report;

  const tabs = ['Overview', 'Technical', 'Behavioral', 'Skill Gaps', 'Prep Plan'];
  const [tab, setTab] = useState('Overview');

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-xl ai-gradient-bg flex items-center justify-center">
          <Brain size={16} className="text-[#0c0c1d]" />
        </div>
        <div>
          <span className="text-[9px] font-space uppercase tracking-widest text-[#5de6ff] font-bold block">Interview Intelligence</span>
          <h2 className="font-space text-xl font-bold text-white tracking-tight">{title}</h2>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] mb-6 overflow-x-auto no-scrollbar">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-space font-bold uppercase tracking-wider transition-all ${
              tab === t
                ? 'ai-gradient-bg text-[#0c0c1d]'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'Overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 glass-surface rounded-3xl p-6 border border-[rgba(255,255,255,0.05)] flex flex-col items-center gap-4">
                <span className="text-[9px] font-space font-bold uppercase tracking-widest text-[#94a3b8]">Match Score</span>
                <ScoreRing score={matchScore} />
                <p className="text-xs text-[#94a3b8] text-center font-inter">
                  {matchScore >= 75 ? '🎯 Strong match — well aligned with job requirements' :
                   matchScore >= 50 ? '⚡ Moderate match — some gaps to address' :
                   '⚠️ Weak match — significant preparation needed'}
                </p>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                {[
                  { label: 'Technical Qs', value: technicalQuestions?.length, icon: <Brain size={18} className="text-[#5de6ff]" />, sub: 'Questions prepared' },
                  { label: 'Behavioral Qs', value: behavioralQuestions?.length, icon: <Shield size={18} className="text-[#c0c1ff]" />, sub: 'Scenarios prepared' },
                  { label: 'Skill Gaps', value: skillGaps?.length, icon: <TrendingUp size={18} className="text-yellow-400" />, sub: 'Areas to improve' },
                  { label: 'Prep Days', value: preparationPlan?.length, icon: <Clock size={18} className="text-green-400" />, sub: 'Day plan ready' },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="glass-surface rounded-2xl p-4 border border-[rgba(255,255,255,0.05)]"
                  >
                    {s.icon}
                    <div className="font-space text-3xl font-bold text-white mt-2">{s.value}</div>
                    <div className="text-xs font-inter font-semibold text-white mt-0.5">{s.label}</div>
                    <div className="text-[10px] text-[#94a3b8]">{s.sub}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {skillGaps?.length > 0 && (
              <div className="mt-6 glass-surface rounded-3xl p-6 border border-[rgba(255,255,255,0.05)]">
                <h4 className="font-space text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-yellow-400" /> Skill Gap Summary
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skillGaps.map((g, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                      <span className="text-xs text-white font-medium">{g.skill}</span>
                      <SeverityBadge severity={g.severity} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'Technical' && (
          <motion.div key="technical" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
            {technicalQuestions?.map((q, i) => <QACard key={i} item={q} index={i} color="#5de6ff" />)}
          </motion.div>
        )}

        {tab === 'Behavioral' && (
          <motion.div key="behavioral" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
            {behavioralQuestions?.map((q, i) => <QACard key={i} item={q} index={i} color="#c0c1ff" />)}
          </motion.div>
        )}

        {tab === 'Skill Gaps' && (
          <motion.div key="gaps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
            {skillGaps?.map((g, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${g.severity === 'high' ? 'bg-red-400' : g.severity === 'medium' ? 'bg-yellow-400' : 'bg-green-400'} shadow-[0_0_8px_currentcolor]`} />
                  <span className="text-sm text-white font-medium">{g.skill}</span>
                </div>
                <SeverityBadge severity={g.severity} />
              </div>
            ))}
          </motion.div>
        )}

        {tab === 'Prep Plan' && (
          <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
            {preparationPlan?.map((d, i) => (
              <div key={i} className="glass-surface rounded-2xl p-5 border border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl ai-gradient-bg flex items-center justify-center text-xs font-space font-bold text-[#0c0c1d]">
                    {d.day}
                  </div>
                  <div>
                    <span className="text-[9px] font-space uppercase tracking-wider text-[#94a3b8] font-bold">Day {d.day}</span>
                    <p className="text-sm font-semibold text-white">{d.focus}</p>
                  </div>
                </div>
                <ul className="flex flex-col gap-1.5 ml-11">
                  {d.tasks?.map((task, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-[#94a3b8] font-inter">
                      <Star size={10} className="text-[#5de6ff] shrink-0 mt-0.5" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportResultsView;
