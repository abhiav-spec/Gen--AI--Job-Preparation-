import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Layers, FileJson, Calendar, Mic, Sparkles } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatsCard from '../components/dashboard/StatsCard';
import InterviewStartCard from '../components/dashboard/InterviewStartCard';
import ReportCard from '../components/dashboard/ReportCard';
import { useAuth } from '../context/AuthContext';
import { getInterviewReports } from '../api/interview.api';
import { getAllMockSessions } from '../api/mockInterview.api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [mockSessions, setMockSessions] = useState([]);
  const [combinedHistory, setCombinedHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        const [reportsRes, mockRes] = await Promise.all([
          getInterviewReports(user._id),
          getAllMockSessions()
        ]);

        let allReports = [];
        let allMock = [];

        if (reportsRes.data.success) {
          allReports = reportsRes.data.data.map(r => ({ ...r, type: 'report' }));
          setReports(allReports);
        }

        if (mockRes.data.success) {
          allMock = mockRes.data.data
            .filter(s => s.status === 'completed')
            .map(s => ({ 
              ...s, 
              type: 'mock', 
              title: s.role, 
              matchScore: s.finalReport?.score?.overall * 10 // scale to 100 for consistency
            }));
          setMockSessions(allMock);
        }

        const combined = [...allReports, ...allMock].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setCombinedHistory(combined);
        setFilteredHistory(combined);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredHistory(combinedHistory);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = combinedHistory.filter(h => 
        h.title?.toLowerCase().includes(query) || 
        h.role?.toLowerCase().includes(query) ||
        h.jobDescription?.toLowerCase().includes(query)
      );
      setFilteredHistory(filtered);
    }
  }, [searchQuery, combinedHistory]);

  const totalSimulations = reports.length + mockSessions.length;
  const totalScore = reports.reduce((acc, r) => acc + r.matchScore, 0) + 
                    mockSessions.reduce((acc, s) => acc + s.matchScore, 0);
  const avgScore = totalSimulations > 0 ? Math.round(totalScore / totalSimulations) : 0;

  const statsData = [
    { title: 'Interview Score', value: avgScore >= 80 ? 'A+' : avgScore >= 60 ? 'B' : avgScore > 0 ? 'C' : 'N/A', icon: <Target size={24} />, delay: 0.1 },
    { title: 'Total Simulations', value: totalSimulations.toString(), icon: <Layers size={24} />, delay: 0.2 },
    { title: 'Last Activity', value: combinedHistory.length > 0 ? new Date(combinedHistory[0].createdAt).toLocaleDateString() : 'N/A', icon: <Calendar size={24} />, delay: 0.3 }
  ];

  return (
    <div className="min-h-screen text-white flex overflow-hidden font-inter relative z-10">
      {/* Background is handled globally by ThreeBackground in App.jsx */}

      {/* Main Container */}
      <div className="flex w-full min-h-screen">
        
        {/* Sidebar — handles both xl desktop fixed sidebar + mobile drawer */}
        {/* The xl:block hidden div reserves layout space for the desktop sidebar */}
        <div className="hidden xl:block w-[280px] flex-shrink-0" aria-hidden="true" />
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-h-full relative scroll-smooth px-4 sm:px-6 xl:px-8 pb-12 z-10 overflow-x-hidden">
          
          <div className="max-w-[1200px] mx-auto w-full">
            <DashboardHeader onSearch={(q) => setSearchQuery(q)} />

            {/* Asymmetric Header Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-16">
              {/* Left Large Card - 7 Columns */}
              <div className="lg:col-span-7 h-full">
                <InterviewStartCard />
              </div>

              {/* Right Stacked Cards - 5 Columns */}
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
                {statsData.map((stat, idx) => (
                  <StatsCard 
                    key={idx}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    delay={stat.delay}
                  />
                ))}
              </div>
            </div>

            {/* Report History Section */}
            <motion.section 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
              className="mt-12"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-6">
                <div>
                  <span className="font-space text-[10px] uppercase font-bold text-[#5de6ff] tracking-[0.2em] mb-2 block animate-pulse">
                    The Archive
                  </span>
                  <h2 className="font-space text-3xl font-bold tracking-tight text-white mb-2">
                    Activity History
                  </h2>
                  <p className="font-inter text-[#94a3b8] text-sm max-w-xl">
                    Review past performance metrics and growth patterns from your neural simulations and AI analysis sessions.
                  </p>
                </div>

                 <div className="flex gap-4 w-full sm:w-auto overflow-x-auto pb-2 no-scrollbar">
                   <div className="glass-surface-low rounded-[1.2rem] px-5 py-3 border border-[rgba(255,255,255,0.05)] min-w-max">
                      <span className="text-[#94a3b8] text-xs uppercase tracking-wider font-semibold mr-3">Simulations</span>
                      <span className="font-space font-bold text-xl text-white">{totalSimulations}</span>
                   </div>
                   <div className="glass-surface-low rounded-[1.2rem] px-5 py-3 border border-[rgba(255,255,255,0.05)] min-w-max">
                      <span className="text-[#c0c1ff] text-xs uppercase tracking-wider font-semibold mr-3">Avg Score</span>
                      <span className="font-space font-bold text-xl text-[#5de6ff] ai-glow-text">{avgScore}%</span>
                   </div>
                </div>
              </div>

               <div className="flex flex-col gap-4 relative">
                <div className="absolute left-8 top-10 bottom-10 w-[2px] bg-[rgba(255,255,255,0.02)] hidden md:block" />
                
                {loading ? (
                  <div className="text-center py-20">
                    <div className="spinner mx-auto mb-4" style={{ width: 32, height: 32 }} />
                    <p className="text-[#94a3b8] text-sm">Synchronizing with neural database...</p>
                  </div>
                ) : filteredHistory.length > 0 ? (
                  filteredHistory.map((item, idx) => (
                    <div key={item._id} className="relative">
                      <ReportCard 
                        role={item.title || item.role}
                        score={item.matchScore}
                        date={new Date(item.createdAt).toLocaleDateString()}
                        reportId={item._id}
                        index={idx} 
                        type={item.type}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 glass-surface rounded-[2rem] border border-[rgba(255,255,255,0.05)]">
                    <p className="text-[#94a3b8] font-inter">
                      {searchQuery ? "No matching data found for your query." : "No activities recorded yet. Start your first session!"}
                    </p>
                  </div>
                )}
              </div>
            </motion.section>
            
            {/* Footer space */}
            <div className="h-24 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
