import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthCard from '../components/ui/AuthCard';
import Button from '../components/ui/Button';
import { verifyEmail, resendOtp, setAccessToken } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { setUser } = useAuth();
  
  const email = sessionStorage.getItem('pending_verification_email');
  const devOtp = sessionStorage.getItem('dev_otp'); // fallback when email fails

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // take only last character if multiple chars were entered
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // backspace to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data } = await verifyEmail({ email, otp: otpValue });
      setSuccess('Verification successful! Logging you in...');
      
      // Set user and access token from the verify response
      if (data.user) setUser(data.user);
      // accessToken comes on data.user.accessToken if the backend sends it,
      // or just navigate — AuthContext will refresh on next load
      if (data.accessToken) setAccessToken(data.accessToken);

      setTimeout(() => {
        sessionStorage.removeItem('pending_verification_email');
        sessionStorage.removeItem('dev_otp');
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await resendOtp({ email });
      setSuccess('OTP resent successfully to your email.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="page-wrapper">
      <AuthCard 
        title="Verify Account" 
        subtitle={`Please enter the code sent to ${email}`}
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {(error || success) && (
            <div className={error ? 'alert-error' : 'alert-success'}>
              {error || success}
            </div>
          )}

          {/* Dev fallback: show OTP if email couldn't be sent */}
          {devOtp && (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-center">
              <p className="text-[10px] font-space uppercase tracking-widest text-yellow-400 font-bold mb-1">📧 Email not sent — Dev OTP</p>
              <p className="text-2xl font-space font-bold tracking-[0.3em] text-white">{devOtp}</p>
              <p className="text-[10px] text-yellow-400/70 mt-1">Configure Gmail OAuth to send real emails</p>
            </div>
          )}

          <div className="flex justify-between gap-2 sm:gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`otp-input ${digit ? 'filled' : ''} flex-1`}
              />
            ))}
          </div>

          <div className="space-y-4">
            <Button type="submit" loading={loading}>
              Verify Email
            </Button>
            
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full text-center text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors disabled:opacity-50"
            >
              {resending ? 'Resending...' : "Didn't receive code? Resend"}
            </button>
          </div>
        </form>
      </AuthCard>
    </div>
  );
};

export default VerifyEmail;
