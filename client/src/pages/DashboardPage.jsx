import React from 'react';
import { motion } from 'framer-motion';
import { Target, Layers, FileJson, Calendar } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatsCard from '../components/dashboard/StatsCard';
import InterviewStartCard from '../components/dashboard/InterviewStartCard';
import ReportCard from '../components/dashboard/ReportCard';
import AIStatusPanel from '../components/dashboard/AIStatusPanel';

const DashboardPage = () => {
  const statsData = [
    { title: 'Interview Score', value: 'A+', icon: <Target size={24} />, delay: 0.1 },
    { title: 'Total Reports', value: '14', icon: <Layers size={24} />, delay: 0.2 },
    { title: 'Resume Status', value: 'V.4', icon: <FileJson size={24} />, delay: 0.3 },
    { title: 'Last Session', value: '4.2h', icon: <Calendar size={24} />, delay: 0.4 }
  ];

  const reportData = [
    { role: 'Senior Solutions Architect', score: 92, resume: 'arch_v4_final.pdf', date: 'Oct 14, 2026' },
    { role: 'UX Design Lead', score: 78, resume: 'ux_portfolio_v2.pdf', date: 'Oct 11, 2026' },
    { role: 'Data Science Specialist', score: 96, resume: 'ds_resume_alpha.pdf', date: 'Oct 05, 2026' },
    { role: 'Mobile App Developer', score: 87, resume: 'ios_dev_resume.pdf', date: 'Sep 29, 2026' }
  ];

  return (
    <div className="min-h-screen bg-[#121223] text-white flex overflow-hidden font-inter relative">
      {/* Global Background Particles / Noise - Minimalist */}
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')]"></div>

      {/* Main Container */}
      <div className="flex w-full h-screen overflow-hidden">
        
        {/* Left Sidebar Fixed Width Container */}
        <div className="w-[300px] h-full relative hidden xl:block z-50">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative scroll-smooth px-6 xl:px-8 pb-12 z-10 custom-scrollbar">
          
          <div className="max-w-[1200px] mx-auto w-full">
            <DashboardHeader />

            {/* Asymmetric Header Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-16">
              {/* Left Large Card - 7 Columns */}
              <div className="lg:col-span-7 h-full">
                <InterviewStartCard />
              </div>

              {/* Right Stacked Cards - 5 Columns */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-4 auto-rows-fr">
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
              <div className="flex items-end justify-between mb-8">
                <div>
                  <span className="font-space text-[10px] uppercase font-bold text-[#5de6ff] tracking-[0.2em] mb-2 block animate-pulse">
                    The Archive
                  </span>
                  <h2 className="font-space text-3xl font-bold tracking-tight text-white mb-2">
                    Report History
                  </h2>
                  <p className="font-inter text-[#94a3b8] text-sm max-w-xl">
                    Review past performance metrics, AI transcriptions, and behavioral growth patterns from your previous neural simulations.
                  </p>
                </div>

                <div className="hidden md:flex gap-4">
                   <div className="glass-surface-low rounded-[1.2rem] px-5 py-3 border border-[rgba(255,255,255,0.05)]">
                      <span className="text-[#94a3b8] text-xs uppercase tracking-wider font-semibold mr-3">Simulations</span>
                      <span className="font-space font-bold text-xl text-white">42</span>
                   </div>
                   <div className="glass-surface-low rounded-[1.2rem] px-5 py-3 border border-[rgba(255,255,255,0.05)]">
                      <span className="text-[#c0c1ff] text-xs uppercase tracking-wider font-semibold mr-3">Avg Score</span>
                      <span className="font-space font-bold text-xl text-[#5de6ff] ai-glow-text">88%</span>
                   </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 relative">
                {/* Decorative Timeline Line */}
                <div className="absolute left-8 top-10 bottom-10 w-[2px] bg-[rgba(255,255,255,0.02)] hidden md:block" />
                
                {reportData.map((report, idx) => (
                  <div key={idx} className="relative">
                    <ReportCard 
                      {...report} 
                      index={idx} 
                    />
                  </div>
                ))}
              </div>
            </motion.section>
            
            {/* Footer space */}
            <div className="h-24 w-full" />
          </div>
        </main>

        {/* Right AI Status Panel Fixed Width */}
        <div className="w-[340px] h-full hidden 2xl:block z-50 mr-6">
          <AIStatusPanel />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
