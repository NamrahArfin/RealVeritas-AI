import React from 'react';
import { Menu, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { useLocation, Link } from 'react-router-dom';

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
      </div>

      {/* Global Actions (Search, Notification, Theme, Profile) */}
      <div className="flex items-center gap-4">





        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Mini Avatar */}
        {user && (
          <Link 
            to="/profile"
            className="flex items-center gap-2 border-l border-slate-300 dark:border-slate-800 pl-4 h-8 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="h-8 w-8 rounded-full border border-brand-blue/20 bg-slate-800 hidden xs:block"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden md:block">
              {user.name}
            </span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Topbar;
