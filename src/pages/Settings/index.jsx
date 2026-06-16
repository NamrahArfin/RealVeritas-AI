import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../../components/GlassCard';
import { 
  Settings, Moon, Sun, Lock, ShieldAlert, 
  Trash2, CheckCircle2, ShieldCheck, HelpCircle
} from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Delete account state
  const [deleteStep, setDeleteStep] = useState(0); // 0: initial, 1: confirm checkbox, 2: deleted

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all cipher update fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New cipher key must contain at least 6 tokens.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New cipher keys do not match.');
      return;
    }

    // Simulate change success
    setPasswordSuccess('Cipher key successfully updated in vault.');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(''), 3000);
  };

  const handleDeleteAccount = () => {
    setDeleteStep(2);
    setTimeout(() => {
      localStorage.clear();
      window.location.replace('/');
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-black/5 dark:border-white/5 pb-6">
        <h2 className="text-xl md:text-2xl font-black font-orbitron text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>System Settings panel</span>
          <Settings className="h-5.5 w-5.5 text-brand-purple" />
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Configure visual parameters, update cryptographic credentials, and manage credentials logs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Visual & Theme (md:col-span-6) */}
        <div className="md:col-span-6 space-y-6">
          <GlassCard className="p-6 space-y-4">
            <h3 className="text-xs font-bold font-orbitron text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
              <Sun className="h-4.5 w-4.5 text-brand-blue" />
              <span>Theme Configuration</span>
            </h3>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Visual Display Mode</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Toggle between dark slate and light layout views</p>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-xl text-xs font-bold font-orbitron bg-black/5 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-black/10 dark:border-white/10 hover:border-brand-blue/30 hover:text-brand-blue transition-all cursor-pointer flex items-center gap-2"
              >
                {theme === 'dark' ? (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>Light Mode</span>
                  </>
                )}
              </button>
            </div>
          </GlassCard>

          {/* Dangerous Area */}
          <GlassCard className="p-6 space-y-4 border border-red-500/20 bg-red-500/5">
            <h3 className="text-xs font-bold font-orbitron text-red-500 uppercase tracking-widest flex items-center gap-2 border-b border-red-500/10 pb-3">
              <ShieldAlert className="h-4.5 w-4.5" />
              <span>Danger Zone</span>
            </h3>

            {deleteStep === 0 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Removing your account deletes all saved verification history logs, profiles, and cached credentials. This process cannot be undone.
                </p>
                <button
                  onClick={() => setDeleteStep(1)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-orbitron transition-all cursor-pointer flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Account</span>
                </button>
              </div>
            )}

            {deleteStep === 1 && (
              <div className="space-y-4">
                <div className="flex gap-2.5 items-start">
                  <input
                    type="checkbox"
                    id="confirmDelete"
                    onChange={(e) => {
                      if (!e.target.checked) setDeleteStep(0);
                    }}
                    className="mt-1"
                  />
                  <label htmlFor="confirmDelete" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    I confirm that I want to delete my account and clear all local storage verifications.
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteStep(0)}
                    className="px-4 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-xs font-bold font-orbitron hover:bg-black/5 transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold font-orbitron transition-all cursor-pointer"
                  >
                    Confirm Deletion
                  </button>
                </div>
              </div>
            )}

            {deleteStep === 2 && (
              <div className="flex items-center gap-3 p-3 bg-red-500/10 text-red-500 rounded-xl text-xs font-semibold">
                <ShieldAlert className="h-4.5 w-4.5 animate-spin" />
                <span>Removing credentials from vault... Redirecting...</span>
              </div>
            )}
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: Password Vault (md:col-span-6) */}
        <div className="md:col-span-6">
          <GlassCard className="p-6 space-y-4">
            <h3 className="text-xs font-bold font-orbitron text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
              <Lock className="h-4.5 w-4.5 text-brand-purple" />
              <span>Cryptographic Cipher Update</span>
            </h3>

            {passwordError && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 text-xs font-semibold">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Old password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-orbitron uppercase">
                  Current Cipher Key
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 text-xs outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/20 transition-all"
                />
              </div>

              {/* New password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-orbitron uppercase">
                  New Cipher Key
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 text-xs outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/20 transition-all"
                />
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-orbitron uppercase">
                  Confirm New Cipher Key
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 text-xs outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/20 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white text-xs font-bold font-orbitron hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                Verify & Update Cipher
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
