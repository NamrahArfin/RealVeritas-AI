import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, UploadCloud, History, BarChart3, Settings, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Verify Media', path: '/upload', icon: UploadCloud },
    { name: 'History', path: '/history', icon: History },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-100/90 dark:bg-slate-950/80 border-r border-black/10 dark:border-white/10 p-4">
      {/* Brand Logo */}
      <Link to="/" onClick={onClose} className="flex items-center gap-3 px-2 py-4 mb-6 hover:opacity-80 transition-opacity">
        <div className="relative">
          <div className="absolute inset-0 bg-brand-blue rounded-xl blur-[10px] opacity-40"></div>
          <img src="/logo.jpg" alt="RealVeritas Logo" className="relative h-10 w-10 rounded-xl shadow-lg border border-black/10 dark:border-white/10" />
        </div>
        <div>
          <h1 className="font-orbitron font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple tracking-wide">
            RealVeritas
          </h1>
          <p className="text-[9px] font-medium tracking-widest text-slate-500 uppercase">AI Platform</p>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 mt-4 hover:overflow-y-auto overflow-hidden pr-2 pl-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                relative flex items-center gap-3 px-4 py-3 rounded-xl
                text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'text-slate-800 dark:text-white bg-black/5 dark:bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 w-1 h-6 bg-brand-blue rounded-r-full shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                    />
                  )}
                  <Icon className={`h-5 w-5 ${isActive ? 'text-brand-blue drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : ''}`} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info, Theme & Logout */}
      {user && (
        <div className="mt-auto border-t border-black/10 dark:border-white/10 pt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <Link 
              to="/profile" 
              onClick={onClose}
              className="flex items-center gap-3 py-1.5 hover:opacity-80 transition-opacity"
            >
              <img 
                src={user.avatar} 
                alt="avatar" 
                className="h-10 w-10 rounded-full border border-black/20 dark:border-white/20 bg-slate-200 dark:bg-zinc-800 shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{user.email}</p>
              </div>
            </Link>
            <div className="scale-90">
              <ThemeToggle />
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/20 cursor-pointer"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden lg:block w-64 h-screen fixed top-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Mobile menu active) */}
      <div 
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Content Container */}
        <div 
          className={`absolute top-0 left-0 w-64 h-full transition-transform duration-300 transform ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
