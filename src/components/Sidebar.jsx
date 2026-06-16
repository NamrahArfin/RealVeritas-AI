import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, UploadCloud, History, BarChart3, Settings, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/upload', label: 'Verify Media', icon: UploadCloud },
    { path: '/history', label: 'History', icon: History },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900/90 dark:bg-slate-950/80 border-r border-white/10 text-slate-100 p-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-white/10">
        <img src="/logo.png" alt="RealVeritas AI Logo" className="h-10 w-10 object-contain" />
        <div>
          <h1 className="font-orbitron font-bold text-lg leading-none bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
            RealVeritas
          </h1>
          <span className="text-[10px] text-zinc-400 font-semibold tracking-widest uppercase">
            AI Platform
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 hover:overflow-y-auto overflow-hidden pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-brand-blue/20 to-brand-purple/20 text-brand-blue border border-brand-blue/30 shadow-[0_0_15px_rgba(14,165,233,0.08)]' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info / Logout */}
      {user && (
        <div className="mt-auto border-t border-white/10 pt-4 flex flex-col gap-3">
          <Link 
            to="/profile" 
            onClick={onClose}
            className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all duration-200"
          >
            <img 
              src={user.avatar} 
              alt="avatar" 
              className="h-10 w-10 rounded-full border border-white/20 bg-zinc-800 shrink-0" 
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-slate-100">{user.name}</p>
              <p className="text-xs text-zinc-400 truncate">{user.email}</p>
            </div>
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/20 cursor-pointer"
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
