import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Sparkles, CheckCircle2, AlertCircle, Plus, Trash2, 
  Upload, Github, Globe, FileText, ChevronRight 
} from 'lucide-react';

export const PortfolioBuilder = () => {
  const { user, refreshUser } = useAuth();
  
  const [portfolios, setPortfolios] = useState([]);
  const [scoreData, setScoreData] = useState({ score: 0, recommendations: [] });
  const [loading, setLoading] = useState(true);

  // Profile forms
  const [bio, setBio] = useState(user?.bio || '');
  const [skillsText, setSkillsText] = useState(user?.skills?.join(', ') || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // New portfolio item form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTechs, setNewTechs] = useState('');
  const [newGithub, setNewGithub] = useState('');
  const [newLive, setNewLive] = useState('');
  const [addingPortfolio, setAddingPortfolio] = useState(false);

  // Resume uploading
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);

  // Feedback messages
  const [profileMsg, setProfileMsg] = useState('');
  const [portfolioMsg, setPortfolioMsg] = useState('');
  const [resumeMsg, setResumeMsg] = useState('');

  const loadData = async () => {
    try {
      const res = await api.get('/users/profile');
      setPortfolios(res.data.portfolios || []);
      
      const scoreRes = await api.get('/users/portfolio-score');
      setScoreData(scoreRes.data);
    } catch (error) {
      console.error('Error loading portfolio metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMsg('');
    try {
      const skillsArray = skillsText.split(',').map(s => s.trim()).filter(Boolean);
      await api.put('/users/profile', {
        bio,
        skills: skillsArray
      });
      setProfileMsg('Profile updated successfully!');
      await refreshUser();
      await loadData(); // recalculate score
    } catch (error) {
      setProfileMsg('Failed to update profile info.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    setAddingPortfolio(true);
    setPortfolioMsg('');
    try {
      const techArray = newTechs.split(',').map(t => t.trim()).filter(Boolean);
      await api.post('/users/portfolio', {
        title: newTitle,
        description: newDesc,
        technologies: techArray,
        githubLink: newGithub,
        liveLink: newLive
      });
      setPortfolioMsg('Portfolio item added successfully!');
      setNewTitle('');
      setNewDesc('');
      setNewTechs('');
      setNewGithub('');
      setNewLive('');
      await loadData();
    } catch (error) {
      setPortfolioMsg('Failed to add portfolio item.');
    } finally {
      setAddingPortfolio(false);
    }
  };

  const handleDeletePortfolio = async (id) => {
    if (!window.confirm('Are you sure you want to remove this project?')) return;
    try {
      await api.delete(`/users/portfolio/${id}`);
      await loadData();
    } catch (error) {
      console.error('Delete portfolio item failed:', error);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    setUploadingResume(true);
    setResumeMsg('');
    setResumeAnalysis(null);

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const res = await api.post('/users/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResumeMsg('Resume parsed and analyzed successfully!');
      setResumeAnalysis(res.data.analysis);
      await refreshUser();
      await loadData();
    } catch (error) {
      setResumeMsg(error.response?.data?.message || 'Resume upload failed.');
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
        Loading portfolio builder...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300 space-y-10 animate-glow">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent w-fit">
          Portfolio & Profile Builder
        </h1>
        <p className="text-slate-400 mt-2 text-sm">Build your digital portfolio resume, tags, and get AI quality feedback.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Details (Left / 2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio & Skills Form */}
          <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Bio & Skill Matrix</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {profileMsg && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-primary-500 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  <span>{profileMsg}</span>
                </div>
              )}
              
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Your Bio / Professional Tagline</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Computer Science sophomore specializing in front-end react apps."
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200 font-sans resize-none"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="e.g. React, Node.js, JavaScript, Tailwind, CSS"
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
              >
                {updatingProfile ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Uploaded portfolio projects listing */}
          <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Your Portfolio Projects</h2>
            
            {portfolios.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">You have not uploaded any project portfolios yet. Fill in the form on the right to add some!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolios.map(item => (
                  <div key={item._id} className="p-4 bg-slate-50/50 dark:bg-darkCard/40 border border-slate-100 dark:border-darkBorder/40 rounded-xl relative flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.title}</h3>
                      <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-1">
                        {item.technologies.map((tech, idx) => (
                          <span key={idx} className="text-[9px] bg-slate-200/50 dark:bg-darkBorder/50 text-slate-500 px-2 py-0.5 rounded-md">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-darkBorder/20 flex items-center justify-between">
                      <div className="flex gap-2">
                        {item.githubLink && (
                          <a href={item.githubLink} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                            <Github size={14} />
                          </a>
                        )}
                        {item.liveLink && (
                          <a href={item.liveLink} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary-500">
                            <Globe size={14} />
                          </a>
                        )}
                      </div>
                      <button 
                        onClick={() => handleDeletePortfolio(item._id)}
                        className="text-slate-400 hover:text-rose-500"
                        title="Remove project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scoring & Form Sidebars */}
        <div className="space-y-8">
          {/* AI Score Card */}
          <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm glow-primary">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-white font-bold mb-4">
              <Sparkles size={16} className="text-primary-500 animate-bounce" />
              <span className="text-sm">AI Portfolio Quality Score</span>
            </div>

            <div className="flex justify-center items-center py-4">
              <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-4 border-slate-100 dark:border-darkBorder">
                <span className="text-3xl font-extrabold text-primary-500">{scoreData.score}%</span>
                {/* Circular glowing visual */}
                <div className="absolute inset-0 rounded-full border-4 border-primary-500 opacity-20 animate-ping"></div>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Action Recommendations</h3>
              {scoreData.recommendations?.length === 0 ? (
                <div className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Your portfolio has achieved 100% completeness rating!
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {scoreData.recommendations?.map((rec, i) => (
                    <li key={i} className="text-[10px] text-slate-400 flex items-start gap-1">
                      <ChevronRight size={10} className="mt-0.5 text-primary-500 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Add Portfolio form */}
          <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Add Portfolio Project</h2>
            <form onSubmit={handleAddPortfolio} className="space-y-3">
              {portfolioMsg && (
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-primary-500 text-[10px] rounded-lg">
                  {portfolioMsg}
                </div>
              )}
              
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chat App UI"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-darkBorder rounded-lg bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="What was this project and what problem did it resolve?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-darkBorder rounded-lg bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200 font-sans resize-none"
                ></textarea>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Technologies (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Tailwind"
                  value={newTechs}
                  onChange={(e) => setNewTechs(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-darkBorder rounded-lg bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">GitHub Code Link</label>
                <input
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={newGithub}
                  onChange={(e) => setNewGithub(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-darkBorder rounded-lg bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Live Demo Link</label>
                <input
                  type="url"
                  placeholder="https://project.vercel.app"
                  value={newLive}
                  onChange={(e) => setNewLive(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-darkBorder rounded-lg bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={addingPortfolio}
                className="w-full py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
              >
                {addingPortfolio ? 'Adding...' : 'Add Project'}
              </button>
            </form>
          </div>

          {/* AI Resume Upload / Analyzer */}
          <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm">
            <div className="flex items-center gap-1 text-slate-800 dark:text-white font-bold mb-4">
              <FileText size={16} className="text-primary-500" />
              <span className="text-sm">AI Resume Upload</span>
            </div>

            <form onSubmit={handleResumeUpload} className="space-y-3">
              {resumeMsg && (
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-primary-500 text-[10px] rounded-lg">
                  {resumeMsg}
                </div>
              )}
              
              <div className="border border-dashed border-slate-200 dark:border-darkBorder hover:border-primary-500 rounded-xl p-4 text-center cursor-pointer transition-colors relative">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.txt"
                  required
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload size={20} className="mx-auto text-slate-400 mb-2" />
                <span className="text-[10px] text-slate-400 block">
                  {resumeFile ? resumeFile.name : 'Upload PDF/Doc resume (Max 10MB)'}
                </span>
              </div>

              <button
                type="submit"
                disabled={uploadingResume}
                className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
              >
                {uploadingResume ? 'Analyzing...' : 'Upload & Analyze Resume'}
              </button>
            </form>

            {/* Display parsed result comments */}
            {resumeAnalysis && (
              <div className="mt-4 p-4 bg-slate-50 dark:bg-darkBg/60 border border-slate-100 dark:border-darkBorder/40 rounded-xl space-y-3 text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Analysis Completeness:</span>
                  <span className="font-bold text-primary-500">{resumeAnalysis.score}%</span>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Extracted Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {resumeAnalysis.extractedSkills.map((sk, i) => (
                      <span key={i} className="bg-primary-100 dark:bg-primary-900/30 text-primary-500 px-1.5 py-0.5 rounded">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">AI Improvement Tips:</span>
                  <ul className="space-y-1">
                    {resumeAnalysis.improvements.map((imp, i) => (
                      <li key={i} className="text-slate-500 dark:text-slate-400 flex items-start gap-1">
                        <span>•</span> <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default PortfolioBuilder;
