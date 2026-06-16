import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Image, Video, Volume2, FileText, ArrowRight, Sparkles, Activity
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { useVerification } from '../../context/VerificationContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { history } = useVerification();
  const navigate = useNavigate();

  // Statistics calculations based on loaded history context
  const totalVerifications = history.length;
  const manipulatedCount = history.filter(v => v.classification === 'Manipulated').length;
  const aiCount = history.filter(v => v.classification === 'AI-Generated').length;
  const authenticCount = history.filter(v => v.classification === 'Authentic').length;

  const coreModules = [
    { 
      title: 'Image Verification', 
      desc: 'Verify image authenticity, metadata, and splice overlays.', 
      path: '/upload', 
      state: { tab: 'image' },
      icon: Image, 
      color: 'text-sky-500', 
      bg: 'bg-sky-500/5',
      borderColor: 'border-sky-500/10'
    },
    { 
      title: 'Video Verification', 
      desc: 'Analyze video frames for deepfakes and facial edits.', 
      path: '/upload', 
      state: { tab: 'video' },
      icon: Video, 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-500/5',
      borderColor: 'border-indigo-500/10'
    },
    { 
      title: 'Audio Verification', 
      desc: 'Detect synthetic speech and voice clones.', 
      path: '/upload', 
      state: { tab: 'audio' },
      icon: Volume2, 
      color: 'text-fuchsia-500', 
      bg: 'bg-fuchsia-500/5',
      borderColor: 'border-fuchsia-500/10'
    },
    { 
      title: 'Text Verification', 
      desc: 'Inspect written content for AI generation signs.', 
      path: '/upload', 
      state: { tab: 'text' },
      icon: FileText, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/5',
      borderColor: 'border-emerald-500/10'
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Welcome Header */}
      <div className="border-b border-black/5 dark:border-white/5 pb-6">
        <h2 className="text-xl md:text-2xl font-black font-orbitron text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>Welcome, {user?.name || 'User'}</span>
          <Sparkles className="h-5 w-5 text-brand-blue" />
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Verify the authenticity of your digital media assets.
        </p>
      </div>

      {/* 2. Quick stats banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Analyses', val: totalVerifications, desc: 'Logged queries' },
          { label: 'Authentic Rate', val: `${totalVerifications ? Math.round((authenticCount / totalVerifications) * 100) : 0}%`, desc: 'Verified true' },
          { label: 'Manipulated Flagged', val: manipulatedCount, desc: 'Splice/Face-swap' },
          { label: 'Generative Flagged', val: aiCount, desc: 'AI-Generated' }
        ].map((stat, idx) => (
          <GlassCard key={idx} className="p-4 flex flex-col justify-between min-h-[90px]">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold font-orbitron uppercase tracking-wider">
              {stat.label}
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black font-orbitron text-slate-800 dark:text-slate-100">
                {stat.val}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate font-semibold">
                {stat.desc}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* 3. Primary Verification Portals */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold font-orbitron text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Activity className="h-4 w-4 text-brand-blue" />
          <span>Verification Modules</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coreModules.map((item, idx) => {
            const Icon = item.icon;
            return (
              <GlassCard 
                key={idx}
                hoverGlow={true}
                onClick={() => navigate(item.path, { state: item.state })}
                className={`flex flex-col justify-between min-h-[160px] border-l-4 border-l-brand-blue ${item.borderColor} cursor-pointer group`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-orbitron font-extrabold text-base text-slate-800 dark:text-slate-100 group-hover:text-brand-blue transition-colors">
                      {item.title}
                    </h4>
                    <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-slate-400">
                    Accuracy Rate: 98%
                  </span>
                  <div className="text-xs font-bold font-orbitron text-brand-blue flex items-center gap-1.5 transition-colors group-hover:text-brand-purple">
                    <span>Scan Media</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* 5. Quick activity summary */}
      {history.length > 0 && (
        <GlassCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-brand-purple animate-pulse"></div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Latest analysis: <strong className="font-bold font-orbitron">{history[0].fileName}</strong> was flagged as <strong className={`${history[0].classification === 'Authentic' ? 'text-emerald-500' : 'text-red-500'}`}>{history[0].classification}</strong>.
            </span>
          </div>
          <Link 
            to="/history" 
            className="text-xs font-bold font-orbitron text-brand-blue hover:text-brand-purple flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>View History logs</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </GlassCard>
      )}

    </div>
  );
};

export default Dashboard;
