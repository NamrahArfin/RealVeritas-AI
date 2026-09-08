import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Image, Video, Volume2, FileText, ArrowRight, Sparkles, Activity, ShieldAlert
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
  const manipulatedCount = history.filter(v => v.classification?.toLowerCase().includes('manipulat')).length;
  const aiCount = history.filter(v => v.classification?.toLowerCase().includes('ai') && v.classification?.toLowerCase().includes('generat')).length;
  const authenticCount = history.filter(v => v.classification?.toLowerCase().includes('authentic')).length;

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* 1. Welcome Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between border-b border-black/5 dark:border-white/5 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-black font-orbitron bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(14,165,233,0.3)] flex items-center gap-3">
            Forensic Dashboard
          </h2>
          <p className="text-sm text-slate-400 mt-2 font-medium flex items-center gap-2">
            Welcome back, Agent {user?.name?.toUpperCase() || 'ELARA'}! 
            <span className="text-emerald-400 flex items-center gap-1.5 ml-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
              (Status: Online)
            </span>
          </p>
        </div>
        <div className="hidden md:flex text-right text-xs text-slate-500 font-mono">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} | {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </motion.div>

      {/* 2. Top Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Investigations */}
        <div className="glass-panel-light dark:glass-panel-dark rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-blue/10 rounded-full blur-3xl group-hover:bg-brand-blue/20 transition-all" />
          <h3 className="text-xs font-bold font-orbitron text-slate-400 uppercase tracking-widest mb-4">Verification Modules</h3>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-black font-orbitron text-slate-800 dark:text-white drop-shadow-md dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{coreModules.length}</span>
            <span className="text-brand-emerald text-sm font-bold mb-1 flex items-center">+Active</span>
          </div>
          <div className="mt-4 h-12 w-full flex items-end gap-1">
            {[40, 70, 45, 90, 65, 85, 55, 100].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="flex-1 bg-gradient-to-t from-brand-blue to-brand-purple rounded-t-sm opacity-80"
              />
            ))}
          </div>
        </div>

        {/* Media Analyzed Today */}
        <div className="glass-panel-light dark:glass-panel-dark rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-purple/10 rounded-full blur-3xl group-hover:bg-brand-purple/20 transition-all" />
          <h3 className="text-xs font-bold font-orbitron text-slate-400 uppercase tracking-widest mb-4">Media Analyzed Total</h3>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-black font-orbitron text-slate-800 dark:text-white drop-shadow-md dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{totalVerifications}</span>
            <span className="text-brand-emerald text-sm font-bold mb-1 flex items-center">+Scans</span>
          </div>
          <div className="mt-6 flex items-center gap-4 text-[10px] font-medium font-orbitron tracking-wide">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              Authentic ({authenticCount})
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              Manipulated ({manipulatedCount})
            </div>
            <div className="flex items-center gap-1.5 text-brand-purple">
              <span className="h-2 w-2 rounded-full bg-brand-purple shadow-[0_0_8px_#6366f1]" />
              AI ({aiCount})
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="glass-panel-light dark:glass-panel-dark rounded-2xl p-6 relative overflow-hidden group">
          <h3 className="text-xs font-bold font-orbitron text-slate-400 uppercase tracking-widest mb-4">System Health</h3>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-black font-orbitron text-slate-800 dark:text-white drop-shadow-md dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">98.6%</span>
          </div>
          <div className="mt-8 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '98.6%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-brand-blue via-brand-purple to-brand-emerald shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            />
          </div>
        </div>
      </motion.div>

      {/* 3. Primary Verification Portals (Replaces middle row) */}
      <motion.div variants={itemVariants} className="space-y-4 pt-4">
        <h3 className="text-xs font-bold font-orbitron text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-purple" />
          <span>Launch Investigation</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coreModules.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={idx}
                onClick={() => navigate(item.path, { state: item.state })}
                className="glass-panel-light dark:glass-panel-dark rounded-2xl p-6 cursor-pointer group relative overflow-hidden border border-white/5 hover:border-brand-blue/30 transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(14,165,233,0.15)]"
              >
                {/* Scanner sweep effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                
                <div className="relative z-10 flex items-start gap-4">
                  <div className={`p-4 rounded-2xl ${item.bg} border ${item.borderColor} shadow-inner`}>
                    <Icon className={`h-8 w-8 ${item.color} drop-shadow-[0_0_8px_currentColor]`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-orbitron font-extrabold text-lg text-white group-hover:text-brand-blue transition-colors mb-2">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                    <div className="mt-4 flex items-center text-xs font-bold font-orbitron text-brand-blue gap-2 group-hover:text-brand-purple transition-colors">
                      <span>START SCAN</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* 4. Recent Activity Log */}
      <motion.div variants={itemVariants} className="pt-4">
        <h3 className="text-xs font-bold font-orbitron text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-brand-emerald" />
          <span>Recent Analyses</span>
        </h3>
        
        <div className="glass-panel-light dark:glass-panel-dark rounded-2xl border border-white/5 overflow-hidden">
          {history.length > 0 ? (
            <div className="divide-y divide-white/5">
              {history.slice(0, 3).map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      item.classification.includes('Authentic') 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {item.classification.includes('Authentic') ? <ShieldAlert className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white truncate max-w-[200px] md:max-w-xs">{item.fileName}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-orbitron border ${
                      item.classification.includes('Authentic')
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        : 'border-red-500/30 text-red-400 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                    }`}>
                      {item.classification}
                    </span>
                    <Link to="/history" className="text-xs font-medium text-brand-blue hover:text-white px-3 py-1.5 rounded-lg border border-brand-blue/30 hover:bg-brand-blue/20 transition-colors">
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              No recent analyses found. Upload media to begin.
            </div>
          )}
          <div className="p-3 border-t border-white/5 bg-black/20 text-center">
            <Link to="/history" className="text-xs font-bold font-orbitron text-slate-400 hover:text-white transition-colors">
              VIEW ALL HISTORY
            </Link>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default Dashboard;
