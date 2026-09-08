import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const MainLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-bg-light dark:bg-bg-dark text-slate-800 dark:text-slate-100 grid-bg-light dark:grid-bg-dark flex flex-col relative overflow-hidden">
      
      {/* Animated Vibrant Orbs */}
      <div className="orb-1" />
      <div className="orb-2" />
      <div className="orb-3" />

      {/* Landing Navbar */}
      <header 
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          scrolled 
            ? 'glass-panel bg-white/70 dark:bg-slate-950/70 border-b border-black/10 dark:border-white/10 py-3 shadow-md backdrop-blur-md' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-brand-blue/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src="/logo.jpg" alt="RealVeritas AI Logo" className="relative h-10 w-10 object-contain rounded-xl shadow-[0_0_10px_rgba(14,165,233,0.3)] border border-white/10 group-hover:scale-105 transition-transform duration-200" />
            </div>
            <div>
              <h1 className="font-orbitron font-extrabold text-base tracking-wider bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                RealVeritas AI
              </h1>
            </div>
          </Link>

          {/* Links & CTA */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {user ? (
              <Link 
                to="/dashboard"
                className="px-5 py-2 rounded-xl text-xs font-bold font-orbitron bg-gradient-to-r from-brand-blue to-brand-purple text-white hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login"
                  className="px-4 py-2 text-xs font-bold font-orbitron text-slate-700 dark:text-slate-200 hover:text-brand-blue transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  to="/signup"
                  className="hidden xs:inline-block px-5 py-2 rounded-xl text-xs font-bold font-orbitron bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-blue dark:hover:bg-brand-blue hover:text-white dark:hover:text-white hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Page Slot */}
      <main className="flex-grow pt-20">
        <Outlet />
      </main>

      {/* Landing Footer */}
      <footer className="glass-panel glass-panel-light dark:glass-panel-dark border-t border-black/10 dark:border-white/10 mt-auto py-10 px-6 backdrop-blur-md">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="RealVeritas AI Logo" className="h-8 w-8 object-contain rounded-lg border border-white/10" />
              <span className="font-orbitron font-extrabold text-sm tracking-widest text-slate-800 dark:text-slate-100">
                REALVERITAS AI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Providing production-grade media analysis systems to detect AI generation, synthetic editing, and deepfakes. Empowering transparency via Explainable AI.
            </p>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Compliance Level: ISO-27001 AI Standard
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-orbitron text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="text-slate-500 dark:text-slate-400 hover:text-brand-blue transition-colors">
                  Multi-Modal Dashboard
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-slate-500 dark:text-slate-400 hover:text-brand-blue transition-colors">
                  Developer API Access
                </Link>
              </li>
              <li>
                <a href="#supported" className="text-slate-500 dark:text-slate-400 hover:text-brand-blue transition-colors">
                  System Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* About/Legal */}
          <div>
            <h4 className="font-orbitron text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4">
              Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#about" className="text-slate-500 dark:text-slate-400 hover:text-brand-blue transition-colors flex items-center gap-1.5">
                  <Cpu className="h-3 w-3" /> Core Methodology
                </a>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-400 hover:text-brand-blue transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-400 hover:text-brand-blue transition-colors cursor-pointer flex items-center gap-1.5">
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                  <span>GitHub Codebase</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-black/5 dark:border-white/5 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-slate-400 font-medium">
            © 2026 RealVeritas AI Systems. All rights reserved. Made for professional research.
          </p>
          <div className="flex items-center gap-4 text-[10px] text-slate-400">
            <span className="hover:text-brand-blue cursor-pointer">Terms of Service</span>
            <span className="hover:text-brand-purple cursor-pointer">System Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
