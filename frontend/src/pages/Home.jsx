import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Sparkles, Award, GraduationCap } from 'lucide-react';

export const Home = () => {
  const { user } = useAuth();

  const categories = [
    { name: 'Web & Mobile Dev', jobs: '240+ jobs', icon: '💻' },
    { name: 'UI/UX & Design', jobs: '180+ jobs', icon: '🎨' },
    { name: 'Content & Writing', jobs: '120+ jobs', icon: '✍️' },
    { name: 'Marketing & SEO', jobs: '95+ jobs', icon: '📈' },
    { name: 'AI & Data Analysis', jobs: '150+ jobs', icon: '🤖' },
    { name: 'Video & Media', jobs: '80+ jobs', icon: '🎥' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-bg-glow pointer-events-none opacity-60 dark:opacity-100 animate-glow"></div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-500 border border-primary-200 dark:border-primary-800/30 mb-6 glow-primary">
          <Sparkles size={12} />
          <span>Powered by Gemini AI matching engine</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
          Unlock High-Quality <br />
          <span className="bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">Student Freelancers</span> for Your Projects
        </h1>
        
        <p className="mt-6 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          GradGigs connects students from top universities with businesses looking for fresh, skilled, and cost-effective talent. Build portfolios, manage milestones, and collaborate in real-time.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {user ? (
            <Link 
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Go to Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link 
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Hire Student Talent <ArrowRight size={18} />
              </Link>
              <Link 
                to="/projects"
                className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-darkCard hover:bg-slate-100 dark:hover:bg-darkBorder/40 border border-slate-200 dark:border-darkBorder rounded-xl shadow-sm transition-all duration-200"
              >
                Browse Gigs
              </Link>
            </>
          )}
        </div>

        {/* Stats strip */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto p-6 glass rounded-3xl glow-primary">
          <div className="text-center">
            <span className="block text-3xl font-bold bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">10K+</span>
            <span className="text-xs text-slate-400 font-medium uppercase mt-1">Student Profiles</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">15K+</span>
            <span className="text-xs text-slate-400 font-medium uppercase mt-1">Completed Gigs</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">$2M+</span>
            <span className="text-xs text-slate-400 font-medium uppercase mt-1">Earned by Students</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">4.8★</span>
            <span className="text-xs text-slate-400 font-medium uppercase mt-1">Recruiter Rating</span>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="bg-slate-100/50 dark:bg-darkCard/25 py-20 border-y border-slate-200 dark:border-darkBorder/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold">Why Hire Student Freelancers?</h2>
            <p className="text-slate-400 mt-3 text-sm">Graduates and undergraduates bring fresh perspectives, modern methodologies, and unmatchable drive.</p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder/50 rounded-2xl">
              <div className="p-3 bg-indigo-500/10 text-primary-500 rounded-xl w-fit mb-4">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-lg font-bold">Verified Academic Status</h3>
              <p className="text-slate-400 mt-2 text-sm">Every student profile is verified using institutional emails to guarantee authentic academic enrollment.</p>
            </div>
            
            <div className="p-6 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder/50 rounded-2xl">
              <div className="p-3 bg-indigo-500/10 text-primary-500 rounded-xl w-fit mb-4">
                <Sparkles size={24} />
              </div>
              <h3 className="text-lg font-bold">AI Portfolio Validation</h3>
              <p className="text-slate-400 mt-2 text-sm">Our Gemini services score student portfolios based on code depth and live links to help you select high-quality profiles.</p>
            </div>
            
            <div className="p-6 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder/50 rounded-2xl">
              <div className="p-3 bg-indigo-500/10 text-primary-500 rounded-xl w-fit mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold">Milestone Workspaces</h3>
              <p className="text-slate-400 mt-2 text-sm">Release payments only when completed milestones are delivered, audited, and approved.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category selection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold">Explore Categories</h2>
            <p className="text-slate-400 mt-2 text-sm">Browse jobs by popular professional fields</p>
          </div>
          <Link to="/projects" className="text-xs text-primary-500 hover:text-primary-600 font-semibold flex items-center gap-1">
            Browse all jobs <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {categories.map((c, i) => (
            <Link 
              key={i} 
              to={`/projects?category=${encodeURIComponent(c.name)}`}
              className="p-5 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder hover:border-primary-500 dark:hover:border-primary-500 rounded-2xl text-center transition-all duration-300 hover:-translate-y-1"
            >
              <span className="text-3xl block mb-3">{c.icon}</span>
              <h3 className="text-sm font-bold truncate">{c.name}</h3>
              <span className="text-xs text-slate-400 block mt-1">{c.jobs}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
export default Home;
