import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const DashLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-scroll to top on route change
  useEffect(() => {
    const mainContent = document.getElementById('dash-main-scroll');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, []);

  // Secure route check: redirect to login if user object doesn't exist
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-bg-light dark:bg-bg-dark text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar - fixed left on desktop, drawer left on mobile */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content frame */}
      <div className="flex-1 h-full flex flex-col lg:pl-64 transition-all duration-300">
        {/* Top Header bar */}
        <Topbar onMenuOpen={() => setIsSidebarOpen(true)} />

        {/* Dynamic page content container */}
        <main 
          id="dash-main-scroll"
          className="flex-1 overflow-y-auto px-6 py-8 grid-bg-light dark:grid-bg-dark relative"
        >
          {/* Subtle grid pattern overlay for futuristic aesthetics */}
          <div className="grid-bg-overlay pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashLayout;
