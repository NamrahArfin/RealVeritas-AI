import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVerification } from '../../context/VerificationContext';
import GlassCard from '../../components/GlassCard';
import { User, Mail, Calendar, CheckCircle2, ShieldAlert, Sparkles, Edit2, Check } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { history } = useVerification();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email) {
      setError('Please populate both Name and Email fields.');
      return;
    }

    if (!email.includes('@')) {
      setError('Invalid email address formatting.');
      return;
    }

    const res = updateProfile(name, email);
    if (res.success) {
      setSuccess('Profile updated successfully.');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError('Unable to update profile credentials.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-black/5 dark:border-white/5 pb-6">
        <h2 className="text-xl md:text-2xl font-black font-orbitron text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>Profile Settings</span>
          <User className="h-5.5 w-5.5 text-brand-blue" />
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Manage your account properties, details, and inspect system audit statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Avatar Card (md:col-span-4) */}
        <GlassCard className="md:col-span-4 text-center space-y-4 py-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-blue to-brand-purple" />
          
          <div className="relative inline-block mx-auto">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue to-brand-purple rounded-full blur-[10px] opacity-20" />
            <img 
              src={user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'} 
              alt="avatar" 
              className="h-24 w-24 rounded-full border border-black/15 dark:border-white/20 bg-slate-100 dark:bg-slate-900 mx-auto relative z-10"
            />
          </div>

          <div className="space-y-1">
            <h3 className="font-orbitron font-black text-lg text-slate-800 dark:text-slate-100">
              {user?.name}
            </h3>
            <span className="inline-block px-2.5 py-0.5 rounded-full border border-brand-blue/20 bg-brand-blue/5 text-[9px] font-bold font-orbitron text-brand-blue uppercase tracking-widest">
              Verified Member
            </span>
          </div>

          <div className="border-t border-black/5 dark:border-white/5 pt-4 text-left text-[10px] text-slate-400 dark:text-slate-500 font-semibold space-y-3 pl-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>Joined: {user?.joinDate || 'June 14, 2026'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Verifications Completed: {history.length + (user?.verificationCount || 0)}</span>
            </div>
          </div>
        </GlassCard>

        {/* Right: Editable profile details (md:col-span-8) */}
        <div className="md:col-span-8 space-y-6">
          <GlassCard className="p-6">
            <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-3 mb-6">
              <h3 className="text-xs font-bold font-orbitron text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-brand-purple" />
                <span>Configuration Credentials</span>
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold font-orbitron text-brand-blue hover:text-brand-purple flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 text-xs font-semibold mb-4">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Name field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-orbitron uppercase">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all font-medium ${
                      isEditing 
                        ? 'border-black/15 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 focus:border-brand-blue/50'
                        : 'border-transparent bg-transparent text-slate-600 dark:text-slate-300 font-semibold pl-11'
                    }`}
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-orbitron uppercase">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all font-medium ${
                      isEditing 
                        ? 'border-black/15 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 focus:border-brand-blue/50'
                        : 'border-transparent bg-transparent text-slate-600 dark:text-slate-300 font-semibold pl-11'
                    }`}
                  />
                </div>
              </div>

              {/* Editable CTA button */}
              {isEditing && (
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user?.name || '');
                      setEmail(user?.email || '');
                      setError('');
                    }}
                    className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold font-orbitron hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white text-xs font-bold font-orbitron hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
