import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { Bell, MessageSquare, Sun, Moon, LogOut, User as UserIcon, Briefcase, Award, Shield, Menu, X } from 'lucide-react';
import api from '../services/api';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const notifRef = useRef(null);

  // Fetch notifications and conversations unread status
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const notifRes = await api.get('/notifications');
          setNotifications(notifRes.data);
          setUnreadNotifs(notifRes.data.filter(n => !n.isRead).length);
          
          const convRes = await api.get('/chat/conversations');
          const totalUnreadMsg = convRes.data.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
          setUnreadMessages(totalUnreadMsg);
        } catch (error) {
          console.error('Navbar load stats error:', error);
        }
      };
      
      fetchData();
      
      // Keep checking every 15s in case of updates
      const interval = setInterval(fetchData, 15000);
      return () => clearInterval(interval);
    }
  }, [user, location.pathname]);

  // Hook up Sockets for real-time alerts
  useEffect(() => {
    if (socket) {
      const handleSocketNotification = (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadNotifs(prev => prev + 1);
      };

      const handleUnreadMsg = () => {
        setUnreadMessages(prev => prev + 1);
      };

      socket.on('notification', handleSocketNotification);
      socket.on('newUnreadMessage', handleUnreadMsg);

      return () => {
        socket.off('notification', handleSocketNotification);
        socket.off('newUnreadMessage', handleUnreadMsg);
      };
    }
  }, [socket]);

  // Close notifications dropdown on outside clicks
  useEffect(() => {
    const clickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotifs(0);
    } catch (error) {
      console.error('Error marking all notifications read:', error);
    }
  };

  const handleNotifClick = async (notif) => {
    try {
      await api.put(`/notifications/${notif._id}`);
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      setUnreadNotifs(prev => Math.max(0, prev - 1));
      
      // Redirect based on type
      if (notif.type === 'chat') {
        navigate('/messages');
      } else if (notif.type === 'bid' || notif.type === 'proposal_status') {
        navigate(user.role === 'student' ? '/bids' : '/dashboard');
      } else {
        navigate('/dashboard');
      }
      setNotifDropdown(false);
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  const handleSignout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
    ${isActive(path) 
      ? 'bg-primary-500 text-white shadow-sm glow-primary' 
      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkBorder/40 hover:text-slate-900 dark:hover:text-white'}
  `;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-darkBorder/80 bg-white/75 dark:bg-darkBg/75 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary-500">
              <div className="p-1.5 bg-primary-500 text-white rounded-lg shadow-sm">
                <Briefcase size={20} />
              </div>
              <span className="bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent">GradGigs</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className={linkClass('/')}>Home</Link>
            <Link to="/projects" className={linkClass('/projects')}>Browse Jobs</Link>
            <Link to="/freelancers" className={linkClass('/freelancers')}>Freelancers</Link>

            {user && (
              <>
                <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
                {user.role === 'student' && (
                  <>
                    <Link to="/portfolio" className={linkClass('/portfolio')}>Portfolio</Link>
                    <Link to="/bids" className={linkClass('/bids')}>My Bids</Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Utility Icons & Dropdowns */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkBorder/40 rounded-full transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                {/* Chat Icon */}
                <Link 
                  to="/messages"
                  className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkBorder/40 rounded-full transition-colors"
                >
                  <MessageSquare size={18} />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center animate-bounce">
                      {unreadMessages}
                    </span>
                  )}
                </Link>

                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => setNotifDropdown(!notifDropdown)}
                    className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-darkBorder/40 rounded-full transition-colors"
                  >
                    <Bell size={18} />
                    {unreadNotifs > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold text-white bg-indigo-500 rounded-full flex items-center justify-center">
                        {unreadNotifs}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Card */}
                  {notifDropdown && (
                    <div className="absolute right-0 mt-2 w-80 glass rounded-2xl shadow-xl border border-slate-200 dark:border-darkBorder overflow-hidden z-50">
                      <div className="p-3 border-b border-slate-200 dark:border-darkBorder flex items-center justify-between bg-slate-50/50 dark:bg-darkCard/50">
                        <span className="text-sm font-semibold text-slate-800 dark:text-white">Notifications</span>
                        {unreadNotifs > 0 && (
                          <button 
                            onClick={handleMarkAllRead}
                            className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <button
                              key={notif._id}
                              onClick={() => handleNotifClick(notif)}
                              className={`w-full p-3 text-left border-b border-slate-100 dark:border-darkBorder/30 hover:bg-slate-50 dark:hover:bg-darkBorder/20 flex gap-3 transition-colors ${!notif.isRead ? 'bg-indigo-50/20 dark:bg-primary-900/10' : ''}`}
                            >
                              <div className="mt-0.5 p-1 bg-primary-100 dark:bg-primary-900/30 text-primary-500 rounded-lg h-fit">
                                {notif.type === 'admin' ? <Shield size={14} /> : <Briefcase size={14} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{notif.title}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{notif.description}</p>
                                <span className="text-[9px] text-slate-400 block mt-1">
                                  {new Date(notif.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Avatar / logout */}
                <div className="flex items-center gap-3 border-l border-slate-200 dark:border-darkBorder pl-4">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
                  </div>
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border border-slate-200 dark:border-darkBorder object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                      {user.name.substring(0, 2)}
                    </div>
                  )}
                  <button 
                    onClick={handleSignout}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-full transition-colors"
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 pl-2">
                <Link 
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg shadow-sm hover:shadow transition-all duration-200"
                >
                  Join as Student
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 rounded-full"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-darkBorder bg-white dark:bg-darkBg/95 backdrop-blur px-4 pt-2 pb-4 space-y-1">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-base font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkBorder/40">Home</Link>
          <Link to="/projects" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-base font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkBorder/40">Browse Jobs</Link>
          <Link to="/freelancers" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-base font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkBorder/40">Freelancers</Link>
          
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-base font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkBorder/40">Dashboard</Link>
              {user.role === 'student' && (
                <>
                  <Link to="/portfolio" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-base font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkBorder/40">Portfolio</Link>
                  <Link to="/bids" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-base font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkBorder/40">My Bids</Link>
                </>
              )}
              <Link to="/messages" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-base font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkBorder/40">Messages ({unreadMessages})</Link>
              <button 
                onClick={handleSignout}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-base font-medium rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-center py-2 text-sm font-medium border border-slate-200 dark:border-darkBorder rounded-lg text-slate-700 dark:text-slate-200">Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="text-center py-2 text-sm font-medium bg-primary-500 rounded-lg text-white">Join</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
export default Navbar;
