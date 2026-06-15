import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  CheckCircle2, AlertCircle, DollarSign, Upload, Calendar, 
  FileText, Clock, Sparkles, Star, MessageSquare 
} from 'lucide-react';

export const Workspace = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneAmount, setMilestoneAmount] = useState('');
  
  const [delivTitle, setDelivTitle] = useState('');
  const [delivDesc, setDelivDesc] = useState('');
  const [delivLink, setDelivLink] = useState('');

  const [workspaceFile, setWorkspaceFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Review & rating states
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewed, setReviewed] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProjectDetails = async () => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.data);
    } catch (error) {
      console.error('Error loading workspace info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!milestoneTitle || !milestoneAmount) return;

    try {
      await api.post(`/projects/${projectId}/milestones`, {
        title: milestoneTitle,
        amount: Number(milestoneAmount)
      });
      setMilestoneTitle('');
      setMilestoneAmount('');
      setSuccessMsg('Milestone added successfully!');
      fetchProjectDetails();
    } catch (error) {
      setErrorMsg('Failed to add milestone.');
    }
  };

  const handleReleasePayment = async (milestoneId, amount) => {
    if (!window.confirm(`Release milestone payout of $${amount} to the student?`)) return;
    try {
      await api.post('/payments', {
        projectId,
        milestoneId,
        amount
      });
      setSuccessMsg('Payment released successfully!');
      fetchProjectDetails();
    } catch (error) {
      setErrorMsg('Payment release failed.');
    }
  };

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    if (!delivTitle) return;

    try {
      await api.post(`/projects/${projectId}/deliverables`, {
        title: delivTitle,
        description: delivDesc,
        fileUrl: delivLink
      });
      setDelivTitle('');
      setDelivDesc('');
      setDelivLink('');
      setSuccessMsg('Deliverable submitted for review!');
      fetchProjectDetails();
    } catch (error) {
      setErrorMsg('Failed to submit deliverable.');
    }
  };

  const handleReviewDeliverable = async (delivId, status) => {
    try {
      await api.put(`/projects/${projectId}/deliverables/${delivId}`, { status });
      setSuccessMsg(`Deliverable ${status} successfully.`);
      fetchProjectDetails();
    } catch (error) {
      setErrorMsg('Failed to review deliverable.');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!workspaceFile) return;

    setUploadingFile(true);
    setErrorMsg('');
    const formData = new FormData();
    formData.append('file', workspaceFile);

    try {
      await api.post(`/projects/${projectId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setWorkspaceFile(null);
      setSuccessMsg('Workspace file uploaded successfully!');
      fetchProjectDetails();
    } catch (error) {
      setErrorMsg('File upload failed.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText) return;

    try {
      const reviewedUserId = user.role === 'student' ? project.clientId._id : project.freelancerId._id;
      await api.post('/reviews', {
        reviewedUserId,
        projectId,
        rating,
        review: reviewText
      });
      setReviewed(true);
      setSuccessMsg('Thank you for submitting your feedback review!');
      fetchProjectDetails();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to submit review.');
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
        Loading project workspace...
      </div>
    );
  }

  const isClient = user.role === 'client';
  const partnerName = isClient ? project?.freelancerId?.name : project?.clientId?.name;
  const partnerId = isClient ? project?.freelancerId?._id : project?.clientId?._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300 space-y-8 animate-glow">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase bg-indigo-500/10 text-primary-500 rounded-md border border-indigo-500/20 mb-2">
            Project Workspace • {project?.status}
          </span>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{project?.title}</h1>
          <p className="text-xs text-slate-400 mt-2"> Hired partner: <span className="font-semibold text-slate-600 dark:text-slate-300">{partnerName}</span></p>
        </div>
        
        <div className="flex gap-2">
          <Link 
            to={`/messages?chatWith=${partnerId}`}
            className="px-4 py-2 bg-indigo-500/10 text-primary-500 border border-indigo-500/20 rounded-xl text-xs font-semibold hover:bg-indigo-500/20 flex items-center gap-1.5"
          >
            <MessageSquare size={14} /> Open Chat
          </Link>
          <Link 
            to="/dashboard"
            className="px-4 py-2 border border-slate-200 dark:border-darkBorder rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-darkBorder/20"
          >
            Leave Workspace
          </Link>
        </div>
      </div>

      {/* Action alerts */}
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

      {/* Grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Milestones & Deliverables */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Milestones list */}
          <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Escrow Milestones</h2>
            
            <div className="space-y-3">
              {project?.milestones.length === 0 ? (
                <p className="text-xs text-slate-400">No milestones set.</p>
              ) : (
                project.milestones.map((mil, idx) => (
                  <div key={mil._id || idx} className="p-3 bg-slate-50/50 dark:bg-darkCard/40 border border-slate-100 dark:border-darkBorder/40 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{mil.title}</h4>
                      <span className="text-[10px] text-slate-400 mt-1 block">Payout Sum: ${mil.amount}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${mil.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                        {mil.status}
                      </span>
                      {isClient && mil.status === 'pending' && (
                        <button
                          onClick={() => handleReleasePayment(mil._id, mil.amount)}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-[10px] font-semibold text-white rounded-lg shadow-sm"
                        >
                          Release Payout
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add milestone form (Client only) */}
            {isClient && project?.status !== 'completed' && (
              <form onSubmit={handleAddMilestone} className="mt-6 pt-4 border-t border-slate-100 dark:border-darkBorder/20 flex gap-3">
                <input 
                  type="text" 
                  required
                  placeholder="Milestone description..."
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-200 dark:border-darkBorder rounded-lg bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
                />
                <input 
                  type="number" 
                  required
                  placeholder="Amount ($)"
                  value={milestoneAmount}
                  onChange={(e) => setMilestoneAmount(e.target.value)}
                  className="w-24 px-3 py-1.5 text-xs border border-slate-200 dark:border-darkBorder rounded-lg bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-xs font-semibold text-white rounded-lg"
                >
                  Create
                </button>
              </form>
            )}
          </div>

          {/* Deliverables Submission Portal */}
          <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Project Deliverables</h2>
            
            <div className="space-y-4">
              {project?.deliverables.length === 0 ? (
                <p className="text-xs text-slate-400">No deliverables submitted yet.</p>
              ) : (
                project.deliverables.map((del, idx) => (
                  <div key={del._id || idx} className="p-4 bg-slate-50/50 dark:bg-darkCard/40 border border-slate-100 dark:border-darkBorder/40 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{del.title}</h4>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        del.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        del.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {del.status}
                      </span>
                    </div>
                    {del.description && <p className="text-[11px] text-slate-500 dark:text-slate-400">{del.description}</p>}
                    
                    {del.fileUrl && (
                      <a 
                        href={del.fileUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] text-primary-500 hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        <FileText size={12} /> View Submission Link/URL
                      </a>
                    )}

                    {isClient && del.status === 'pending' && (
                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          onClick={() => handleReviewDeliverable(del._id, 'rejected')}
                          className="px-2.5 py-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-[10px] font-semibold rounded-lg"
                        >
                          Request Revisions
                        </button>
                        <button
                          onClick={() => handleReviewDeliverable(del._id, 'accepted')}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-[10px] font-semibold text-white rounded-lg shadow-sm"
                        >
                          Approve Submission
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Submit deliverable form (Freelancer only) */}
            {!isClient && project?.status !== 'completed' && (
              <form onSubmit={handleSubmitDeliverable} className="mt-6 pt-4 border-t border-slate-100 dark:border-darkBorder/20 space-y-3">
                <span className="text-xs font-semibold text-slate-400 block">Submit Work Deliverable</span>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    required
                    placeholder="Deliverable title (e.g. Logo files v1)..."
                    value={delivTitle}
                    onChange={(e) => setDelivTitle(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-200 dark:border-darkBorder rounded-lg bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
                  />
                  <input 
                    type="url" 
                    placeholder="Live URL / GitHub link / Drive link..."
                    value={delivLink}
                    onChange={(e) => setDelivLink(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-200 dark:border-darkBorder rounded-lg bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200"
                  />
                </div>
                <textarea 
                  rows={2}
                  placeholder="Additional submission comments..."
                  value={delivDesc}
                  onChange={(e) => setDelivDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-darkBorder rounded-lg bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200 font-sans resize-none"
                ></textarea>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-xs font-semibold text-white rounded-lg"
                >
                  Submit Work
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column - File Shared & Reviews */}
        <div className="space-y-8">
          
          {/* Shared Files cabinet */}
          <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Shared Assets & Files</h2>
            
            <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto pr-1">
              {project?.files.length === 0 ? (
                <p className="text-xs text-slate-400">No assets uploaded yet.</p>
              ) : (
                project.files.map((file, idx) => (
                  <div key={idx} className="p-2 bg-slate-50/50 dark:bg-darkCard/40 border border-slate-100 dark:border-darkBorder/40 rounded-lg flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{file.name}</span>
                    <a 
                      href={`http://localhost:5001${file.fileUrl}`} 
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-500 hover:underline"
                    >
                      Download
                    </a>
                  </div>
                ))
              )}
            </div>

            {project?.status !== 'completed' && (
              <form onSubmit={handleFileUpload} className="border-t border-slate-100 dark:border-darkBorder/20 pt-4 space-y-2">
                <input 
                  type="file" 
                  required
                  onChange={(e) => setWorkspaceFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-100 file:text-primary-500 dark:file:bg-primary-900/30 cursor-pointer"
                />
                <button
                  type="submit"
                  disabled={uploadingFile}
                  className="w-full py-1.5 bg-primary-500 hover:bg-primary-600 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                >
                  {uploadingFile ? 'Uploading...' : 'Upload Asset File'}
                </button>
              </form>
            )}
          </div>

          {/* Project Completion & Reviews */}
          {project?.status === 'in-progress' && isClient && (
            <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Complete Project</h2>
              <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                If the student freelancer has completed the required milestones, click complete to finish the contract and leave a rating feedback.
              </p>
              
              <button
                onClick={() => {
                  setProject(prev => ({ ...prev, status: 'completed' }));
                }}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold text-white rounded-lg shadow-sm"
              >
                Mark Project Completed
              </button>
            </div>
          )}

          {/* Review Form */}
          {project?.status === 'completed' && !reviewed && (
            <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm glow-primary">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1">
                <Sparkles size={14} className="text-primary-500" />
                <span>Rate Hired Partner</span>
              </h2>
              
              <form onSubmit={handleSubmitReview} className="space-y-4 mt-4">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Stars Rating (1-5)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star 
                          size={20} 
                          className={star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-600'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Review Comments</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Share details on communication, delivery quality, etc..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-darkBorder rounded-lg bg-slate-50 dark:bg-darkBg outline-none text-slate-700 dark:text-slate-200 font-sans resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-xs font-semibold text-white shadow-sm"
                >
                  Submit Review
                </button>
              </form>
            </div>
          )}

          {project?.status === 'completed' && reviewed && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 size={14} />
              <span>Project finalized. Review details submitted!</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default Workspace;
