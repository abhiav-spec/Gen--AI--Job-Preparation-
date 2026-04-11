import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Mail, 
  MessageSquare, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronDown,
  Loader2
} from 'lucide-react';

/**
 * SharePDF Component
 * 
 * A reusable sharing component that supports:
 * 1. Native Web Share API (Mobile/Modern Browsers)
 * 2. WhatsApp Direct Share
 * 3. Email Share
 * 4. Copy to Clipboard
 * 
 * @param {string} title - The title of the content to share
 * @param {string} text - The descriptive text to share
 * @param {string} url - The URL (PDF or page) to share
 */
/**
 * SharePDF Component
 * 
 * @param {string} title - The title
 * @param {string} text - The descriptive text
 * @param {string} url - The URL to share
 * @param {boolean} isIconOnly - Icon only mode
 * @param {function} downloadAction - Optional async function that returns a PDF blob
 */
const SharePDF = ({ title, text, url, isIconOnly = false, downloadAction = null }) => {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // 1. Native Web Share API (Supports files)
  const handleNativeShare = async (e) => {
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        setIsSharing(true);
        const shareData = { title, text, url };

        // If a direct PDF file can be shared
        if (downloadAction && navigator.canShare && navigator.canShare({ files: [new File([], 'test.pdf', { type: 'application/pdf' })] })) {
          const res = await downloadAction();
          const blob = res.data;
          const file = new File([blob], `${title.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });
          shareData.files = [file];
        }

        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Error sharing:', err);
      } finally {
        setIsSharing(false);
      }
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  // 2. WhatsApp Share
  const shareToWhatsApp = (e) => {
    if (e) e.stopPropagation();
    const waUrl = `https://wa.me/?text=${encodeURIComponent(title + '\n' + text + '\n' + url)}`;
    window.open(waUrl, '_blank');
  };

  // 3. Email Share
  const shareViaEmail = (e) => {
    if (e) e.stopPropagation();
    const mailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\nView Report: ' + url)}`;
    window.location.href = mailUrl;
  };

  // 4. Copy Link
  const handleCopyLink = (e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { name: 'WhatsApp', icon: <MessageSquare size={16} />, action: shareToWhatsApp, color: 'hover:text-[#25D366]' },
    { name: 'Email', icon: <Mail size={16} />, action: shareViaEmail, color: 'hover:text-[#EA4335]' },
    { name: 'Copy Link', icon: copied ? <Check size={16} /> : <Copy size={16} />, action: handleCopyLink, color: 'hover:text-[#5de6ff]' },
  ];

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-2">
        {/* Universal Share Button */}
        <button
          onClick={handleNativeShare}
          disabled={isSharing}
          className={`flex items-center justify-center gap-2 rounded-xl glass-surface-low border border-white/10 text-white transition-all hover:border-[#5de6ff] hover:shadow-[0_0_15px_rgba(93,230,255,0.2)] ${
            isIconOnly ? 'p-3' : 'px-4 py-2.5 font-space font-bold uppercase tracking-widest text-[10px]'
          }`}
        >
          {isSharing ? (
            <Loader2 size={isIconOnly ? 18 : 14} className="animate-spin text-[#5de6ff]" />
          ) : (
            <Share2 size={isIconOnly ? 18 : 14} className="text-[#5de6ff]" />
          )}
          {!isIconOnly && <span>{isSharing ? 'Preparing...' : 'Share'}</span>}
          {(!navigator.share && !isIconOnly) && <ChevronDown size={12} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />}
        </button>

        {/* Individual Shortcut Buttons (Requested by user) */}
        {!navigator.share && (
          <>
            <button
              onClick={shareToWhatsApp}
              className="p-2.5 rounded-xl glass-surface border border-white/10 text-[#94a3b8] hover:text-[#25D366] hover:border-[#25D366]/30 transition-all"
              title="Share on WhatsApp"
            >
              <MessageSquare size={16} />
            </button>
            <button
              onClick={shareViaEmail}
              className="p-2.5 rounded-xl glass-surface border border-white/10 text-[#94a3b8] hover:text-[#EA4335] hover:border-[#EA4335]/30 transition-all"
              title="Share via Email"
            >
              <Mail size={16} />
            </button>
          </>
        )}
      </div>

      {/* Fallback Dropdown for Desktop browsers without Web Share API */}
      <AnimatePresence>
        {showDropdown && !navigator.share && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 5 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute left-0 mt-2 w-48 rounded-2xl glass-surface border border-white/10 shadow-2xl z-50 overflow-hidden"
          >
            <div className="py-1">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => {
                    option.action();
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-slate-300 transition-colors bg-transparent ${option.color} hover:bg-white/5`}
                >
                  <span className="shrink-0">{option.icon}</span>
                  {option.name}
                  {option.name === 'Copy Link' && copied && (
                    <span className="ml-auto text-[8px] text-[#5de6ff] uppercase font-bold">Copied!</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Toast (Internal) */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full ai-gradient-bg text-[#0c0c1d] font-space font-bold text-[10px] uppercase tracking-widest shadow-2xl z-[999]"
          >
            Successfully Copied to Clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SharePDF;
