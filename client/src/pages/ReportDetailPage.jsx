import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Download, Share2, Activity } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import ReportResultsView from '../components/dashboard/ReportResultsView';
import { getInterviewReportDetails, downloadInterviewReport } from '../api/interview.api';
import Loader from '../components/ui/Loader';

const ReportDetailPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await getInterviewReportDetails(reportId);
        if (res.data.success) {
          setReport(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch report details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [reportId]);

  const handleDownload = async () => {
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

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen text-white flex overflow-hidden font-inter relative z-10">
      {/* Background is handled globally by ThreeBackground in App.jsx */}
      <div className="w-75 h-full relative hidden xl:block z-50"><Sidebar /></div>

      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative scroll-smooth px-6 xl:px-8 pb-12 z-10 custom-scrollbar">
        <div className="max-w-300 mx-auto w-full pt-12">
          
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/dashboard')}
              className="group flex items-center gap-2 text-[#94a3b8] hover:text-secondary transition-colors font-space text-[10px] uppercase font-bold tracking-widest"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>

            <div className="flex gap-3">
              <button className="p-3 rounded-xl glass-surface border border-surface-container-high text-[#94a3b8] hover:text-white transition-all">
                <Share2 size={18} />
              </button>
              <button 
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl ai-gradient-bg text-surface-lowest font-space font-bold uppercase tracking-widest text-[10px] hover:shadow-[0_0_20px_rgba(93,230,255,0.4)] transition-all disabled:opacity-50"
              >
                {downloading ? <Activity className="animate-spin" size={14} /> : <Download size={14} />}
                {downloading ? 'Preparing...' : 'Download Resume'}
              </button>
            </div>
          </div>

          {!report ? (
            <div className="flex flex-col items-center justify-center py-20">
              <h2 className="text-2xl font-space font-bold text-white mb-2">Report Not Found</h2>
              <p className="text-[#94a3b8]">The requested simulation report could not be retrieved.</p>
            </div>
          ) : (
            <ReportResultsView report={report} onDownloadResume={handleDownload} />
          )}

          <div className="h-16" />
        </div>
      </main>
    </div>
  );
};

export default ReportDetailPage;
