import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Download, 
  ExternalLink, 
  Zap, 
  Target, 
  ChevronRight, 
  FileText,
  Mic,
  Smile,
  Activity,
  Award
} from 'lucide-react';
import { getPublicInterviewReport, downloadPublicInterviewReport } from '../api/interview.api';
import { getPublicMockSession, downloadPublicMockReport } from '../api/mockInterview.api';
import Loader from '../components/ui/Loader';

const PublicReportView = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'analysis'; // 'analysis' or 'mock'
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setLoading(true);
        let res;
        if (type === 'mock') {
          res = await getPublicMockSession(id);
        } else {
          res = await getPublicInterviewReport(id);
        }
        setReport(res.data.data);
      } catch (err) {
        console.error('Failed to fetch public report:', err);
        setError('This report is no longer available or the link is invalid.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, [id, type]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = type === 'mock' 
        ? await downloadPublicMockReport(id)
        : await downloadPublicInterviewReport(id);
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `HireStack_${type}_Report_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0c0c1d]"><Loader /></div>;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0c1d] px-6 text-center">
        <h1 className="text-4xl font-space font-bold text-white mb-4">Report Not Found</h1>
        <p className="text-slate-400 max-w-md mb-8">{error}</p>
        <a href="/" className="px-8 py-3 rounded-xl ai-gradient-bg text-[#0c0c1d] font-bold uppercase tracking-widest text-xs">
          Return Home
        </a>
      </div>
    );
  }

  const score = type === 'mock' 
    ? (report.finalReport?.score?.overall || 0) 
    : (report.matchScore || 0);

  return (
    <div className="min-h-screen bg-[#0c0c1d] text-white font-inter selection:bg-[#5de6ff]/30">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#5de6ff] blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#c0c1ff] blur-[150px]" />
      </div>

      <nav className="relative z-50 border-bottom border-white/5 bg-white/5 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg ai-gradient-bg flex items-center justify-center">
              <Zap size={18} className="text-[#0c0c1d]" />
            </div>
            <span className="font-space font-bold text-xl tracking-tighter">HIRESTACK<span className="text-[#5de6ff]">AI</span></span>
          </div>
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:border-[#5de6ff]/50 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50"
          >
            {downloading ? (
              <Activity size={14} className="animate-spin text-[#5de6ff]" />
            ) : (
              <Download size={14} className="text-[#5de6ff]" />
            )}
            Download PDF
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 lg:py-20">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass-surface border border-white/10 text-[#5de6ff] text-[10px] uppercase font-bold tracking-[0.2em] mb-6">
            Public Performance Report
          </span>
          <h1 className="text-4xl md:text-6xl font-space font-bold tracking-tighter mb-6 bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
            {type === 'mock' ? report.role : (report.title || 'Interview Analysis')}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {type === 'mock' 
              ? `Comprehensive analysis of a ${report.difficulty} difficulty simulation for the ${report.role} position.`
              : `AI-driven profile optimization and interview readiness strategy for ${report.title}.`}
          </p>
        </motion.div>

        {/* Global Score Gauge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 glass-surface border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8"
          >
            <div className="relative w-40 h-40 shrink-0">
               <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="72" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/5" />
                <circle cx="80" cy="80" r="72" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray={452.4} strokeDashoffset={452.4 - (452.4 * score) / 100} className="text-[#5de6ff] drop-shadow-[0_0_12px_rgba(93,230,255,0.4)] transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-space font-bold text-white">{score}%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Readiness</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-space font-bold text-white mb-2">Overall Performance</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                This score represents the candidate's alignment with target industry standard benchmarks and neural behavioral patterns observed during the session.
              </p>
              <div className="flex gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-[#5de6ff]" />
                  <span className="text-xs font-bold text-white">{score > 80 ? 'Elite' : score > 60 ? 'Standard' : 'Novice'} Grade</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-surface border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center"
          >
            <Smile size={48} className="text-[#c0c1ff] mb-4" />
            <h4 className="text-white font-space font-bold mb-1">Behavioral Confidence</h4>
            <p className="text-slate-400 text-xs">Candidate maintained optimal eye-contact and neural stability throughout.</p>
          </motion.div>
        </div>

        {/* Content Tabs / Sections */}
        <div className="space-y-8">
           {/* Summary Section */}
           <motion.section 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-surface border border-white/10 rounded-3xl p-8"
           >
              <h2 className="text-xl font-space font-bold text-white mb-6 flex items-center gap-3">
                <Activity size={20} className="text-[#5de6ff]" />
                Key Insights
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {type === 'analysis' ? (
                   report.skillGaps?.map((gap, i) => (
                     <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                        <span className="text-slate-300 font-medium">{gap.skill}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          gap.severity === 'high' ? 'text-rose-400 border-rose-400/20 bg-rose-400/5' :
                          gap.severity === 'medium' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' :
                          'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
                        }`}>
                          {gap.severity}
                        </span>
                     </div>
                   ))
                 ) : (
                   report.finalReport?.strengths?.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-[#5de6ff]/5 border border-[#5de6ff]/10">
                       <Zap size={14} className="text-[#5de6ff]" />
                       <span className="text-slate-300 text-sm font-medium">{s}</span>
                    </div>
                   ))
                 )}
              </div>
           </motion.section>

           {/* Transcript / Questions Preview */}
           <motion.section 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-surface border border-white/10 rounded-3xl p-8"
           >
              <h2 className="text-xl font-space font-bold text-white mb-6 flex items-center gap-3">
                <FileText size={20} className="text-[#c0c1ff]" />
                Interview Preview
              </h2>
              <div className="space-y-4">
                 {(type === 'analysis' ? report.technicalQuestions : report.qaHistory)?.slice(0, 3).map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-sm">
                       <p className="text-white font-medium mb-1 line-clamp-2">{item.question}</p>
                       <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                          <ChevronRight size={12} />
                          Review Full Report for Details
                       </div>
                    </div>
                 ))}
              </div>
           </motion.section>
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="glass-surface border border-white/10 rounded-3xl p-12 overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap size={150} />
             </div>
             <h3 className="text-3xl font-space font-bold text-white mb-4">Master Your Next Interview</h3>
             <p className="text-slate-400 mb-8 max-w-sm mx-auto text-sm">Join HireStack AI to experience the world's most advanced behavioral interview simulator.</p>
             <button 
              onClick={() => window.location.href = '/register'}
              className="px-10 py-4 rounded-xl ai-gradient-bg text-[#0c0c1d] font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_30px_rgba(93,230,255,0.4)] transition-all"
             >
                Try HireStack Free
             </button>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-12 text-center">
        <p className="text-slate-500 text-xs font-medium">
          Generated via HireStack.ai Neural Platform &bull; © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default PublicReportView;
