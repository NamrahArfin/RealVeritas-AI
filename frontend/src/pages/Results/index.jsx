import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, ShieldAlert, Download, Share2, 
  RotateCcw, ArrowLeft, Sparkles, Check, Info,
  Video, Image, Volume2, FileText
} from 'lucide-react';
import { useVerification } from '../../context/VerificationContext';
import GlassCard from '../../components/GlassCard';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getVerification, currentResult, selectVerification } = useVerification();
  
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Load correct result based on state or context
  useEffect(() => {
    if (location.state && location.state.resultId) {
      const match = getVerification(location.state.resultId);
      if (match) {
        setResult(match);
        selectVerification(match);
      } else {
        setResult(currentResult);
      }
    } else {
      setResult(currentResult);
    }
  }, [location, currentResult, getVerification, selectVerification]);

  if (!result) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">No verification result active. Return to dashboard.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-xl">
          Dashboard
        </button>
      </div>
    );
  }

  const handleShare = () => {
    const text = `RealVeritas AI verification audit report for ${result.fileName}: Classified as ${result.classification} with ${result.confidence}% confidence (Authenticity Score: ${result.score}/100).`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setDownloading(true);
    
    // Simulate report compilation
    setTimeout(() => {
      setDownloading(false);
      
      // Simple text file compilation download
      const content = `REALVERITAS AI FORENSIC REPORT\n=============================\nFile: ${result.fileName}\nDate: ${result.date}\nMedium: ${result.fileType.toUpperCase()}\nClassification: ${result.classification.toUpperCase()}\nAuthenticity Score: ${result.score}/100\nConfidence Level: ${result.confidence}%\n\nSummary:\n${result.summary}\n\nAnomalies & Reasoning:\n${result.reasoning.map((r, i) => `${i+1}. ${r}`).join('\n')}\n\n=============================\nVerification Hash: ${Math.random().toString(36).substring(2, 15).toUpperCase()}\nRealVeritas Systems LLC.`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `veritas_report_${result.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1200);
  };

  const getClassificationStyles = (type) => {
    switch (type) {
      case 'Authentic':
        return {
          glow: 'glow-emerald border-emerald-500/20 bg-emerald-500/5',
          text: 'text-emerald-500',
          badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          icon: ShieldCheck
        };
      case 'Manipulated':
        return {
          glow: 'glow-brand-red border-red-500/20 bg-red-500/5',
          text: 'text-red-500',
          badge: 'bg-red-500/10 text-red-500 border-red-500/20',
          icon: ShieldAlert
        };
      default: // AI-Generated
        return {
          glow: 'glow-purple border-brand-purple/20 bg-brand-purple/5',
          text: 'text-brand-purple',
          badge: 'bg-brand-purple/10 text-brand-purple border-brand-purple/20',
          icon: Sparkles
        };
    }
  };

  const getCheckStatus = (item, classification) => {
    if (classification === 'Authentic') {
      return { status: 'Pass', isPass: true };
    }
    const lower = item.toLowerCase();
    if (
      lower.includes('confirmed') || 
      lower.includes('consistent') || 
      lower.includes('uniform') || 
      lower.includes('no anomalies') || 
      lower.includes('clean') || 
      lower.includes('passed') || 
      lower.includes('perfect')
    ) {
      return { status: 'Pass', isPass: true };
    }
    return { status: 'Flagged', isPass: false };
  };

  const styles = getClassificationStyles(result.classification);
  const StatusIcon = styles.icon;

  return (
    <div className="space-y-8 print:p-0 print:space-y-4">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-6 print:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/history')}
            className="p-2 rounded-xl text-slate-500 hover:text-brand-blue hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            title="Back to History"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-black font-orbitron text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Forensic Audit Report</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Forensic details for cryptographic ledger validation
            </p>
          </div>
        </div>

        {/* Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-brand-blue hover:bg-slate-200/50 dark:hover:bg-slate-800/50 font-bold font-orbitron text-[10px] tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Download className={`h-4 w-4 ${downloading ? 'animate-bounce' : ''}`} />
            <span>{downloading ? 'Compiling...' : 'Download Report'}</span>
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-brand-blue hover:bg-slate-200/50 dark:hover:bg-slate-800/50 font-bold font-orbitron text-[10px] tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] font-bold font-orbitron text-[10px] tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Audit Another</span>
          </button>
        </div>
      </div>

      {/* 2. Unified Header Section */}
      <GlassCard className={`relative overflow-hidden border ${styles.glow} p-6`}>
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-blue to-brand-purple" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* File Metadata */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-100/5 dark:bg-slate-900/50 rounded-xl border border-black/5 dark:border-white/5 shrink-0">
              {result.fileType === 'video' && <Video className="h-6 w-6 text-brand-blue" />}
              {result.fileType === 'image' && <Image className="h-6 w-6 text-brand-blue" />}
              {result.fileType === 'audio' && <Volume2 className="h-6 w-6 text-brand-blue" />}
              {result.fileType === 'text' && <FileText className="h-6 w-6 text-brand-blue" />}
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold font-orbitron text-slate-800 dark:text-slate-100 tracking-wide truncate max-w-[250px] sm:max-w-md">
                  {result.fileName}
                </h1>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider border border-black/5 dark:border-white/5">
                  {result.fileType}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Audit ID: <span className="font-mono text-slate-400 dark:text-slate-300 font-bold">{result.id}</span> • Scanned: {result.date}
              </p>
            </div>
          </div>

          {/* Core Metrics */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-10 border-t lg:border-t-0 border-black/5 dark:border-white/5 pt-4 lg:pt-0">
            
            {/* Classification State */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold font-orbitron text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Classification
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-black font-orbitron uppercase tracking-widest ${styles.badge}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                <span>{result.classification}</span>
              </span>
            </div>

            {/* Authenticity Score */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold font-orbitron text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Authenticity Score
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-orbitron text-slate-800 dark:text-slate-100">
                  {result.score}
                </span>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 font-orbitron">
                  /100
                </span>
              </div>
            </div>

            {/* Scan Confidence */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold font-orbitron text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Confidence Level
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold font-orbitron text-slate-800 dark:text-slate-100">
                  {result.confidence}%
                </span>
                <div className="w-20 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                  <div 
                    className="bg-brand-blue h-full rounded-full"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>
            </div>

          </div>

        </div>
      </GlassCard>

      {/* 3. Side-by-Side Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Visual Diagnostics (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="text-xs font-bold font-orbitron text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
              <Info className="h-4 w-4 text-brand-blue" />
              <span>Forensic Visualizations</span>
            </h3>

            {/* Image Visualizer */}
            {result.fileType === 'image' && (
              <div className="relative h-64 w-full rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-slate-900 flex items-center justify-center">
                {result.content ? (
                  <img src={result.content} alt="audit source" className="h-full w-full object-contain" />
                ) : (
                  <div className="text-slate-500 text-xs">Image File Preview</div>
                )}
                {/* Visual Heatmap Overlay */}
                {result.classification !== 'Authentic' && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-500/35 to-transparent mix-blend-overlay pointer-events-none animate-pulse" />
                )}
                {result.classification === 'Manipulated' && (
                  <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 border-2 border-dashed border-red-500 w-32 h-20 rounded shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-center pointer-events-none">
                    <span className="text-[9px] font-mono text-white bg-red-600/90 px-1 py-0.5 rounded uppercase font-bold tracking-wider">
                      Splice Overlay
                    </span>
                  </div>
                )}
                <div className="scanner-line" />
              </div>
            )}

            {/* Video Visualizer */}
            {result.fileType === 'video' && (
              <div className="space-y-4">
                <div className="relative h-48 w-full rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-slate-950 flex items-center justify-center">
                  <div className="text-center space-y-1.5 select-none z-10">
                    <Video className="h-10 w-10 text-slate-500 mx-auto" />
                    <p className="text-[10px] font-mono text-slate-400">Timeline Scanning complete</p>
                  </div>
                  {result.classification !== 'Authentic' && (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_60%,rgba(239,68,68,0.2),transparent_50%)]" />
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px]" />
                </div>
                {/* Timeline indices list */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'F-001', label: 'Frames 0-100', status: 'Passed', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/10' },
                    { id: 'F-002', label: 'Frames 100-240', status: result.classification === 'Manipulated' ? 'Failed (Lip-sync)' : 'Passed', color: result.classification === 'Manipulated' ? 'text-red-600 dark:text-red-400 bg-red-500/5 border-red-500/10' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/10' },
                    { id: 'F-003', label: 'Frames 240-360', status: result.classification !== 'Authentic' ? 'Failed (Mesh mesh)' : 'Passed', color: result.classification !== 'Authentic' ? 'text-brand-purple bg-brand-purple/5 border-brand-purple/10' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/10' },
                    { id: 'F-004', label: 'Frames 360-480', status: 'Passed', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/10' }
                  ].map((frame, idx) => (
                    <div key={idx} className={`p-2.5 rounded-lg border text-center space-y-1 ${frame.color}`}>
                      <p className="text-[9px] font-mono font-bold tracking-widest">{frame.id}</p>
                      <p className="text-[9px] truncate font-semibold">{frame.label}</p>
                      <span className="inline-block text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/15">
                        {frame.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audio Visualizer */}
            {result.fileType === 'audio' && (
              <div className="space-y-4">
                <div className="w-full h-44 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-slate-950 p-2 flex flex-col justify-between relative">
                  <div className="flex-1 flex items-end gap-[3px]">
                    {[30, 45, 80, 55, 95, 75, 40, 25, 90, 85, 12, 45, 92, 105, 115, 60, 30, 75, 88, 98, 44, 25, 65, 82, 110, 70, 45, 85, 60, 40, 95, 80, 45, 20, 70, 50, 60].map((h, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-t-sm ${
                          result.classification !== 'Authentic' && h > 90 
                            ? 'bg-gradient-to-t from-fuchsia-500 to-red-500 animate-pulse' 
                            : 'bg-gradient-to-t from-brand-blue/30 to-brand-blue'
                        }`} 
                        style={{ height: `${h}%` }} 
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[8px] font-mono text-slate-500 border-t border-white/5 pt-1 mt-1">
                    <span>100 Hz</span>
                    <span>1000 Hz</span>
                    {result.classification !== 'Authentic' && <span className="text-red-600 dark:text-red-400 font-bold uppercase tracking-widest">Phase anomalies detected</span>}
                    <span>8000 Hz</span>
                  </div>
                </div>
              </div>
            )}

            {/* Text Highlights */}
            {result.fileType === 'text' && (
              <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-slate-950 text-slate-300 font-mono text-xs leading-relaxed max-h-56 overflow-y-auto">
                {result.classification === 'AI-Generated' ? (
                  <p>
                    The integration of smart grids <span className="bg-emerald-500/20 border-b border-emerald-500 text-emerald-600 dark:text-emerald-400 px-0.5 py-0.5 rounded cursor-help" title="Burstiness deviation: 94%">represents a key technical lever</span> for renewable energy adoption. <span className="bg-purple-500/20 border-b border-brand-purple text-purple-300 px-0.5 py-0.5 rounded cursor-help" title="Perplexity matches ChatGPT model syntax (92%)">Furthermore, it is important to consider</span> that these architectures optimize distributions. In conclusion, the adoption remains vital.
                  </p>
                ) : result.classification === 'Manipulated' ? (
                  <p>
                    This statement was typed under surveillance logs. <span className="bg-red-500/20 border-b border-red-500 text-red-300 px-0.5 py-0.5 rounded cursor-help" title="Sudden writing structure delta: splicing mismatch">HOWEVER, METRIC SHIFTS ARE OBSERVED</span> in paragraph segment indices showing style alterations.
                  </p>
                ) : (
                  <p>{result.content || 'Authentic human input verified. Perplexity burstiness ranges indicate organic pacing signatures.'}</p>
                )}
              </div>
            )}

            {/* Integrity Hash Info */}
            <div className="p-3 bg-black/5 dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5 text-[9px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Audit Integrity Signature</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                VERITAS-{result.id.toUpperCase()}
              </span>
            </div>
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: Diagnostic checklist (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard className="space-y-6">
            
            {/* Header */}
            <h3 className="text-xs font-bold font-orbitron text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
              <ShieldCheck className="h-4.5 w-4.5 text-brand-purple" />
              <span>Forensic Diagnostic Report</span>
            </h3>

            {/* Summary */}
            <div className="p-4 rounded-xl border border-black/5 dark:border-white/5 bg-slate-100/30 dark:bg-slate-900/30 text-xs leading-relaxed font-medium text-slate-600 dark:text-slate-300">
              <span className="text-[9px] font-bold font-orbitron uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1.5">
                Executive Summary
              </span>
              {result.summary}
            </div>

            {/* Diagnostic checklist checklist */}
            <div className="space-y-3">
              <span className="text-[9px] font-bold font-orbitron uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1">
                System Diagnostics Checklist
              </span>
              
              {result.reasoning.map((item, idx) => {
                const checkInfo = getCheckStatus(item, result.classification);
                return (
                  <div key={idx} className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all duration-300 ${
                    checkInfo.isPass 
                      ? 'border-emerald-500/10 bg-emerald-500/5 hover:border-emerald-500/20' 
                      : 'border-red-500/10 bg-red-500/5 hover:border-red-500/20'
                  }`}>
                    <div className="space-y-1 min-w-0">
                      {item.includes(':') ? (
                        <>
                          <h4 className="text-xs font-bold font-orbitron text-slate-800 dark:text-slate-200 truncate">
                            {item.split(':')[0]}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            {item.split(':').slice(1).join(':').trim()}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                          {item}
                        </p>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-orbitron uppercase tracking-wider shrink-0 ${
                      checkInfo.isPass
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                    }`}>
                      {checkInfo.isPass ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Pass</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="h-3 w-3" />
                          <span>Flagged</span>
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

          </GlassCard>
        </div>

      </div>

    </div>
  );
};

export default Results;

