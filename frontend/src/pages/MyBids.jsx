import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, DollarSign, Calendar, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyBids = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await api.get('/proposals/my');
        setBids(res.data);
      } catch (error) {
        console.error('Error fetching proposals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, [user]);

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
        Loading your proposals...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent w-fit">
          My Submitted Bids
        </h1>
        <p className="text-slate-400 mt-2 text-sm">Review proposal status updates and bid amounts.</p>
      </div>

      {bids.length === 0 ? (
        <div className="glass p-12 rounded-2xl border border-slate-200 dark:border-darkBorder text-center">
          <p className="text-slate-400 text-sm mb-4">You have not submitted any proposals yet.</p>
          <Link to="/projects" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-xl text-xs font-semibold text-white">
            Browse Gigs <ArrowUpRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bids.map((bid) => (
            <div 
              key={bid._id}
              className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                  {bid.projectId?.title || 'Open Project'}
                </h3>
                <div className="flex flex-wrap gap-4 mt-2 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <DollarSign size={12} className="text-emerald-500" />
                    <span>Bid: ${bid.bidAmount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-indigo-500" />
                    <span>Delivery: {bid.deliveryDays} Days</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>Submitted: {new Date(bid.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {bid.aiMatchScore > 0 && (
                  <p className="text-[10px] text-primary-500 font-semibold mt-2.5 bg-indigo-500/5 px-2.5 py-1 border border-indigo-500/10 rounded-lg w-fit">
                    AI Match Index: {bid.aiMatchScore}% fit
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                  bid.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                  bid.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                  'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}>
                  {bid.status}
                </span>

                {bid.status === 'accepted' && (
                  <Link 
                    to={`/workspace/${bid.projectId?._id}`}
                    className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-[10px] font-semibold text-white rounded-lg shadow-sm"
                  >
                    Open Workspace
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MyBids;
