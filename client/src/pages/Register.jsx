import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthCard from '../components/ui/AuthCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { registerUser } from '../api/auth.api';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser(formData);
      // Store email in sessionStorage to pass it on to the verify page
      sessionStorage.setItem('pending_verification_email', formData.email);
      navigate('/verify-email');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <AuthCard 
        title="Create Account" 
        subtitle="Join our community of innovators"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Username"
              type="text"
              id="username"
              placeholder="johndoe"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            
            <Input
              label="Email address"
              type="email"
              id="email"
              placeholder="name@example.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Password"
              type="password"
              id="password"
              placeholder="Min. 8 characters"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="pt-2">
            <Button type="submit" loading={loading}>
              Create Account
            </Button>
          </div>

          <p className="text-center text-sm text-slate-400 pt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  );
};

export default Register;
