import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { Mail, ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please provide your access email address.');
      return;
    }

    if (!email.includes('@')) {
      setError('Invalid email address formatting.');
      return;
    }

    try {
      const res = resetPassword(email);
      if (res.success) {
        setSuccess(res.message);
        setEmail('');
      }
    } catch (err) {
      setError('Internal server recovery sequence failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12 flex items-center justify-center min-h-[75vh]">
      <GlassCard className="w-full relative overflow-hidden p-8">
        {/* Top visual glow bar */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-blue to-brand-purple" />
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-brand-blue transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
              <span>Back to Login</span>
            </Link>
            <h1 className="font-orbitron font-extrabold text-xl tracking-wider text-slate-800 dark:text-slate-100">
              Recover Cipher Key
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Enter your email to request temporary access credentials
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 text-xs font-semibold">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-orbitron uppercase">
                Access Email
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 text-sm outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/30 transition-all font-medium"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold font-orbitron text-xs bg-gradient-to-r from-brand-blue to-brand-purple text-white shadow-md hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
            >
              Send Recovery Cipher
            </button>
          </form>
        </div>
      </GlassCard>
    </div>
  );
};

export default ForgotPassword;
