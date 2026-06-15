import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Briefcase, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const PostProject = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web & Mobile Dev');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [skillsText, setSkillsText] = useState('');
  
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const skillsArray = skillsText.split(',').map(s => s.trim()).filter(Boolean);
      await api.post('/projects', {
        title,
        description,
        category,
        budget: Number(budget),
        deadline: new Date(deadline),
        skillsRequired: skillsArray,
        status: 'published'
      });
      
      setSuccessMsg('Project posted successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to publish project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      <div className="glass p-8 rounded-3xl border border-slate-200 dark:border-darkBorder shadow-xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-500 text-white rounded-2xl shadow-lg">
            <Briefcase size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Post a New Gig</h1>
            <p className="text-xs text-slate-400 mt-0.5">Describe your requirements and hire university talent.</p>
          </div>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Project Title</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Build an E-commerce landing page using React"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Project Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
              >
                {categoriesList.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Budget ($ USD)</label>
              <input 
                type="number" 
                required
                placeholder="e.g. 500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Project Deadline</label>
              <input 
                type="date" 
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Required Skills (Comma-separated)</label>
              <input 
                type="text" 
                required
                placeholder="e.g. React, Tailwind, JavaScript"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">Project Scope & Description</label>
            <textarea 
              rows={6}
              required
              placeholder="Outline what needs to be delivered, milestones, and design assets needed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200 font-sans resize-none"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-darkBorder/40">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 border border-slate-200 dark:border-darkBorder rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-darkBorder/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
export default PostProject;
