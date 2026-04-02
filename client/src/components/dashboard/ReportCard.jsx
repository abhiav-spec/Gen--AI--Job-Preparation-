import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, ChevronRight, Share2, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { downloadInterviewReport } from '../../api/interview.api';

const ReportCard = ({ role, score, date, reportId, index }) => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const isEven = index % 2 === 0;

  const handleDownload = async (e) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      const res = await downloadInterviewReport(reportId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `interview_report_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
      className={`group flex flex-col md:flex-row items-center justify-between p-6 rounded-[2rem] transition-all hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(93,230,255,0.02)]
        ${isEven 
          ? 'glass-surface-low border border-[rgba(255,255,255,0.06)]' 
          : 'bg-transparent border border-transparent hover:glass-surface-low hover:border-[rgba(255,255,255,0.05)]'}
      `}
    >
      {/* Left section: Role & Details */}
      <div className="flex items-center gap-6 w-full md:w-1/2 mb-4 md:mb-0">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[rgba(192,193,255,0.05)] border border-[rgba(192,193,255,0.15)] group-hover:bg-[rgba(93,230,255,0.1)] transition-colors">
          <FileText className="text-[#c0c1ff] group-hover:text-[#5de6ff] group-hover:drop-shadow-[0_0_8px_rgba(93,230,255,0.5)] transition-all" size={24} />
        </div>
        
        <div className="flex flex-col gap-1">
          <h3 className="font-space text-lg font-bold text-white tracking-tight leading-tight">
            {role}
          </h3>
          <div className="flex items-center gap-3 text-sm text-[#94a3b8] font-inter">
            <span>{date}</span>
          </div>
        </div>
      </div>

      
      {/* Middle section: Score Progress */}
      <div className="w-full md:w-1/4 flex flex-col items-center md:items-start px-4 mb-6 md:mb-0">
        <div className="flex justify-between w-full mb-2">
          <span className="font-space text-[10px] uppercase font-bold text-[#c0c1ff] tracking-widest">Readiness</span>
          <span className="font-space font-bold text-[#5de6ff] drop-shadow-[0_0_10px_rgba(93,230,255,0.3)]">{score}%</span>
        </div>
        {/* Progress bar line style */}
        <div className="w-full h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 + index * 0.1 }}
            className="h-full ai-gradient-bg shadow-[0_0_10px_rgba(93,230,255,0.5)] rounded-full"
          />
        </div>
      </div>
      
      {/* Right section: Action Buttons */}
      <div className="w-full md:w-auto flex items-center justify-end gap-3">
        {/* Secondary Glass Button */}
        <button 
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center justify-center p-3 rounded-xl glass-surface-low border border-[rgba(255,255,255,0.1)] text-[#94a3b8] hover:text-[#5de6ff] hover:border-[rgba(93,230,255,0.3)] transition-all disabled:opacity-50"
        >
          {downloading ? <Activity size={18} className="animate-spin" /> : <Download size={18} />}
        </button>
        <button className="flex items-center justify-center p-3 rounded-xl glass-surface-low border border-[rgba(255,255,255,0.1)] text-[#94a3b8] hover:text-white hover:border-[rgba(255,255,255,0.3)] transition-all">
          <Share2 size={18} />
        </button>
        {/* Primary/Tertiary mix button */}
        <button 
          onClick={() => navigate(`/dashboard/report/${reportId}`)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[rgba(192,193,255,0.08)] border border-[rgba(192,193,255,0.2)] text-[#c0c1ff] font-inter font-semibold text-sm hover:bg-[rgba(192,193,255,0.15)] hover:text-white hover:border-[rgba(192,193,255,0.4)] transition-all group/btn"
        >
          Review Report
          <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default ReportCard;
