import { motion } from 'framer-motion';
import { Zap, ChevronRight, Bot, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InterviewStartCard = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative overflow-hidden glass-surface rounded-[2.5rem] p-8 sm:p-12 flex flex-col justify-between border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.6)] group h-full min-h-[420px]"
    >
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(124,58,237,0.08)_0%,transparent_70%)] -translate-x-10 -translate-y-20 blur-3xl" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 hover:opacity-30 transition-opacity pointer-events-none" />
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik00MCAwIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTY4LCA4NSwgMjQ3LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')] opacity-40"></div>

      <div className="relative z-10 flex flex-col items-start gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest font-space">Active Session Ready</span>
        </div>
        
        <h2 className="font-space text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
          Initiate <br /> 
          <span className="premium-gradient-text drop-shadow-[0_0_15px_rgba(124,58,237,0.4)]">Recruitment</span> <br />
          Simulation
        </h2>
        
        <p className="font-inter text-slate-400 text-sm sm:text-base leading-relaxed max-w-md">
          Test your interview frameworks or generate detailed candidate performance reports using our AI-driven engine.
        </p>
      </div>

      <div className="relative z-10 mt-12 flex flex-wrap gap-4 sm:gap-6">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard/mock-interview/setup')}
          className="group relative flex items-center gap-3 px-8 py-4 premium-gradient-bg text-white rounded-2xl font-space font-bold uppercase tracking-widest text-xs shadow-[0_10px_25px_rgba(124,58,237,0.3)] hover:shadow-[0_20px_40px_rgba(124,58,237,0.5)] transition-all"
        >
          <Bot size={18} />
          Mock Interview
          <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={14} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard/report-generator')}
          className="group relative flex items-center gap-3 px-8 py-4 bg-white/2 hover:bg-white/5 border border-white/10 text-white rounded-2xl font-space font-bold uppercase tracking-widest text-xs transition-all"
        >
          <FileText size={18} />
          Generate Report
        </motion.button>
      </div>
    </motion.div>
  );
};

export default InterviewStartCard;
