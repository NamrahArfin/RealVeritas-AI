import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

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
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 glass-panel glass-panel-light dark:glass-panel-dark border-b border-black/10 dark:border-white/10 sticky top-0 z-20">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Logo" className="h-8 w-8 rounded-lg shadow-md" />
            <span className="font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple tracking-wide">
              RealVeritas
            </span>
          </div>
        </div>

        {/* Dynamic page content container */}
        <main 
          id="dash-main-scroll"
          className="flex-1 overflow-y-auto px-6 py-8 grid-bg-light dark:grid-bg-dark relative"
        >
          {/* Subtle grid pattern overlay for futuristic aesthetics */}
          <div className="grid-bg-overlay pointer-events-none" />
          
          {/* Animated Vibrant Orbs */}
          <div className="orb-1" />
          <div className="orb-2" />
          <div className="orb-3" />

          <div className="max-w-7xl mx-auto relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashLayout;
