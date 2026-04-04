import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Shield, TrendingUp, Clock, AlertTriangle, ChevronDown, ChevronUp, Star, CheckCircle, AlertCircle, FileText, Download
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
          <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-space font-bold text-surface-lowest mt-0.5" style={{ background: color }}>
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
                <p className="text-xs text-primary leading-relaxed">{item.intention}</p>
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

const stripHtml = (html = '') => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const summarizeText = (text = '', limit = 360) => {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit).trim()}...`;
};

const buildResumeComparison = (report) => {
  const resumeText = report.resume?.trim() || '';
  const generatedResumeText = report.generatedResumeHtml ? stripHtml(report.generatedResumeHtml) : '';

  return [
    {
      title: 'Structure',
      current: resumeText ? 'Raw uploaded resume text' : 'No resume text available',
      generated: 'ATS-friendly, sectioned resume layout',
    },
    {
      title: 'Targeting',
      current: 'General profile snapshot',
      generated: `Tailored to ${report.title || 'the target role'}`,
    },
    {
      title: 'Keyword Alignment',
      current: 'Original wording from the uploaded file',
      generated: `${report.skillGaps?.length ?? 0} skill gap signals translated into stronger keywords`,
    },
    {
      title: 'Impact',
      current: 'As provided in the source resume',
      generated: `${report.matchScore ?? 0}% role alignment with a more persuasive presentation`,
    },
  ].concat(generatedResumeText ? [{
    title: 'Preview Size',
    current: `${resumeText.split(/\s+/).filter(Boolean).length} words in source resume`,
    generated: `${generatedResumeText.split(/\s+/).filter(Boolean).length} words in optimized version`,
  }] : []);
};

const normalizeQuestionItem = (item, index, fallbackPrefix) => {
  if (!item || typeof item !== 'object') {
    return {
      question: `${fallbackPrefix} ${index + 1}`,
      intention: 'No interviewer intention was generated for this item.',
      answer: 'No suggested answer is available for this item.',
    };
  }

  return {
    question: item.question || item.prompt || item.title || `${fallbackPrefix} ${index + 1}`,
    intention: item.intention || item.reason || item.goal || 'No interviewer intention was generated for this item.',
    answer: item.answer || item.sampleAnswer || item.guidance || 'No suggested answer is available for this item.',
  };
};

const normalizePrepDay = (dayItem, index) => {
  const dayNumber = Number(dayItem?.day);
  return {
    day: Number.isFinite(dayNumber) && dayNumber > 0 ? dayNumber : index + 1,
    focus: dayItem?.focus || dayItem?.topic || 'Preparation Focus',
    tasks: Array.isArray(dayItem?.tasks) && dayItem.tasks.length > 0
      ? dayItem.tasks
      : ['Review role requirements', 'Practice one targeted interview round'],
  };
};

const ReportResultsView = ({ report, onDownloadResume }) => {
  const {
    matchScore,
    technicalQuestions = [],
    behavioralQuestions = [],
    skillGaps = [],
    preparationPlan = [],
    title,
    resume = '',
    generatedResumeHtml = '',
  } = report;

  const normalizedTechnicalQuestions = (Array.isArray(technicalQuestions) ? technicalQuestions : [])
    .map((item, index) => normalizeQuestionItem(item, index, 'Technical Question'));
  const normalizedBehavioralQuestions = (Array.isArray(behavioralQuestions) ? behavioralQuestions : [])
    .map((item, index) => normalizeQuestionItem(item, index, 'Behavioral Question'));
  const normalizedSkillGaps = (Array.isArray(skillGaps) ? skillGaps : [])
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      skill: item.skill || item.name || item.gap || item.issue || 'Unspecified skill gap',
      severity: ['high', 'medium', 'low'].includes(String(item.severity).toLowerCase())
        ? String(item.severity).toLowerCase()
        : 'medium',
    }));
  const normalizedPreparationPlan = (Array.isArray(preparationPlan) ? preparationPlan : [])
    .map((item, index) => normalizePrepDay(item, index));

  const tabs = ['Technical Questions', 'Behavioral Questions', 'Skill Gap', 'Preparation Plan', 'Resume'];
  const [tab, setTab] = useState('Technical Questions');
  const resumeComparison = buildResumeComparison(report);
  const generatedResumePreview = generatedResumeHtml ? generatedResumeHtml : '';

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-xl ai-gradient-bg flex items-center justify-center">
          <Brain size={16} className="text-surface-lowest" />
        </div>
        <div>
          <span className="text-[9px] font-space uppercase tracking-widest text-secondary font-bold block">Interview Intelligence</span>
          <h2 className="font-space text-xl font-bold text-white tracking-tight">{title}</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Match Score', value: `${matchScore ?? 0}%`, sub: 'Role alignment' },
          { label: 'Technical Qs', value: normalizedTechnicalQuestions.length, sub: 'Prepared questions' },
          { label: 'Skill Gaps', value: normalizedSkillGaps.length, sub: 'Areas to improve' },
          { label: 'Prep Days', value: normalizedPreparationPlan.length, sub: 'Action plan' },
        ].map((s) => (
          <div key={s.label} className="glass-surface rounded-2xl p-4 border border-[rgba(255,255,255,0.05)]">
            <div className="text-[9px] font-space font-bold uppercase tracking-widest text-[#94a3b8]">{s.label}</div>
            <div className="font-space text-3xl font-bold text-white mt-2">{s.value}</div>
            <div className="text-[10px] text-[#94a3b8] mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 p-1 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] mb-6 overflow-x-auto no-scrollbar">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-space font-bold uppercase tracking-wider transition-all ${
              tab === t
                ? 'ai-gradient-bg text-surface-lowest'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'Technical Questions' && (
          <motion.div key="technical" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
            {normalizedTechnicalQuestions.length > 0
              ? normalizedTechnicalQuestions.map((q, i) => <QACard key={i} item={q} index={i} color="#5de6ff" />)
              : <div className="rounded-2xl border border-dashed border-surface-container-high p-6 text-sm text-[#94a3b8]">No technical questions were generated for this report.</div>}
          </motion.div>
        )}

        {tab === 'Behavioral Questions' && (
          <motion.div key="behavioral" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
            {normalizedBehavioralQuestions.length > 0
              ? normalizedBehavioralQuestions.map((q, i) => <QACard key={i} item={q} index={i} color="#c0c1ff" />)
              : <div className="rounded-2xl border border-dashed border-surface-container-high p-6 text-sm text-[#94a3b8]">No behavioral questions were generated for this report.</div>}
          </motion.div>
        )}

        {tab === 'Skill Gap' && (
          <motion.div key="gaps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
            {normalizedSkillGaps.length > 0 ? normalizedSkillGaps.map((g, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${g.severity === 'high' ? 'bg-red-400' : g.severity === 'medium' ? 'bg-yellow-400' : 'bg-green-400'} shadow-[0_0_8px_currentcolor]`} />
                  <span className="text-sm text-white font-medium">{g.skill}</span>
                </div>
                <SeverityBadge severity={g.severity} />
              </div>
            )) : <div className="rounded-2xl border border-dashed border-surface-container-high p-6 text-sm text-[#94a3b8]">No skill gaps were identified in this report.</div>}
          </motion.div>
        )}

        {tab === 'Preparation Plan' && (
          <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
            {normalizedPreparationPlan.length > 0 ? normalizedPreparationPlan.map((d, i) => (
              <div key={i} className="glass-surface rounded-2xl p-5 border border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl ai-gradient-bg flex items-center justify-center text-xs font-space font-bold text-surface-lowest">
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
                      <Star size={10} className="text-secondary shrink-0 mt-0.5" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-surface-container-high p-6 text-sm text-[#94a3b8]">No preparation plan was generated for this report.</div>}
          </motion.div>
        )}

        {tab === 'Resume' && (
          <motion.div key="resume" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-surface rounded-3xl p-5 border border-[rgba(255,255,255,0.05)]">
              <div>
                <span className="text-[9px] font-space font-bold uppercase tracking-widest text-[#94a3b8] block mb-1">AI Generated Resume</span>
                <h4 className="font-space text-lg font-bold text-white">View and download the optimized resume</h4>
              </div>
              <div className="flex gap-3">
                  <button
                    onClick={onDownloadResume}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl ai-gradient-bg text-surface-lowest font-space font-bold uppercase tracking-widest text-[10px] hover:shadow-[0_0_20px_rgba(93,230,255,0.4)] transition-all"
                  >
                  <Download size={14} /> Download PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="glass-surface rounded-3xl p-5 border border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={16} className="text-primary" />
                  <h5 className="font-space text-sm font-bold text-white uppercase tracking-widest">Current Resume Snapshot</h5>
                </div>
                <div className="max-h-130 overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)] p-4">
                  <p className="text-sm leading-7 text-[#e2e8f0] whitespace-pre-wrap font-inter">
                    {resume ? summarizeText(resume, 2200) : 'No resume text was captured from the uploaded file.'}
                  </p>
                </div>
              </div>

              <div className="glass-surface rounded-3xl p-5 border border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-2 mb-4">
                  <Brain size={16} className="text-secondary" />
                  <h5 className="font-space text-sm font-bold text-white uppercase tracking-widest">AI Generated Resume</h5>
                </div>
                {generatedResumePreview ? (
                  <iframe
                    title="AI Generated Resume Preview"
                    srcDoc={generatedResumePreview}
                    className="w-full h-130 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-white"
                    sandbox="allow-same-origin"
                  />
                ) : (
                  <div className="h-130 rounded-2xl border border-dashed border-surface-container-high flex items-center justify-center text-sm text-[#94a3b8]">
                    The generated resume preview is not available yet.
                  </div>
                )}
              </div>
            </div>

            <div className="glass-surface rounded-3xl p-5 border border-[rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-secondary" />
                <h5 className="font-space text-sm font-bold text-white uppercase tracking-widest">What Changed</h5>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {resumeComparison.map((item, index) => (
                  <div key={item.title} className="rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase tracking-widest font-bold text-[#94a3b8] font-space">{item.title}</span>
                      <span className="text-[10px] text-secondary font-bold">{index + 1}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-[#94a3b8] font-bold mb-1">Current</div>
                        <p className="text-[#e2e8f0] leading-relaxed">{item.current}</p>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-[#94a3b8] font-bold mb-1">AI Generated</div>
                        <p className="text-primary leading-relaxed">{item.generated}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportResultsView;
