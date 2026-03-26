import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthCard from '../components/ui/AuthCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { loginUser, setAccessToken } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await loginUser(formData);
      setUser(data.user);
      setAccessToken(data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <AuthCard 
        title="Welcome back" 
        subtitle="Please enter your details to sign in"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              id="email"
              placeholder="name@example.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              autoFocus
            />

            <div className="space-y-1">
              <div className="flex justify-between items-center px-0.5">
                <label className="text-xs font-medium text-slate-400 tracking-wide uppercase">Password</label>
                <Link to="/forgot-password" title="Coming soon!" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot?</Link>
              </div>
              <Input
                type="password"
                id="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" loading={loading}>
            Sign In
          </Button>

          <p className="text-center text-sm text-slate-400 pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
              Sign up
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  );
};

export default Login;
