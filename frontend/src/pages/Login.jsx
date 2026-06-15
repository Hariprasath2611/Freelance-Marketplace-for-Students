import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, AlertCircle, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-200 transition-colors duration-300 flex items-center justify-center p-4">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-bg-glow pointer-events-none opacity-60 dark:opacity-100 animate-glow"></div>

      <div className="w-full max-w-md glass p-8 rounded-3xl border border-slate-200 dark:border-darkBorder shadow-2xl relative z-10 space-y-6">
        
        {/* Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-primary-500 text-white rounded-2xl shadow-lg w-fit">
            <Briefcase size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">
            Welcome back to GradGigs
          </h2>
          <p className="text-xs text-slate-400">Sign in to manage portfolios, bids, and workspace tasks.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="e.g. name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg focus:ring-1 focus:ring-primary-500 outline-none text-slate-700 dark:text-slate-200"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <a href="#" className="text-[10px] text-primary-500 hover:text-primary-600 font-semibold">Forgot password?</a>
            </div>
            <input 
              type="password" 
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg focus:ring-1 focus:ring-primary-500 outline-none text-slate-700 dark:text-slate-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-bold text-xs text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={14} />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-darkBorder/40">
          <p className="text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-600 font-semibold">
              Create an Account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
export default Login;
