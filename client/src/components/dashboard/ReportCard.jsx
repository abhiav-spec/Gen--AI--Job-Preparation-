import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, ChevronRight, Share2, Activity, Mic, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { downloadInterviewReport } from '../../api/interview.api';
import { downloadMockInterviewReport } from '../../api/mockInterview.api';
import SharePDF from '../ui/SharePDF';

const ReportCard = ({ role, score, date, reportId, index, type = 'report' }) => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const isEven = index % 2 === 0;

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (type === 'mock') return;
    setDownloading(true);
    try {
      const res = await downloadInterviewReport(reportId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `generated_resume_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleReview = () => {
    if (type === 'mock') {
      navigate(`/dashboard/mock-interview/${reportId}/report`);
    } else {
      navigate(`/dashboard/report/${reportId}`);
    }
  };
  
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
      className="group flex flex-col md:flex-row items-center justify-between p-6 rounded-[2rem] glass-surface-low border border-white/5 hover:border-secondary/20 hover:bg-white/5 transition-all hover:-translate-y-1 mb-4"
    >
      {/* Left section: Role & Details */}
      <div className="flex items-center gap-6 w-full md:w-1/2 mb-4 md:mb-0">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/2 border border-white/5 group-hover:border-secondary/30 group-hover:bg-secondary/10 transition-all duration-300">
          {type === 'mock' ? (
            <Bot className="text-secondary" size={24} />
          ) : (
            <Activity className="text-primary-light" size={24} />
          )}
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h3 className="font-space text-lg font-bold text-white tracking-tight leading-tight group-hover:text-secondary transition-colors">
              {role}
            </h3>
            <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-md border ${
              type === 'mock' 
                ? 'text-secondary border-secondary/20 bg-secondary/5' 
                : 'text-primary-light border-primary-light/20 bg-primary-light/5'
            }`}>
              {type === 'mock' ? 'MOCK SESSION' : 'ANALYSIS'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
            Completed on <span className="text-slate-400">{date}</span>
          </p>
        </div>
      </div>

      {/* Middle section: Score Progress */}
      <div className="w-full md:w-1/4 flex flex-col items-center md:items-start px-8 mb-6 md:mb-0 border-l border-white/5">
        <div className="flex justify-between w-full mb-2">
          <span className="font-space text-[10px] uppercase font-bold text-slate-500 tracking-widest">Readiness</span>
          <span className="font-space font-bold text-white group-hover:text-secondary transition-colors">{score}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900/60 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 + index * 0.1 }}
            className="h-full premium-gradient-bg shadow-[0_0_10px_rgba(124,58,237,0.4)] rounded-full"
          />
        </div>
      </div>
      
      {/* Right section: Action Buttons */}
      <div className="w-full md:w-auto flex items-center justify-end gap-3">
        {type === 'report' && (
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/2 border border-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-50"
            title="Download Report"
          >
            {downloading ? <Activity size={18} className="animate-spin" /> : <Download size={18} />}
          </button>
        )}
        <SharePDF 
          isIconOnly={true}
          title={type === 'mock' ? `Mock Interview: ${role}` : `Interview Report: ${role}`}
          text={type === 'mock' 
            ? `I just scored ${score}% in a mock interview for ${role}! Check out my detailed feedback at HireStack AI.`
            : `I've optimized my professional profile for the ${role} position using HireStack AI. See the full analysis here.`
          }
          url={type === 'mock' 
            ? `${window.location.origin}/public/report/${reportId}?type=mock`
            : `${window.location.origin}/public/report/${reportId}?type=analysis`
          }
          downloadAction={type === 'mock' 
            ? () => downloadMockInterviewReport(reportId) 
            : () => downloadInterviewReport(reportId)
          }
        />
        <button 
          onClick={handleReview}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-space font-bold uppercase tracking-widest text-[10px] transition-all group/btn"
        >
          View Full Log
          <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default ReportCard;
