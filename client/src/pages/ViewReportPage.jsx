import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Shield, TrendingUp, Clock, AlertTriangle, AlertCircle,
  ChevronDown, ChevronUp, Star, CheckCircle, FileText, Download,
  RefreshCw, Zap, Calendar, BarChart2, ChevronRight, Layers
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  getInterviewReports,
  getInterviewReportDetails,
  downloadInterviewReport,
} from '../api/interview.api';
import Loader from '../components/ui/Loader';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const ScoreRing = ({ score }) => {
  const radius = 40;
  const stroke = 5;
  const norm = radius - stroke * 2;
  const circ = norm * 2 * Math.PI;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#5de6ff' : score >= 50 ? '#c0c1ff' : '#f87171';
  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg width={radius * 2} height={radius * 2} className="transform -rotate-90">
        <circle stroke="rgba(255,255,255,0.06)" fill="transparent" strokeWidth={stroke} r={norm} cx={radius} cy={radius} />
        <motion.circle
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          stroke={color} fill="transparent" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`} r={norm} cx={radius} cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-space text-lg font-bold text-white">{score}</span>
        <span className="text-[8px] font-space uppercase tracking-widest font-bold" style={{ color }}>/100</span>
      </div>
    </div>
  );
};

const SeverityBadge = ({ severity }) => {
  const cfg = {
    high: { bg: 'bg-[rgba(239,68,68,0.12)]', border: 'border-red-500/30', text: 'text-red-400', icon: <AlertTriangle size={10} /> },
    medium: { bg: 'bg-[rgba(251,191,36,0.12)]', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: <AlertCircle size={10} /> },
    low: { bg: 'bg-[rgba(34,197,94,0.12)]', border: 'border-green-500/30', text: 'text-green-400', icon: <CheckCircle size={10} /> },
  }[severity?.toLowerCase()] || { bg: 'bg-white/5', border: 'border-white/10', text: 'text-[#94a3b8]', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-space font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      {cfg.icon}{severity || 'medium'}
    </span>
  );
};

const QACard = ({ item, index, color = '#5de6ff' }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] overflow-hidden"
    >
      <button
        className="w-full flex items-start justify-between gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors"
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
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-4 border-t border-white/5 pt-3">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#94a3b8] font-space block mb-1.5">
                  💡 Interviewer's Intention
                </span>
                <p className="text-xs text-[#c0c1ff] leading-relaxed">{item.intention}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#94a3b8] font-space block mb-1.5">
                  ✅ How to Answer
                </span>
                <p className="text-xs text-[#e2e8f0] leading-relaxed whitespace-pre-line">{item.answer}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'technical', label: 'Technical Questions', icon: <Brain size={14} /> },
  { key: 'behavioral', label: 'Behavioral Questions', icon: <Shield size={14} /> },
  { key: 'skillgap', label: 'Skill Gaps', icon: <TrendingUp size={14} /> },
  { key: 'prepplan', label: 'Preparation Plan', icon: <Clock size={14} /> },
  { key: 'resume', label: 'Resume', icon: <FileText size={14} /> },
];

const ViewReportPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reportList, setReportList] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [tab, setTab] = useState('technical');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [error, setError] = useState('');

  // Load report list
  const loadReportList = useCallback(async () => {
    if (!user?._id) return;
    setListLoading(true);
    try {
      const res = await getInterviewReports(user._id);
      const data = res.data?.data || [];
      setReportList(data);

      // Auto-select: prefer latestReportId from localStorage, else first
      const savedId = localStorage.getItem('latestReportId');
      const firstId = data[0]?._id;
      const autoId = (savedId && data.find(r => r._id === savedId)) ? savedId : firstId;
      if (autoId) setSelectedId(autoId);
    } catch (err) {
      console.error('Failed to load reports', err);
      setError('Failed to load your reports. Please try again.');
    } finally {
      setListLoading(false);
    }
  }, [user]);

  useEffect(() => { loadReportList(); }, [loadReportList]);

  // Load selected report detail
  useEffect(() => {
    if (!selectedId) return;
    setReportLoading(true);
    setReport(null);
    setTab('technical');
    getInterviewReportDetails(selectedId)
      .then(res => {
        if (res.data?.success) setReport(res.data.data);
        else setError('Failed to load the selected report.');
      })
      .catch(() => setError('Failed to load the selected report.'))
      .finally(() => setReportLoading(false));
  }, [selectedId]);

  const handleDownloadPdf = async () => {
    if (!selectedId) return;
    setDownloadingPdf(true);
    try {
      const res = await downloadInterviewReport(selectedId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ai_resume_${selectedId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Normalize helpers
  const tq = Array.isArray(report?.technicalQuestions) ? report.technicalQuestions : [];
  const bq = Array.isArray(report?.behavioralQuestions) ? report.behavioralQuestions : [];
  const sg = (Array.isArray(report?.skillGaps) ? report.skillGaps : []).filter(g => g?.skill);
  const pp = Array.isArray(report?.preparationPlan) ? report.preparationPlan : [];

  return (
    <div className="min-h-screen text-white flex overflow-hidden font-inter relative z-10">
      {/* Sidebar */}
      <div className="w-[300px] h-full relative hidden xl:block z-50"><Sidebar /></div>

      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative scroll-smooth px-4 xl:px-8 pb-12 z-10 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto w-full pt-10">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-[10px] font-space font-bold uppercase tracking-widest text-[#94a3b8] mb-4">
              <span>Dashboard</span>
              <span className="text-[#5de6ff]">{'>'}</span>
              <span className="text-[#5de6ff]">View Report</span>
            </div>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-space text-4xl font-bold tracking-tighter text-white mb-1">View Report</h1>
                <p className="text-[#94a3b8] text-sm">Review your AI-generated interview analysis and optimized resume.</p>
              </div>
              <button
                onClick={() => navigate('/dashboard/report-generator')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl ai-gradient-bg text-[#0c0c1d] font-space font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(93,230,255,0.4)] transition-all"
              >
                <Zap size={14} /> New Report
              </button>
            </div>
          </div>

          {listLoading ? (
            <div className="flex items-center justify-center py-20"><Loader /></div>
          ) : reportList.length === 0 ? (
            /* Empty state */
            <div className="glass-surface rounded-3xl p-12 border border-white/5 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                <Layers size={32} className="text-[#94a3b8]" />
              </div>
              <h2 className="font-space text-2xl font-bold text-white">No Reports Yet</h2>
              <p className="text-[#94a3b8] max-w-sm">You haven't generated any AI interview reports yet. Create your first one now.</p>
              <button
                onClick={() => navigate('/dashboard/report-generator')}
                className="px-6 py-3 rounded-xl ai-gradient-bg text-[#0c0c1d] font-space font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(93,230,255,0.4)] transition-all"
              >
                Generate AI Report
              </button>
            </div>
          ) : (
            <div className="flex gap-6 items-start">

              {/* ── Reports List Panel ─────────────────────────────────────── */}
              <div className="w-72 shrink-0">
                <div className="glass-surface rounded-3xl border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <BarChart2 size={16} className="text-[#5de6ff]" />
                      <span className="font-space text-sm font-bold text-white">Past Reports</span>
                      <span className="ml-auto text-[10px] font-space font-bold text-[#94a3b8] bg-white/5 px-2 py-0.5 rounded-full">
                        {reportList.length}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col divide-y divide-white/[0.04] max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
                    {reportList.map((r) => {
                      const isSelected = r._id === selectedId;
                      return (
                        <motion.button
                          key={r._id}
                          whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                          onClick={() => { setSelectedId(r._id); localStorage.setItem('latestReportId', r._id); }}
                          className={`w-full text-left p-4 transition-colors relative ${isSelected ? 'bg-[rgba(93,230,255,0.06)]' : ''}`}
                        >
                          {isSelected && (
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full bg-[#5de6ff] shadow-[0_0_8px_rgba(93,230,255,0.6)]" />
                          )}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-[#cbd5e1]'}`}>
                                {r.title || 'Interview Report'}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Calendar size={10} className="text-[#64748b]" />
                                <span className="text-[10px] text-[#64748b]">{formatDate(r.createdAt)}</span>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className={`text-xs font-space font-bold ${(r.matchScore ?? 0) >= 75 ? 'text-[#5de6ff]' : (r.matchScore ?? 0) >= 50 ? 'text-[#c0c1ff]' : 'text-red-400'}`}>
                                {r.matchScore ?? '—'}%
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5de6ff]" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── Report Detail ──────────────────────────────────────────── */}
              <div className="flex-1 min-w-0">
                {reportLoading ? (
                  <div className="flex items-center justify-center py-20"><Loader /></div>
                ) : !report ? (
                  <div className="glass-surface rounded-3xl p-10 border border-white/5 text-center text-[#94a3b8]">
                    Select a report from the left to view its details.
                  </div>
                ) : (
                  <motion.div key={report._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

                    {/* Report header */}
                    <div className="glass-surface rounded-3xl p-6 border border-white/5 mb-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-5">
                        <ScoreRing score={report.matchScore ?? 0} />
                        <div className="flex-1">
                          <span className="text-[9px] font-space uppercase tracking-widest text-[#5de6ff] font-bold block mb-1">Interview Intelligence</span>
                          <h2 className="font-space text-2xl font-bold text-white tracking-tight mb-1">{report.title || 'Interview Report'}</h2>
                          <p className="text-xs text-[#94a3b8]">Generated on {formatDate(report.createdAt)}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { label: 'Technical Qs', value: tq.length, color: '#5de6ff' },
                            { label: 'Behavioral Qs', value: bq.length, color: '#c0c1ff' },
                            { label: 'Skill Gaps', value: sg.length, color: '#fbbf24' },
                            { label: 'Prep Days', value: pp.length, color: '#4ade80' },
                          ].map(s => (
                            <div key={s.label} className="rounded-2xl bg-white/[0.03] border border-white/5 p-3 text-center">
                              <div className="font-space text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                              <div className="text-[9px] text-[#94a3b8] font-space uppercase tracking-widest mt-0.5">{s.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Tab bar */}
                    <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/5 mb-6 overflow-x-auto no-scrollbar">
                      {TABS.map(t => (
                        <button
                          key={t.key}
                          onClick={() => setTab(t.key)}
                          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-space font-bold uppercase tracking-wider transition-all ${
                            tab === t.key ? 'ai-gradient-bg text-[#0c0c1d]' : 'text-[#94a3b8] hover:text-white'
                          }`}
                        >
                          {t.icon}{t.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab content */}
                    <AnimatePresence mode="wait">

                      {/* ── Technical Questions ── */}
                      {tab === 'technical' && (
                        <motion.div key="technical" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain size={16} className="text-[#5de6ff]" />
                            <h3 className="font-space font-bold text-white">Technical Questions</h3>
                            <span className="ml-auto text-xs text-[#5de6ff] font-space font-bold">{tq.length} questions</span>
                          </div>
                          {tq.length > 0
                            ? tq.map((q, i) => <QACard key={i} item={q} index={i} color="#5de6ff" />)
                            : <div className="rounded-2xl border border-dashed border-white/10 p-8 text-sm text-[#94a3b8] text-center">No technical questions were generated for this report.</div>
                          }
                        </motion.div>
                      )}

                      {/* ── Behavioral Questions ── */}
                      {tab === 'behavioral' && (
                        <motion.div key="behavioral" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield size={16} className="text-[#c0c1ff]" />
                            <h3 className="font-space font-bold text-white">Behavioral Questions</h3>
                            <span className="ml-auto text-xs text-[#c0c1ff] font-space font-bold">{bq.length} questions</span>
                          </div>
                          {bq.length > 0
                            ? bq.map((q, i) => <QACard key={i} item={q} index={i} color="#c0c1ff" />)
                            : <div className="rounded-2xl border border-dashed border-white/10 p-8 text-sm text-[#94a3b8] text-center">No behavioral questions were generated for this report.</div>
                          }
                        </motion.div>
                      )}

                      {/* ── Skill Gaps ── */}
                      {tab === 'skillgap' && (
                        <motion.div key="skillgap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={16} className="text-yellow-400" />
                            <h3 className="font-space font-bold text-white">Skill Gaps</h3>
                            <span className="ml-auto text-xs text-yellow-400 font-space font-bold">{sg.length} identified</span>
                          </div>
                          {/* Summary bar */}
                          {sg.length > 0 && (
                            <div className="glass-surface rounded-2xl p-4 border border-white/5 flex gap-4 flex-wrap mb-2">
                              {['high', 'medium', 'low'].map(sev => {
                                const count = sg.filter(g => g.severity === sev).length;
                                const colors = { high: 'text-red-400', medium: 'text-yellow-400', low: 'text-green-400' };
                                return (
                                  <div key={sev} className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${sev === 'high' ? 'bg-red-400' : sev === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                                    <span className={`text-xs font-space font-bold uppercase ${colors[sev]}`}>{count} {sev}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {sg.length > 0
                            ? sg.map((g, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="glass-surface rounded-2xl p-4 border border-white/5"
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${g.severity === 'high' ? 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : g.severity === 'medium' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`} />
                                      <span className="text-sm text-white font-semibold">{g.skill}</span>
                                    </div>
                                    <SeverityBadge severity={g.severity} />
                                  </div>
                                  <p className="text-xs text-[#94a3b8] mt-2 ml-5.5">
                                    {g.severity === 'high' ? 'Critical gap — directly impacts your candidacy for this role.' :
                                     g.severity === 'medium' ? 'Moderate gap — worth addressing before the interview.' :
                                     'Minor gap — low impact, but good to be aware of.'}
                                  </p>
                                </motion.div>
                              ))
                            : <div className="rounded-2xl border border-dashed border-white/10 p-8 text-sm text-[#94a3b8] text-center">No skill gaps were identified — great match!</div>
                          }
                        </motion.div>
                      )}

                      {/* ── Preparation Plan ── */}
                      {tab === 'prepplan' && (
                        <motion.div key="prepplan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock size={16} className="text-green-400" />
                            <h3 className="font-space font-bold text-white">Preparation Plan</h3>
                            <span className="ml-auto text-xs text-green-400 font-space font-bold">{pp.length}-day plan</span>
                          </div>
                          {pp.length > 0
                            ? pp.map((d, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.06 }}
                                  className="glass-surface rounded-2xl p-5 border border-white/5"
                                >
                                  <div className="flex items-center gap-4 mb-3">
                                    <div className="w-10 h-10 rounded-xl ai-gradient-bg flex items-center justify-center text-sm font-space font-bold text-[#0c0c1d] shrink-0">
                                      {d.day}
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-space uppercase tracking-wider text-[#94a3b8] font-bold">Day {d.day}</span>
                                      <p className="text-sm font-semibold text-white">{d.focus}</p>
                                    </div>
                                  </div>
                                  <ul className="flex flex-col gap-2 ml-14">
                                    {(d.tasks || []).map((task, j) => (
                                      <li key={j} className="flex items-start gap-2 text-xs text-[#94a3b8] font-inter">
                                        <Star size={10} className="text-[#5de6ff] shrink-0 mt-0.5" />
                                        {task}
                                      </li>
                                    ))}
                                  </ul>
                                </motion.div>
                              ))
                            : <div className="rounded-2xl border border-dashed border-white/10 p-8 text-sm text-[#94a3b8] text-center">No preparation plan was generated for this report.</div>
                          }
                        </motion.div>
                      )}

                      {/* ── Resume ── */}
                      {tab === 'resume' && (
                        <motion.div key="resume" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                          {/* Download banner */}
                          <div className="glass-surface rounded-2xl p-5 border border-[rgba(93,230,255,0.15)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <span className="text-[9px] font-space uppercase tracking-widest text-[#5de6ff] font-bold block mb-1">AI Optimized Resume</span>
                              <h4 className="font-space font-bold text-white text-lg">Download your tailored resume as PDF</h4>
                              <p className="text-xs text-[#94a3b8] mt-1">Tailored for the target role, ATS-friendly, professional layout.</p>
                            </div>
                            <button
                              onClick={handleDownloadPdf}
                              disabled={downloadingPdf}
                              className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl ai-gradient-bg text-[#0c0c1d] font-space font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(93,230,255,0.4)] transition-all disabled:opacity-50"
                            >
                              {downloadingPdf ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                              {downloadingPdf ? 'Preparing...' : 'Download PDF'}
                            </button>
                          </div>

                          {/* Side-by-side comparison */}
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* Original Resume */}
                            <div className="glass-surface rounded-3xl p-5 border border-white/5 flex flex-col">
                              <div className="flex items-center gap-2 mb-4">
                                <FileText size={15} className="text-[#5de6ff]" />
                                <h5 className="font-space text-sm font-bold text-white uppercase tracking-widest">Your Uploaded Resume</h5>
                              </div>
                              <div className="flex-1 overflow-y-auto rounded-2xl border border-white/5 bg-black/20 p-4 max-h-[520px] custom-scrollbar">
                                {report.resume ? (
                                  <p className="text-sm leading-7 text-[#e2e8f0] whitespace-pre-wrap font-inter">{report.resume}</p>
                                ) : (
                                  <p className="text-sm text-[#94a3b8] italic">The original resume text was not stored for this report.</p>
                                )}
                              </div>
                            </div>

                            {/* AI Generated Resume Preview */}
                            <div className="glass-surface rounded-3xl p-5 border border-white/5 flex flex-col">
                              <div className="flex items-center gap-2 mb-4">
                                <Brain size={15} className="text-[#c0c1ff]" />
                                <h5 className="font-space text-sm font-bold text-white uppercase tracking-widest">AI Generated Resume</h5>
                                <span className="ml-auto text-[9px] font-space uppercase tracking-widest text-[#5de6ff] bg-[rgba(93,230,255,0.08)] border border-[rgba(93,230,255,0.2)] px-2 py-0.5 rounded-full font-bold">Live Preview</span>
                              </div>
                              {report.generatedResumeHtml ? (
                                <iframe
                                  title="AI Generated Resume"
                                  srcDoc={report.generatedResumeHtml}
                                  className="w-full flex-1 rounded-2xl border border-white/5 bg-white"
                                  style={{ minHeight: '520px' }}
                                  sandbox="allow-same-origin"
                                />
                              ) : (
                                <div className="flex-1 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 text-center p-8" style={{ minHeight: '520px' }}>
                                  <FileText size={32} className="text-[#94a3b8]" />
                                  <p className="text-sm text-[#94a3b8]">Preview not available. Download the PDF to view the full generated resume.</p>
                                  <button
                                    onClick={handleDownloadPdf}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl ai-gradient-bg text-[#0c0c1d] font-space font-bold uppercase tracking-widest text-[10px]"
                                  >
                                    <Download size={12} /> Download PDF
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* What changed comparison table */}
                          <div className="glass-surface rounded-3xl p-5 border border-white/5">
                            <div className="flex items-center gap-2 mb-4">
                              <TrendingUp size={15} className="text-[#c0c1ff]" />
                              <h5 className="font-space text-sm font-bold text-white uppercase tracking-widest">What the AI Improved</h5>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {[
                                { aspect: 'Structure', before: 'Raw resume text as uploaded', after: 'ATS-friendly, cleanly sectioned HTML layout' },
                                { aspect: 'Keyword Targeting', before: 'Original wording from your file', after: `Optimized for "${report.title || 'the target role'}" keywords` },
                                { aspect: 'Skill Gaps Addressed', before: 'Skills presented as-is', after: `${sg.length} skill gap(s) reframed with stronger positioning` },
                                { aspect: 'Role Alignment', before: 'General professional profile', after: `${report.matchScore ?? 0}% match score — tailored narrative for this specific role` },
                              ].map((item, i) => (
                                <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                  <span className="text-[9px] font-space font-bold uppercase tracking-widest text-[#5de6ff] block mb-3">{item.aspect}</span>
                                  <div className="grid grid-cols-1 gap-2">
                                    <div>
                                      <div className="text-[9px] uppercase tracking-widest text-[#94a3b8] font-bold mb-1">Before</div>
                                      <p className="text-xs text-[#94a3b8] leading-relaxed">{item.before}</p>
                                    </div>
                                    <div>
                                      <div className="text-[9px] uppercase tracking-widest text-[#5de6ff] font-bold mb-1">After (AI)</div>
                                      <p className="text-xs text-[#e2e8f0] leading-relaxed">{item.after}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </motion.div>
                )}
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ViewReportPage;
