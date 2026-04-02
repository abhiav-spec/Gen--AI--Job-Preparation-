import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Target, Activity, Settings, Zap, AlertCircle,
  File, CheckCircle, RefreshCw, Database, ChevronDown, ChevronUp,
  Brain, Shield, BookOpen, Clock, Star, TrendingUp, AlertTriangle
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import { generateInterviewReport } from '../api/interview.api';

// Removed inline result components as requested

// ─── Main Page ──────────────────────────────────────────────────────────────
const ReportGeneratorPage = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [selfDescription, setSelfDescription] = useState('');
  const [industryBenchmarking, setIndustryBenchmarking] = useState(true);
  const [competencyMapping, setCompetencyMapping] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false); // New success state

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx'))) {
      setResumeFile(file); setError('');
    } else { setError('Please upload a valid PDF or DOCX file.'); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx'))) {
      setResumeFile(file); setError('');
    } else { setError('Please upload a valid PDF or DOCX file.'); }
  };

  const handleSubmit = async () => {
    // Validation
    if (!jobDescription.trim()) return setError('Please provide a job description.');
    if (!selfDescription.trim()) return setError('Please provide a professional persona.');
    
    if (!resumeFile) {
      return setError('Please upload your resume.');
    }
    
    if (resumeFile) {
      if (!resumeFile.type.includes('pdf')) {
        return setError('Please upload a valid PDF file.');
      }
      if (resumeFile.size > 10 * 1024 * 1024) {
        return setError('File size must be less than 10MB.');
      }
    }

    setLoading(true);
    setError('');
    setReportResult(null);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobdescription', jobDescription);
      formData.append('selfdescription', selfDescription);

      const res = await generateInterviewReport(formData);
      if (res.data.success) {
        setIsSuccess(true);
      } else {
        setError(res.data.error || 'Failed to generate report.');
      }
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err.response?.data?.error || err.message || 'An error occurred during report generation.');
    } finally {
      setLoading(false);
    }
  };

  const activeResumeName = resumeFile?.name ?? null;

  return (
    <div className="min-h-screen text-white flex overflow-hidden font-inter relative z-10">
      {/* Background is handled globally by ThreeBackground in App.jsx */}
      <div className="w-[300px] h-full relative hidden xl:block z-50"><Sidebar /></div>

      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative scroll-smooth px-6 xl:px-8 pb-12 z-10 custom-scrollbar">
        <div className="max-w-[1200px] mx-auto w-full pt-12">

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-[10px] font-space font-bold uppercase tracking-widest text-[#94a3b8] mb-6">
              <span>Dashboard</span><span className="text-[#5de6ff]">{'>'}</span>
              <span className="text-[#5de6ff]">Generate AI Report</span>
            </div>
            <span className="inline-block px-3 py-1 bg-[rgba(93,230,255,0.1)] border border-[rgba(93,230,255,0.2)] rounded-full text-[10px] font-space text-[#5de6ff] uppercase tracking-widest mb-4 font-bold">
              Lab Environment v4.2
            </span>
            <h1 className="font-space text-5xl font-bold tracking-tighter text-white mb-4">Generate AI Report</h1>
            <p className="font-inter text-[#94a3b8] text-base max-w-2xl">
              Synthesize your professional trajectory. Our neural engine analyzes your resume against industry benchmarks.
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-red-400 flex items-center gap-3">
                <AlertCircle size={18} /><span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left */}
            <div className="flex flex-col gap-8">
              {/* Resume Section */}
              <div className="glass-surface rounded-3xl p-6 border border-[rgba(255,255,255,0.05)] flex flex-col group">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="text-[#5de6ff]" size={18} />
                    <h3 className="font-space font-bold tracking-tight text-lg text-white">Resume Upload</h3>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-[#94a3b8] font-bold">PDF, DOCX</span>
                </div>

                <div
                  className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative transition-colors duration-300 min-h-[140px] ${resumeFile ? 'border-[#5de6ff] bg-[rgba(93,230,255,0.02)]' : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(93,230,255,0.4)] bg-[rgba(0,0,0,0.15)]'}`}
                  onDragOver={(e) => e.preventDefault()} onDrop={handleFileDrop}
                >
                  <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {resumeFile ? (
                    <div className="flex flex-col items-center gap-2 p-4">
                      <File className="text-[#5de6ff]" size={32} />
                      <span className="text-sm font-medium text-white">{resumeFile.name}</span>
                      <span className="text-xs text-[#5de6ff]">Click to change</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-6 text-center">
                      <Upload className="text-[#94a3b8] mb-1" size={28} />
                      <div className="text-sm font-inter text-[#94a3b8]">
                        <span className="text-white font-medium">Drag and drop or</span> <span className="text-[#5de6ff] underline underline-offset-4 font-medium">browse files</span>
                      </div>
                      <span className="text-xs text-[rgba(148,163,184,0.5)]">Max 10MB</span>
                    </div>
                  )}
                </div>
              </div>


              {/* Persona */}
              <div className="glass-surface rounded-3xl p-6 border border-[rgba(255,255,255,0.05)] h-56 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <Settings className="text-[#5de6ff]" size={18} />
                    <h3 className="font-space font-bold tracking-tight text-lg text-white">Professional Persona</h3>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-[#94a3b8] font-bold">Self-Description</span>
                </div>
                <textarea
                  value={selfDescription} onChange={(e) => setSelfDescription(e.target.value)}
                  className="flex-1 w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 text-sm text-white font-inter placeholder:text-[#94a3b8] focus:outline-none focus:border-[#5de6ff] resize-none transition-colors"
                  placeholder="Describe your career goals, key achievements, and unique value proposition..."
                />
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col gap-8">
              {/* Job Description */}
              <div className="glass-surface rounded-3xl p-6 border border-[rgba(255,255,255,0.05)] flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <Target className="text-[#5de6ff]" size={18} />
                    <h3 className="font-space font-bold tracking-tight text-lg text-white">Target Role</h3>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-[#94a3b8] font-bold bg-[rgba(255,255,255,0.05)] px-2 py-1 rounded">Raw Text</span>
                </div>
                <textarea
                  value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                  className="flex-1 w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 text-sm text-white font-inter placeholder:text-[#94a3b8] focus:outline-none focus:border-[#5de6ff] resize-none transition-colors min-h-[200px]"
                  placeholder="Paste the job description or requirements here..."
                />
              </div>

              {/* Synthesis Params */}
              <div className="glass-surface rounded-3xl p-6 border border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="text-[#5de6ff]" size={18} />
                  <h3 className="font-space font-bold tracking-tight text-lg text-white">Synthesis Parameters</h3>
                </div>
                <div className="flex flex-col gap-4 mb-6">
                  {[
                    { label: 'Industry Benchmarking', state: industryBenchmarking, toggle: () => setIndustryBenchmarking(!industryBenchmarking) },
                    { label: 'Competency Mapping', state: competencyMapping, toggle: () => setCompetencyMapping(!competencyMapping) },
                  ].map(p => (
                    <div key={p.label} className="flex justify-between items-center p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                      <span className="text-sm font-medium text-white">{p.label}</span>
                      <button onClick={p.toggle} className={`w-10 h-5 rounded-full relative transition-colors ${p.state ? 'bg-[#5de6ff]' : 'bg-[rgba(255,255,255,0.1)]'}`}>
                        <motion.div animate={{ x: p.state ? 20 : 2 }} className="w-4 h-4 bg-white rounded-full absolute top-[2px]" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSubmit} disabled={loading}
                  className="w-full py-4 rounded-xl ai-gradient-bg text-[#0c0c1d] font-space font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 hover:shadow-[0_0_20px_rgba(93,230,255,0.4)] transition-all"
                >
                  {loading ? <><Activity className="animate-spin" size={16} /> Analyzing — please wait...</> : <>START AI ANALYSIS <Zap size={16} /></>}
                </button>

                <div className="text-center mt-4 text-[9px] uppercase tracking-widest text-[#94a3b8] font-bold">
                  {activeResumeName
                    ? <>Using: <span className="text-[#5de6ff]">{activeResumeName}</span></>
                    : loading ? '⚡ Neural engine processing...' : 'Estimated time: ~30–60s'}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Success View ─────────────────────────────────── */}
          {isSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-12 glass-surface rounded-3xl p-12 border border-[rgba(93,230,255,0.2)] text-center flex flex-col items-center gap-6"
            >
              <div className="w-20 h-20 rounded-full ai-gradient-bg flex items-center justify-center shadow-[0_0_30px_rgba(93,230,255,0.3)]">
                <CheckCircle size={40} className="text-[#0c0c1d]" />
              </div>
              <div>
                <h2 className="font-space text-3xl font-bold text-white mb-2">Analysis Synchronized</h2>
                <p className="font-inter text-[#94a3b8] max-w-md mx-auto">
                  The neural synthesis is complete. Your AI interview report has been archived and is ready for review in your command center.
                </p>
              </div>
              <a 
                href="/dashboard"
                className="px-8 py-4 rounded-xl ai-gradient-bg text-[#0c0c1d] font-space font-bold uppercase tracking-widest text-sm hover:shadow-[0_0_20px_rgba(93,230,255,0.4)] transition-all"
              >
                Go to Dashboard
              </a>
            </motion.div>
          )}

          <div className="h-16" />
        </div>
      </main>
    </div>
  );
};

export default ReportGeneratorPage;
