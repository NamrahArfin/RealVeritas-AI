import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md text-slate-700 dark:text-slate-300 hover:text-brand-blue dark:hover:text-brand-blue hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(14,165,233,0.2)] ${className}`}
      aria-label="Toggle visual theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 animate-[spin_10s_linear_infinite]" />
      ) : (
        <Moon className="h-5 w-5 hover:rotate-12 transition-transform duration-200" />
      )}
    </button>
  );
};

export default ThemeToggle;
