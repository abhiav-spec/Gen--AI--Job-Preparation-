import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050817]">
      <div className="relative flex flex-col items-center">
        <div className="w-20 h-20 relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
          />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 text-indigo-400 font-bold uppercase tracking-widest text-xs"
        >
          Secure Auth
        </motion.p>
      </div>
    </div>
  );
};

export default Loader;
