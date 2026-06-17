import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Activity, PieChart, TrendingUp, 
  ArrowRight, ShieldCheck, ShieldAlert, Sparkles, HelpCircle
} from 'lucide-react';
import { useVerification } from '../../context/VerificationContext';
import GlassCard from '../../components/GlassCard';

const Analytics = () => {
  const navigate = useNavigate();
  const { history } = useVerification();

  const total = history.length;
  const manipulated = history.filter(v => v.classification === 'Manipulated').length;
  const ai = history.filter(v => v.classification === 'AI-Generated').length;
  const authentic = history.filter(v => v.classification === 'Authentic').length;

  const authPct = total ? Math.round((authentic / total) * 100) : 0;
  const manipPct = total ? Math.round((manipulated / total) * 100) : 0;
  const aiPct = total ? Math.round((ai / total) * 100) : 0;

  // Donut SVG params
  const donutRadius = 40;
  const donutStroke = 12;
  const donutCirc = 2 * Math.PI * donutRadius;
  
  // Calculate stroke offsets for donut segments
  const authOffset = donutCirc;
  const manipOffset = donutCirc - (authentic / (total || 1)) * donutCirc;
  const aiOffset = manipOffset - (manipulated / (total || 1)) * donutCirc;

  // Trend SVG parameters (Monday - Sunday)
  const trendData = [3, 7, 5, 12, 8, 14, total + 5]; // simulated dynamic trend scaling with history size
  const maxVal = Math.max(...trendData);
  const svgWidth = 500;
  const svgHeight = 150;
  const padding = 20;

  // Compute points for SVG Polyline/Path
  const points = trendData.map((val, idx) => {
    const x = padding + (idx * (svgWidth - 2 * padding)) / (trendData.length - 1);
    const y = svgHeight - padding - (val / maxVal) * (svgHeight - 2 * padding);
    return { x, y };
  });

  const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-black/5 dark:border-white/5 pb-6">
        <h2 className="text-xl md:text-2xl font-black font-orbitron text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>Forensic Performance Analytics</span>
          <BarChart3 className="h-5.5 w-5.5 text-brand-purple" />
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Statistical modeling profiles showing classification distributions and detection trends.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Analyses', val: total, color: 'text-brand-blue' },
          { label: 'Authentic Index', val: `${authPct}%`, color: 'text-emerald-500' },
          { label: 'Manipulated Rate', val: `${manipPct}%`, color: 'text-red-500' },
          { label: 'Synthetic AI Rate', val: `${aiPct}%`, color: 'text-brand-purple' }
        ].map((kpi, idx) => (
          <GlassCard key={idx} className="p-5 flex flex-col justify-between min-h-[100px]">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold font-orbitron uppercase tracking-wider">
              {kpi.label}
            </span>
            <span className={`text-3xl font-black font-orbitron mt-2 ${kpi.color}`}>
              {kpi.val}
            </span>
          </GlassCard>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Trend Graph (lg:col-span-8) */}
        <GlassCard className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
            <h3 className="text-xs font-bold font-orbitron text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-brand-blue" />
              <span>Verification Volume Trend</span>
            </h3>
            <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase">Weekly Cycle</span>
          </div>

          {/* SVG Area Chart */}
          <div className="w-full overflow-hidden">
            <svg 
              className="w-full h-auto text-brand-blue" 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(14, 165, 233, 0.25)" />
                  <stop offset="100%" stopColor="rgba(14, 165, 233, 0)" />
                </linearGradient>
              </defs>
              {/* Horizontal grid lines */}
              {[0.25, 0.5, 0.75, 1].map((r, i) => (
                <line 
                  key={i} 
                  x1={padding} 
                  y1={padding + r * (svgHeight - 2 * padding)} 
                  x2={svgWidth - padding} 
                  y2={padding + r * (svgHeight - 2 * padding)} 
                  stroke="currentColor" 
                  className="opacity-[0.05]"
                  strokeWidth="1"
                />
              ))}

              {/* Area path */}
              <path d={areaD} fill="url(#areaGrad)" />

              {/* Line path */}
              <path d={pathD} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Highlight circles */}
              {points.map((p, idx) => (
                <circle 
                  key={idx} 
                  cx={p.x} 
                  cy={p.y} 
                  r="4" 
                  fill={idx === points.length - 1 ? '#a855f7' : '#0ea5e9'} 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  className="hover:r-6 cursor-pointer"
                />
              ))}
            </svg>
          </div>

          <div className="flex justify-between text-[9px] font-mono text-slate-400 dark:text-slate-500 border-t border-black/5 dark:border-white/5 pt-2 mt-2">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span className="font-bold text-brand-purple">Today (Audit)</span>
          </div>
        </GlassCard>

        {/* Right: Category Distribution Donut (lg:col-span-4) */}
        <GlassCard className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
            <h3 className="text-xs font-bold font-orbitron text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <PieChart className="h-4.5 w-4.5 text-brand-purple" />
              <span>Classification Mappings</span>
            </h3>
          </div>

          {total > 0 ? (
            <div className="relative flex items-center justify-center h-40 w-40 mx-auto">
              <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                {/* Sector 1: Authentic */}
                <circle
                  className="text-emerald-500"
                  strokeWidth={donutStroke}
                  strokeDasharray={donutCirc}
                  strokeDashoffset={0}
                  stroke="currentColor"
                  fill="transparent"
                  r={donutRadius}
                  cx="50"
                  cy="50"
                />
                {/* Sector 2: Manipulated */}
                <circle
                  className="text-red-500"
                  strokeWidth={donutStroke}
                  strokeDasharray={donutCirc}
                  strokeDashoffset={authOffset - (authentic / total) * donutCirc}
                  stroke="currentColor"
                  fill="transparent"
                  r={donutRadius}
                  cx="50"
                  cy="50"
                />
                {/* Sector 3: AI-Generated */}
                <circle
                  className="text-brand-purple"
                  strokeWidth={donutStroke}
                  strokeDasharray={donutCirc}
                  strokeDashoffset={donutCirc - (ai / total) * donutCirc}
                  stroke="currentColor"
                  fill="transparent"
                  r={donutRadius}
                  cx="50"
                  cy="50"
                />
              </svg>

              <div className="absolute text-center">
                <span className="text-xl font-black font-orbitron text-slate-800 dark:text-slate-100">
                  {total}
                </span>
                <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 font-orbitron uppercase">
                  Analyses
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500">
              No distribution data logged.
            </div>
          )}

          {/* Color Indicators Legend */}
          <div className="space-y-2 text-[10px] font-semibold font-orbitron border-t border-black/5 dark:border-white/5 pt-4">
            <div className="flex justify-between items-center text-emerald-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Authentic</span>
              </span>
              <span>{authPct}%</span>
            </div>
            <div className="flex justify-between items-center text-red-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                <span>Manipulated</span>
              </span>
              <span>{manipPct}%</span>
            </div>
            <div className="flex justify-between items-center text-brand-purple">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-purple"></span>
                <span>AI-Generated</span>
              </span>
              <span>{aiPct}%</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity List logs */}
      {history.length > 0 && (
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
            <h3 className="text-xs font-bold font-orbitron text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-brand-blue" />
              <span>Recent Detection Log Ticks</span>
            </h3>
            <button
              onClick={() => navigate('/history')}
              className="text-[10px] font-bold font-orbitron text-brand-blue hover:text-brand-purple flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Full Archive</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-black/5 dark:divide-white/5">
            {history.slice(0, 3).map((item, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0 text-xs">
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.fileName}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{item.date} • {item.fileType.toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2 py-0.5 rounded border text-[9px] font-bold font-orbitron uppercase ${
                    item.classification === 'Authentic' 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : item.classification === 'Manipulated' 
                      ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                      : 'bg-brand-purple/10 text-brand-purple border-brand-purple/20'
                  }`}>
                    {item.classification}
                  </span>
                  <span className="font-mono text-slate-400 dark:text-slate-500 select-none">Score: {item.score}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

    </div>
  );
};

export default Analytics;
