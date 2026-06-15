import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Search, DollarSign, Calendar, Sparkles, Filter, CheckCircle2, ChevronRight, X, AlertCircle } from 'lucide-react';

export const BrowseProjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sort, setSort] = useState('');

  // Bid submission modal state
  const [selectedProject, setSelectedProject] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const categoriesList = [
    'Web & Mobile Dev',
    'UI/UX & Design',
    'Content & Writing',
    'Marketing & SEO',
    'AI & Data Analysis',
    'Video & Media'
  ];

  // Parse query parameters from landing page redirects
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    if (catParam) {
      setCategory(catParam);
    }
  }, [location]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (category) queryParams.append('category', category);
      if (minBudget) queryParams.append('minBudget', minBudget);
      if (maxBudget) queryParams.append('maxBudget', maxBudget);
      if (sort) queryParams.append('sort', sort);

      const res = await api.get(`/projects?${queryParams.toString()}`);
      setProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, category, minBudget, maxBudget, sort]);

  const handleOpenBidModal = (project) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      alert('Only student freelancers can place bids!');
      return;
    }
    setSelectedProject(project);
    setBidAmount(project.budget);
    setDeliveryDays('7');
    setCoverLetter('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleGenerateAICover = async () => {
    setAiGenerating(true);
    setErrorMsg('');
    try {
      const res = await api.post('/proposals/generate-cover-letter', {
        projectId: selectedProject._id
      });
      setCoverLetter(res.data.coverLetter);
    } catch (error) {
      console.error('AI proposal gen failed:', error);
      setErrorMsg('Could not connect to Gemini API. Writing a draft cover letter instead...');
      // Fallback draft letter
      setCoverLetter(`Hi there! I am very interested in your "${selectedProject.title}" project. I have the required skills: ${selectedProject.skillsRequired.join(', ')} and would love to work with you on this. Let's connect on chat to discuss detail milestones!`);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    if (!coverLetter || !bidAmount || !deliveryDays) {
      setErrorMsg('Please fill out all fields.');
      return;
    }

    setSubmittingBid(true);
    setErrorMsg('');
    try {
      await api.post('/proposals', {
        projectId: selectedProject._id,
        coverLetter,
        bidAmount: Number(bidAmount),
        deliveryDays: Number(deliveryDays)
      });
      setSuccessMsg('Proposal submitted successfully!');
      setTimeout(() => {
        setSelectedProject(null);
        fetchProjects(); // refresh listings
      }, 1500);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to submit proposal.');
    } finally {
      setSubmittingBid(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent w-fit">
          Browse Projects & Gigs
        </h1>
        <p className="text-slate-400 mt-2 text-sm">Find remote student gigs matching your skills.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder h-fit space-y-6">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-darkBorder pb-3">
            <Filter size={16} />
            <span>Search Filters</span>
          </div>

          {/* Keywords */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Keyword Search</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search titles, skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg focus:ring-1 focus:ring-primary-500 outline-none text-slate-700 dark:text-slate-200"
              />
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
            >
              <option value="">All Categories</option>
              {categoriesList.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Budget Range */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Budget Limit ($)</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Min"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                className="w-1/2 px-3 py-2 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
              />
              <input 
                type="number" 
                placeholder="Max"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="w-1/2 px-3 py-2 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Sorting */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
            >
              <option value="">Newest Postings</option>
              <option value="budget-asc">Budget: Low to High</option>
              <option value="budget-desc">Budget: High to Low</option>
              <option value="deadline">Approaching Deadlines</option>
            </select>
          </div>
        </div>

        {/* Listings Content */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            Array(3).fill(0).map((_, idx) => (
              <div key={idx} className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder space-y-3">
                <div className="h-6 bg-slate-200 dark:bg-darkBorder/40 rounded w-1/3 shimmer"></div>
                <div className="h-4 bg-slate-200 dark:bg-darkBorder/40 rounded w-full shimmer"></div>
                <div className="h-4 bg-slate-200 dark:bg-darkBorder/40 rounded w-2/3 shimmer"></div>
              </div>
            ))
          ) : projects.length === 0 ? (
            <div className="glass p-12 rounded-2xl border border-slate-200 dark:border-darkBorder text-center">
              <p className="text-slate-400 text-sm">No active projects found matching current filter choices.</p>
            </div>
          ) : (
            projects.map((project) => (
              <div 
                key={project._id} 
                className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder hover:shadow-lg transition-all duration-300 relative group overflow-hidden"
              >
                {/* Visual hover indicator */}
                <div className="absolute left-0 top-0 h-full w-1 bg-primary-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-200"></div>

                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-primary-500 rounded-md border border-indigo-500/20 mb-2">
                      {project.category}
                    </span>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-primary-500 transition-colors">
                      {project.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                  
                  <div className="text-right sm:self-start bg-slate-50 dark:bg-darkBg/60 p-3 rounded-xl border border-slate-100 dark:border-darkBorder/50 min-w-[120px]">
                    <div className="flex items-center justify-end text-sm font-bold text-emerald-500">
                      <DollarSign size={14} />
                      <span>{project.budget}</span>
                    </div>
                    <div className="flex items-center justify-end text-[10px] text-slate-400 gap-1 mt-1">
                      <Calendar size={10} />
                      <span>{new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.skillsRequired.map((skill, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 dark:bg-darkBorder/30 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-200/50 dark:border-darkBorder/40">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Footer bar */}
                <div className="mt-6 border-t border-slate-100 dark:border-darkBorder/30 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Client:</span>
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      {project.clientId?.name || 'Recruiter'}
                    </span>
                    {project.clientId?.rating > 0 && (
                      <span className="text-[10px] font-bold text-amber-500">
                        ★ {project.clientId.rating}
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={() => handleOpenBidModal(project)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    Place Bid <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Proposal Bidding Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-glow">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-darkBorder flex justify-between items-center bg-slate-50/50 dark:bg-darkBg/50">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Place Bid on Project</h3>
                <p className="text-xs text-slate-400 mt-1 truncate max-w-[400px]">{selectedProject.title}</p>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-darkBorder rounded-full text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitBid} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Your Bid Amount ($)</label>
                  <input 
                    type="number" 
                    required
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Project Budget: ${selectedProject.budget}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Estimated Delivery (Days)</label>
                  <input 
                    type="number" 
                    required
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Work duration target</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-400">Proposal Cover Letter</label>
                  <button
                    type="button"
                    onClick={handleGenerateAICover}
                    disabled={aiGenerating}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-500 hover:text-primary-600 disabled:opacity-50"
                  >
                    <Sparkles size={12} />
                    <span>{aiGenerating ? 'Generating...' : 'Generate with Gemini AI'}</span>
                  </button>
                </div>
                <textarea 
                  rows={6}
                  required
                  placeholder="Explain why you are the perfect fit for this gig..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200 font-sans resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-darkBorder/40">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-darkBorder rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-darkBorder/20 text-slate-500 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBid}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                >
                  {submittingBid ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default BrowseProjects;
