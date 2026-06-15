import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, AlertCircle, ArrowRight, User, GraduationCap } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' or 'client'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-200 transition-colors duration-300 flex items-center justify-center p-4">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-bg-glow pointer-events-none opacity-60 dark:opacity-100 animate-glow"></div>

      <div className="w-full max-w-lg glass p-8 rounded-3xl border border-slate-200 dark:border-darkBorder shadow-2xl relative z-10 space-y-6">
        
        {/* Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-primary-500 text-white rounded-2xl shadow-lg w-fit">
            <Briefcase size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">
            Join GradGigs Today
          </h2>
          <p className="text-xs text-slate-400">Collaborate with companies on technical milestones.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector cards */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`p-4 border rounded-2xl text-left flex flex-col justify-between transition-all duration-200 ${role === 'student' ? 'border-primary-500 bg-indigo-500/5 ring-1 ring-primary-500' : 'border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50'}`}
            >
              <div className={`p-2 rounded-xl w-fit ${role === 'student' ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-darkBorder/80 text-slate-500'}`}>
                <GraduationCap size={18} />
              </div>
              <div className="mt-4">
                <span className="block font-bold text-xs text-slate-800 dark:text-slate-200">As Student</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Showcase portfolios and place project bids.</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('client')}
              className={`p-4 border rounded-2xl text-left flex flex-col justify-between transition-all duration-200 ${role === 'client' ? 'border-primary-500 bg-indigo-500/5 ring-1 ring-primary-500' : 'border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkCard/50'}`}
            >
              <div className={`p-2 rounded-xl w-fit ${role === 'client' ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-darkBorder/80 text-slate-500'}`}>
                <User size={18} />
              </div>
              <div className="mt-4">
                <span className="block font-bold text-xs text-slate-800 dark:text-slate-200">As Recruiter</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Publish listings and contract student workers.</span>
              </div>
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg focus:ring-1 focus:ring-primary-500 outline-none text-slate-700 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="e.g. alex@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg focus:ring-1 focus:ring-primary-500 outline-none text-slate-700 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              required
              placeholder="Minimum 6 characters"
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
            {loading ? 'Creating Account...' : 'Get Started'} <ArrowRight size={14} />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-darkBorder/40">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-semibold">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
export default Register;
