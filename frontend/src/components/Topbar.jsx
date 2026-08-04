import React from 'react';
import { Menu, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { useLocation } from 'react-router-dom';

const Topbar = ({ onMenuOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Generate a page title based on path
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Home';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <header className="glass-panel glass-panel-light dark:glass-panel-dark h-16 sticky top-0 z-20 flex items-center justify-between px-6 border-b border-black/10 dark:border-white/10 shadow-sm backdrop-blur-md">
      {/* Mobile Menu Trigger & Section title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuOpen}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <h2 className="text-lg font-bold font-orbitron text-slate-800 dark:text-slate-100 tracking-wide">
          {getPageTitle()}
        </h2>
      </div>

      {/* Global Actions (Search, Notification, Theme, Profile) */}
      <div className="flex items-center gap-4">
        {/* Search Mock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/40 text-slate-400 focus-within:border-brand-blue/50 transition-all duration-200 w-60">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search verifications..." 
            className="bg-transparent border-none outline-none text-xs w-full text-slate-700 dark:text-slate-200 placeholder-slate-400"
          />
        </div>




        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Mini Avatar */}
        {user && (
          <div className="flex items-center gap-2 border-l border-slate-300 dark:border-slate-800 pl-4 h-8">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="h-8 w-8 rounded-full border border-brand-blue/20 bg-slate-800 hidden xs:block"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden md:block">
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
