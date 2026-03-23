import { motion } from 'framer-motion';

const Button = ({ children, loading, variant = 'primary', className = '', ...props }) => {
  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  
  return (
    <motion.button
      whileHover={!loading ? { scale: 1.02 } : {}}
      whileTap={!loading ? { scale: 0.98 } : {}}
      disabled={loading}
      className={`${baseClass} flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="spinner border-2" style={{ borderTopColor: 'transparent' }} />
          <span>Please wait...</span>
        </div>
      ) : (
        <span>{children}</span>
      )}
    </motion.button>
  );
};

export default Button;
