import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages imports
import Home from './pages/Home';
import BrowseProjects from './pages/BrowseProjects';
import BrowseFreelancers from './pages/BrowseFreelancers';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PortfolioBuilder from './pages/PortfolioBuilder';
import MyBids from './pages/MyBids';
import PostProject from './pages/PostProject';
import ProposalsManager from './pages/ProposalsManager';
import Workspace from './pages/Workspace';
import Messages from './pages/Messages';

// Protected Route Guard helper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-darkBg flex items-center justify-center text-xs text-slate-400">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main Layout Wrapper
const AppLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              
              {/* Public Routes */}
              <Route path="/" element={<AppLayout><Home /></AppLayout>} />
              <Route path="/projects" element={<AppLayout><BrowseProjects /></AppLayout>} />
              <Route path="/freelancers" element={<AppLayout><BrowseFreelancers /></AppLayout>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected General Hub Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AppLayout><Dashboard /></AppLayout>
                </ProtectedRoute>
              } />

              {/* Protected Student Routes */}
              <Route path="/portfolio" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AppLayout><PortfolioBuilder /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/bids" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AppLayout><MyBids /></AppLayout>
                </ProtectedRoute>
              } />

              {/* Protected Client Routes */}
              <Route path="/post-project" element={
                <ProtectedRoute allowedRoles={['client']}>
                  <AppLayout><PostProject /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/proposals/:projectId" element={
                <ProtectedRoute allowedRoles={['client']}>
                  <AppLayout><ProposalsManager /></AppLayout>
                </ProtectedRoute>
              } />

              {/* Shared Workspace & Message Routes */}
              <Route path="/workspace/:projectId" element={
                <ProtectedRoute allowedRoles={['student', 'client']}>
                  <AppLayout><Workspace /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute allowedRoles={['student', 'client']}>
                  <AppLayout><Messages /></AppLayout>
                </ProtectedRoute>
              } />

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
