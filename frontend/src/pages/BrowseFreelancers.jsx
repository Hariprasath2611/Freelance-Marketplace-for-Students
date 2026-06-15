import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Search, MessageSquare, Star, Award, AwardIcon, Compass } from 'lucide-react';

export const BrowseFreelancers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  const fetchFreelancers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('keyword', search);
      if (skillFilter) queryParams.append('skill', skillFilter);

      const res = await api.get(`/users/freelancers?${queryParams.toString()}`);
      setFreelancers(res.data);
    } catch (error) {
      console.error('Error fetching freelancers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, [search, skillFilter]);

  const handleMessageUser = (targetId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Navigate to chat window and auto-select user
    navigate(`/messages?chatWith=${targetId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent w-fit">
          Browse Student Freelancers
        </h1>
        <p className="text-slate-400 mt-2 text-sm">Find skilled university talent for your technical and creative projects.</p>
      </div>

      {/* Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 relative">
          <input 
            type="text" 
            placeholder="Search freelancers by name, bio keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-white dark:bg-darkCard focus:ring-1 focus:ring-primary-500 outline-none text-slate-700 dark:text-slate-200"
          />
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="Filter by skill (e.g. React, Python)"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-xs border border-slate-200 dark:border-darkBorder rounded-xl bg-white dark:bg-darkCard focus:ring-1 focus:ring-primary-500 outline-none text-slate-700 dark:text-slate-200"
          />
          <Compass size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
        </div>
      </div>

      {/* Freelancers List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, idx) => (
            <div key={idx} className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-darkBorder/40 shimmer"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-darkBorder/40 rounded w-1/2 shimmer"></div>
                  <div className="h-3 bg-slate-200 dark:bg-darkBorder/40 rounded w-1/3 shimmer"></div>
                </div>
              </div>
              <div className="h-12 bg-slate-200 dark:bg-darkBorder/40 rounded w-full shimmer"></div>
            </div>
          ))}
        </div>
      ) : freelancers.length === 0 ? (
        <div className="glass p-12 rounded-2xl border border-slate-200 dark:border-darkBorder text-center">
          <p className="text-slate-400 text-sm">No student freelancers found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {freelancers.map((freelancer) => (
            <div 
              key={freelancer._id}
              className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header Profile card */}
                <div className="flex gap-4 items-start">
                  {freelancer.profileImage ? (
                    <img 
                      src={freelancer.profileImage} 
                      alt={freelancer.name} 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 dark:border-darkBorder"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary-500 text-white flex items-center justify-center font-bold text-sm uppercase">
                      {freelancer.name.substring(0, 2)}
                    </div>
                  )}
                  
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-white truncate">{freelancer.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {freelancer.rating > 0 ? freelancer.rating.toFixed(1) : 'No reviews'}
                      </span>
                      <span className="text-[10px] text-slate-400">({freelancer.reviewCount || 0} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Bio Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 line-clamp-3 leading-relaxed">
                  {freelancer.bio || 'This student freelancer has not written a biography yet.'}
                </p>

                {/* Skills tags */}
                <div className="mt-4 flex flex-wrap gap-1">
                  {(freelancer.skills || []).slice(0, 5).map((skill, i) => (
                    <span key={i} className="text-[9px] bg-indigo-500/5 text-primary-500 border border-indigo-500/10 px-2 py-0.5 rounded-md">
                      {skill}
                    </span>
                  ))}
                  {freelancer.skills?.length > 5 && (
                    <span className="text-[9px] text-slate-400 px-1 py-0.5 font-semibold">
                      +{freelancer.skills.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-darkBorder/40 flex gap-2">
                <button
                  onClick={() => handleMessageUser(freelancer._id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-darkBorder rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-darkBorder/20 transition-colors"
                >
                  <MessageSquare size={13} />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default BrowseFreelancers;
