import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { DollarSign, Clock, Sparkles, Check, X, ShieldAlert, Award, MessageSquare } from 'lucide-react';

export const ProposalsManager = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);

  const fetchData = async () => {
    try {
      const projRes = await api.get(`/projects/${projectId}`);
      setProject(projRes.data);

      const propRes = await api.get(`/proposals/project/${projectId}`);
      setProposals(propRes.data);
    } catch (error) {
      console.error('Error fetching proposals info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleAccept = async (propId) => {
    if (!window.confirm('Are you sure you want to hire this student freelancer? This will reject all other bids and initialize the workspace.')) return;
    
    setActioning(true);
    try {
      await api.post(`/proposals/${propId}/accept`);
      alert('Freelancer hired! Opening Workspace...');
      navigate(`/workspace/${projectId}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to hire freelancer.');
    } finally {
      setActioning(false);
    }
  };

  const handleReject = async (propId) => {
    if (!window.confirm('Reject this proposal?')) return;
    
    setActioning(true);
    try {
      await api.post(`/proposals/${propId}/reject`);
      await fetchData(); // reload list
    } catch (error) {
      alert('Failed to reject proposal.');
    } finally {
      setActioning(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
        Loading project proposals...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300 space-y-8 animate-glow">
      {/* Header Info */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <span className="text-xs text-slate-400 font-semibold block">Reviewing Proposals for:</span>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{project?.title}</h1>
          <p className="text-xs text-slate-400 mt-2">Budget: ${project?.budget} • Deadline: {new Date(project?.deadline).toLocaleDateString()}</p>
        </div>
        <Link 
          to="/dashboard"
          className="px-4 py-2 border border-slate-200 dark:border-darkBorder rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-darkBorder/20"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Proposals List */}
      <div className="space-y-6">
        <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
          <span>Submitted Bids ({proposals.length})</span>
          <span className="text-xs font-semibold text-slate-400">(Ranked by AI Match Suitability)</span>
        </h2>

        {proposals.length === 0 ? (
          <div className="glass p-12 rounded-2xl border border-slate-200 dark:border-darkBorder text-center text-slate-400 text-xs">
            No student proposals submitted yet.
          </div>
        ) : (
          proposals.map((prop) => (
            <div 
              key={prop._id}
              className={`glass p-6 rounded-2xl border transition-all duration-300 relative ${prop.status === 'rejected' ? 'opacity-50 border-slate-200' : 'border-slate-200 dark:border-darkBorder hover:shadow-md'}`}
            >
              
              {/* AI Badge banner */}
              {prop.aiMatchScore > 0 && prop.status !== 'rejected' && (
                <div className="absolute top-6 right-6 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/10 text-primary-500 border border-indigo-500/20">
                  <Sparkles size={11} className="animate-spin" />
                  <span>AI INDEX: {prop.aiMatchScore}% FIT</span>
                </div>
              )}

              {/* Freelancer details header */}
              <div className="flex gap-4 items-start">
                {prop.freelancerId?.profileImage ? (
                  <img 
                    src={prop.freelancerId.profileImage} 
                    alt="Freelancer" 
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {prop.freelancerId?.name.substring(0, 2)}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">{prop.freelancerId?.name}</h3>
                    {prop.freelancerId?.rating > 0 && (
                      <span className="text-[10px] font-bold text-amber-500 flex items-center">
                        ★ {prop.freelancerId.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-lg truncate">{prop.freelancerId?.bio || 'Student Freelancer'}</p>
                </div>
              </div>

              {/* Proposal core fields */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50/50 dark:bg-darkBg/60 border border-slate-100 dark:border-darkBorder/40 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Proposed Price</span>
                  <span className="font-bold text-emerald-500 mt-0.5 block">${prop.bidAmount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Estimated Duration</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{prop.deliveryDays} Days</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 block">Skills Overlap</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(prop.freelancerId?.skills || []).slice(0, 4).map((sk, idx) => (
                      <span key={idx} className="bg-slate-200/50 dark:bg-darkBorder/50 text-[9px] text-slate-500 px-1.5 py-0.5 rounded">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Matching Reason */}
              {prop.aiMatchReason && prop.status !== 'rejected' && (
                <div className="mt-4 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">AI Evaluation Note</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {prop.aiMatchReason}
                  </p>
                </div>
              )}

              {/* Cover Letter */}
              <div className="mt-4">
                <span className="text-[10px] text-slate-400 block font-semibold">Cover Letter / Bid Description:</span>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-white dark:bg-darkBg/30 p-4 rounded-xl border border-slate-100 dark:border-darkBorder/40 leading-relaxed font-sans white-space-pre-line">
                  {prop.coverLetter}
                </p>
              </div>

              {/* Actions */}
              {prop.status === 'pending' && !actioning && (
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-darkBorder/40 flex justify-end gap-2">
                  <Link
                    to={`/messages?chatWith=${prop.freelancerId?._id}`}
                    className="px-3.5 py-2 border border-slate-200 dark:border-darkBorder rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-darkBorder/20 flex items-center gap-1.5"
                  >
                    <MessageSquare size={13} /> Chat First
                  </Link>
                  <button
                    onClick={() => handleReject(prop._id)}
                    className="px-3.5 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <X size={13} /> Reject
                  </button>
                  <button
                    onClick={() => handleAccept(prop._id)}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <Check size={13} /> Hire Freelancer
                  </button>
                </div>
              )}

              {prop.status === 'accepted' && (
                <div className="mt-4 text-xs text-emerald-500 font-semibold flex items-center gap-1">
                  ✓ Hired & Contract active in workspace.
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
export default ProposalsManager;
