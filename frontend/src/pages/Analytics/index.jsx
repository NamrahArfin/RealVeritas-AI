import React, { useState } from 'react';
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
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const total = history.length;
  const manipulated = history.filter(v => v.classification?.toLowerCase().includes('manipulat')).length;
  const ai = history.filter(v => v.classification?.toLowerCase().includes('ai') && v.classification?.toLowerCase().includes('generat')).length;
  const authentic = history.filter(v => v.classification?.toLowerCase().includes('authentic')).length;

  const authPct = total ? Math.round((authentic / total) * 100) : 0;
  const manipPct = total ? Math.round((manipulated / total) * 100) : 0;
  const aiPct = total ? Math.round((ai / total) * 100) : 0;

  // Donut SVG params
  const donutRadius = 40;
  const donutStroke = 12;
  const donutCirc = 2 * Math.PI * donutRadius;
  
  // Calculate live trend data for the last 7 days
  const trendData = Array(7).fill(0);
  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);
  
  history.forEach(item => {
    const itemDate = new Date(item.date.replace(/,/, '')); 
    itemDate.setHours(0,0,0,0);
    const diffDays = Math.floor((todayDate - itemDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 0 && diffDays < 7) {
      trendData[6 - diffDays] += 1;
    }
  });

  const maxVal = Math.max(...trendData, 4); // Use 4 as minimum maxVal for better visual scaling

  const getDayLabel = (daysAgo) => {
    if (daysAgo === 0) return "Today";
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };
  const weekLabels = Array.from({length: 7}, (_, i) => getDayLabel(6 - i));
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
          { label: 'Manipulated Rate', val: `${manipPct}%`, color: 'text-amber-400' },
          { label: 'AI Generated Rate', val: `${aiPct}%`, color: 'text-red-500' }
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
                  className="hover:r-[6px] cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPoint({ ...p, val: trendData[idx], label: weekLabels[idx] })}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => navigate('/history')}
                />
              ))}

              {/* Tooltip Overlay */}
              {hoveredPoint && (
                <g className="pointer-events-none transition-all duration-200">
                  <rect 
                    x={Math.max(5, Math.min(svgWidth - 65, hoveredPoint.x - 30))}
                    y={hoveredPoint.y - 38} 
                    width="60" 
                    height="26" 
                    rx="4" 
                    fill="#0f172a" 
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  <polygon 
                    points={`${hoveredPoint.x - 4},${hoveredPoint.y - 12} ${hoveredPoint.x + 4},${hoveredPoint.y - 12} ${hoveredPoint.x},${hoveredPoint.y - 6}`}
                    fill="#0f172a"
                  />
                  <text 
                    x={Math.max(35, Math.min(svgWidth - 35, hoveredPoint.x))}
                    y={hoveredPoint.y - 21} 
                    textAnchor="middle" 
                    fill="#f8fafc" 
                    fontSize="10" 
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {hoveredPoint.val} {hoveredPoint.val === 1 ? 'scan' : 'scans'}
                  </text>
                </g>
              )}
            </svg>
          </div>

          <div className="flex justify-between text-[9px] font-mono text-slate-400 dark:text-slate-500 border-t border-black/5 dark:border-white/5 pt-2 mt-2 px-2">
            {weekLabels.map((label, idx) => (
              <span key={idx} className={idx === 6 ? "font-bold text-brand-purple" : ""}>
                {label}
              </span>
            ))}
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
                  strokeDasharray={`${(authentic / (total || 1)) * donutCirc} ${donutCirc}`}
                  strokeDashoffset={0}
                  stroke="currentColor"
                  fill="transparent"
                  r={donutRadius}
                  cx="50"
                  cy="50"
                />
                {/* Sector 2: Manipulated */}
                <circle
                  className="text-amber-400"
                  strokeWidth={donutStroke}
                  strokeDasharray={`${(manipulated / (total || 1)) * donutCirc} ${donutCirc}`}
                  strokeDashoffset={-((authentic / (total || 1)) * donutCirc)}
                  stroke="currentColor"
                  fill="transparent"
                  r={donutRadius}
                  cx="50"
                  cy="50"
                />
                {/* Sector 3: AI-Generated */}
                <circle
                  className="text-red-500"
                  strokeWidth={donutStroke}
                  strokeDasharray={`${(ai / (total || 1)) * donutCirc} ${donutCirc}`}
                  strokeDashoffset={-(((authentic + manipulated) / (total || 1)) * donutCirc)}
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
            <div className="flex justify-between items-center text-amber-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                <span>Manipulated</span>
              </span>
              <span>{manipPct}%</span>
            </div>
            <div className="flex justify-between items-center text-red-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                <span>AI-Generated</span>
              </span>
              <span>{aiPct}%</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity Logs removed as requested */}

    </div>
  );
};

export default Analytics;
