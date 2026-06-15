import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Plus, DollarSign, Briefcase, Star, Clock, AlertTriangle, 
  Sparkles, CheckCircle2, UserCheck, Trash2, Ban, ShieldAlert 
} from 'lucide-react';

// ==========================================
// 1. STUDENT DASHBOARD
// ==========================================
const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeProjects, setActiveProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [earnings, setEarnings] = useState({ totalEarnings: 0, monthlyEarnings: [] });
  const [aiRecs, setAiRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        // Fetch active projects where hired
        const projRes = await api.get('/projects');
        const active = projRes.data.filter(p => p.freelancerId?._id === user._id && p.status === 'in-progress');
        setActiveProjects(active);

        // Fetch proposals
        const propRes = await api.get('/proposals/my');
        setProposals(propRes.data);

        // Fetch earnings
        const earnRes = await api.get('/payments/earnings');
        setEarnings(earnRes.data);

        // Fetch AI project recommendations
        const recRes = await api.get('/projects/student/recommendations');
        setAiRecs(recRes.data.slice(0, 3)); // show top 3 recommendations
      } catch (error) {
        console.error('Error loading student dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStudentData();
  }, [user]);

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
        Loading freelancer metrics...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-glow">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Total Earnings</span>
            <span className="text-2xl font-bold">${earnings.totalEarnings}</span>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-primary-500 rounded-xl">
            <Briefcase size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Active Contracts</span>
            <span className="text-2xl font-bold">{activeProjects.length}</span>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Submitted Bids</span>
            <span className="text-2xl font-bold">{proposals.length}</span>
          </div>
        </div>
      </div>

      {/* Main Content Splitting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Active Workspaces & Bids */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Workspaces */}
          <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4">Active Projects & Workspaces</h2>
            {activeProjects.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50/50 dark:bg-darkCard/20">
                You do not have any active hired contracts. Browse gigs and submit proposals to get started!
              </div>
            ) : (
              <div className="space-y-3">
                {activeProjects.map(project => (
                  <div key={project._id} className="p-4 bg-slate-50/50 dark:bg-darkCard/40 border border-slate-100 dark:border-darkBorder/40 rounded-xl flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">{project.title}</h3>
                      <p className="text-[10px] text-slate-400 mt-1">Client: {project.clientId?.name || 'Recruiter'}</p>
                    </div>
                    <Link 
                      to={`/workspace/${project._id}`}
                      className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-[10px] text-white font-semibold rounded-lg shadow-sm"
                    >
                      Open Workspace
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Earnings Analytics Chart */}
          <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4">Earnings History</h2>
            {earnings.monthlyEarnings.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                Earnings charts will populate after your first milestone payout release.
              </div>
            ) : (
              <div className="flex items-end justify-between h-48 pt-4 px-2 border-b border-slate-200 dark:border-darkBorder/50">
                {earnings.monthlyEarnings.map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <div className="text-[9px] font-bold text-emerald-500">${item.earnings}</div>
                    <div 
                      className="w-8 bg-gradient-to-t from-emerald-500 to-indigo-500 rounded-t-lg transition-all duration-500 hover:opacity-80"
                      style={{ height: `${Math.min(120, (item.earnings / (Math.max(...earnings.monthlyEarnings.map(e => e.earnings)) || 1)) * 120)}px` }}
                    ></div>
                    <div className="text-[10px] text-slate-400 font-medium mt-1">{item.month}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column - AI Recommendations */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm glow-primary">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-white font-bold mb-4">
              <Sparkles size={16} className="text-primary-500 animate-bounce" />
              <span className="text-sm">AI Project Recommendations</span>
            </div>
            
            {aiRecs.length === 0 ? (
              <p className="text-[11px] text-slate-400">Add skills to your profile to get matches.</p>
            ) : (
              <div className="space-y-3">
                {aiRecs.map(rec => (
                  <div key={rec.project._id} className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl relative group">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-6">
                        {rec.project.title}
                      </h3>
                      <span className="text-[10px] font-bold text-indigo-500">{rec.matchScore}% fit</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {rec.matchReason}
                    </p>
                    <Link 
                      to={`/projects?search=${encodeURIComponent(rec.project.title)}`}
                      className="text-[9px] font-bold text-primary-500 hover:text-primary-600 inline-flex items-center mt-2"
                    >
                      View Project
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Proposal status tracker */}
          <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Recent Proposals</h2>
            {proposals.length === 0 ? (
              <p className="text-xs text-slate-400">No proposals submitted.</p>
            ) : (
              <div className="space-y-3">
                {proposals.slice(0, 3).map(prop => (
                  <div key={prop._id} className="p-3 bg-slate-50/50 dark:bg-darkCard/30 border border-slate-100 dark:border-darkBorder/30 rounded-xl flex justify-between items-center">
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{prop.projectId?.title}</h4>
                      <span className="text-[9px] text-slate-400">${prop.bidAmount} • {prop.deliveryDays} days</span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                      prop.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                      prop.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                      'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {prop.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. CLIENT DASHBOARD
// ==========================================
const ClientDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [spending, setSpending] = useState({ totalSpent: 0, monthlySpending: [] });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadClientData = async () => {
      try {
        const projRes = await api.get('/projects');
        // Filter projects posted by client
        const mine = projRes.data.filter(p => p.clientId?._id === user._id);
        setProjects(mine);

        const spendRes = await api.get('/payments/spending');
        setSpending(spendRes.data);
      } catch (error) {
        console.error('Error loading client dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadClientData();
  }, [user]);

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
        Loading client dashboard stats...
      </div>
    );
  }

  const activeContracts = projects.filter(p => p.status === 'in-progress');

  return (
    <div className="space-y-8 animate-glow">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Total Spent</span>
            <span className="text-2xl font-bold">${spending.totalSpent}</span>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-primary-500 rounded-xl">
            <Briefcase size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Active Hires</span>
            <span className="text-2xl font-bold">{activeContracts.length}</span>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Plus size={24} />
          </div>
          <div className="flex-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Post New Gig</span>
            <Link to="/post-project" className="text-xs font-bold text-primary-500 hover:text-primary-600 block mt-0.5">
              Create Job Listing &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Gigs posted */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Your Job Postings</h2>
              <Link to="/post-project" className="text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                <Plus size={14} /> Post Project
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-darkBorder rounded-xl bg-slate-50/50 dark:bg-darkCard/20">
                You have not posted any projects yet. Create one to hire talented students!
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map(proj => (
                  <div key={proj._id} className="p-4 bg-slate-50/50 dark:bg-darkCard/40 border border-slate-100 dark:border-darkBorder/40 rounded-xl flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">{proj.title}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold uppercase ${
                          proj.status === 'in-progress' ? 'bg-indigo-500/10 text-primary-500' :
                          proj.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          {proj.status}
                        </span>
                        <span className="text-[10px] text-slate-400">${proj.budget} Budget</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {proj.status === 'published' ? (
                        <Link
                          to={`/proposals/${proj._id}`}
                          className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-[10px] text-white font-semibold rounded-lg"
                        >
                          Review Bids
                        </Link>
                      ) : proj.status === 'in-progress' ? (
                        <Link
                          to={`/workspace/${proj._id}`}
                          className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-[10px] text-white font-semibold rounded-lg"
                        >
                          Workspace
                        </Link>
                      ) : (
                        <span className="text-[10px] text-slate-400">Completed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Spending history charts */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Monthly Spending</h2>
            {spending.monthlySpending.length === 0 ? (
              <p className="text-xs text-slate-400">Spending charts will populate as you fund milestones.</p>
            ) : (
              <div className="flex items-end justify-between h-40 pt-4 px-2 border-b border-slate-200 dark:border-darkBorder/50">
                {spending.monthlySpending.map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <div className="text-[8px] font-bold text-primary-500">${item.spending}</div>
                    <div 
                      className="w-6 bg-gradient-to-t from-primary-500 to-indigo-600 rounded-t-lg transition-all duration-300 hover:opacity-80"
                      style={{ height: `${Math.min(90, (item.spending / (Math.max(...spending.monthlySpending.map(e => e.spending)) || 1)) * 90)}px` }}
                    ></div>
                    <div className="text-[10px] text-slate-400 mt-1">{item.month}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. ADMIN DASHBOARD
// ==========================================
const AdminDashboard = () => {
  const [stats, setStats] = useState({ summary: {}, userGrowth: [], projectGrowth: [] });
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const statRes = await api.get('/admin/analytics');
        setStats(statRes.data);

        const userRes = await api.get('/admin/users');
        setUsers(userRes.data);

        const repRes = await api.get('/admin/reports');
        setReports(repRes.data);
      } catch (error) {
        console.error('Error loading admin analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAdminData();
  }, []);

  const handleToggleBan = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/ban`);
      // Update local state list
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: res.data.user.isBanned } : u));
    } catch (error) {
      console.error('Error moderating user status:', error);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
        Loading admin panel...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-glow">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-darkBorder/60 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Total Users</span>
          <span className="text-xl font-bold block mt-1">{stats.summary?.totalUsers}</span>
        </div>
        <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-darkBorder/60 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Projects Posted</span>
          <span className="text-xl font-bold block mt-1">{stats.summary?.totalProjects}</span>
        </div>
        <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-darkBorder/60 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Active Contracts</span>
          <span className="text-xl font-bold block mt-1">{stats.summary?.activeProjects}</span>
        </div>
        <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-darkBorder/60 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Total Revenue</span>
          <span className="text-xl font-bold text-emerald-500 block mt-1">${stats.summary?.totalRevenue}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users Management */}
        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">User Accounts Moderation</h2>
          <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
            {users.map(u => (
              <div key={u._id} className="p-3 bg-slate-50/50 dark:bg-darkCard/40 border border-slate-100 dark:border-darkBorder/40 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{u.name}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{u.email} • {u.role}</span>
                </div>
                <button
                  onClick={() => handleToggleBan(u._id)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-colors ${u.isBanned ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'}`}
                >
                  {u.isBanned ? 'Unban' : 'Ban'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dispute Monitor reports */}
        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-darkBorder">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Dispute & Moderation Queue</h2>
          <div className="space-y-4">
            {reports.map(rep => (
              <div key={rep._id} className="p-4 bg-slate-50/50 dark:bg-darkCard/40 border border-slate-100 dark:border-darkBorder/40 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5 text-amber-500 font-semibold">
                    <ShieldAlert size={14} />
                    <span>{rep.title}</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase ${rep.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {rep.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{rep.description}</p>
                <div className="text-[10px] text-slate-400 pt-1 flex gap-3">
                  <span>Freelancer: {rep.freelancerName}</span>
                  <span>Client: {rep.clientName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. MAIN HUB CONTAINER
// ==========================================
export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white capitalize">
            {user?.role} Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time status updates and action summary hubs.</p>
        </div>
      </div>

      {user?.role === 'student' && <StudentDashboard />}
      {user?.role === 'client' && <ClientDashboard />}
      {user?.role === 'admin' && <AdminDashboard />}
    </div>
  );
};
export default Dashboard;
