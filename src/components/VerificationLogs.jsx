import React, { useState, useEffect, useRef } from 'react';

const VerificationLogs = ({ type, onComplete }) => {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);

  const getLogLines = () => {
    const common = [
      'Establishing secure sandbox pipeline...',
      'Extracting binary metadata markers...',
      'Verifying structural file hashes...',
    ];

    const imageSpecific = [
      'Analyzing Color Filter Array (CFA) consistency...',
      'Running Photo Response Non-Uniformity (PRNU) noise algorithms...',
      'Checking JPEG quantization tables for double-compression anomalies...',
      'Calculating Error Level Analysis (ELA) pixel map deviations...',
      'Running convolutional models for GAN and diffusion trace checks...',
    ];

    const videoSpecific = [
      'Extracting frames (keyframe mapping: H.264/HEVC profile)...',
      'Running temporal face alignment (landmark jitter check)...',
      'Computing optical flow vectors between sequential frames...',
      'Scanning for facial boundary stitching artifacts on frame offsets...',
      'Evaluating lip-movement to audio phoneme synchronization patterns...',
    ];

    const audioSpecific = [
      'Decompressing audio stream and isolating sub-harmonic channels...',
      'Running Fast Fourier Transform (FFT) to compile 2D spectrogram...',
      'Analyzing high-frequency cutoffs (identifying AI vocoder traces)...',
      'Measuring pitch stability variance and micro-tremor consistency...',
      'Evaluating vocal tract resonance matches against synthetic templates...',
    ];

    const textSpecific = [
      'Tokenizing text blocks into context window indices...',
      'Calculating cumulative text Perplexity (next-token predictability)...',
      'Evaluating sentence length Burstiness profile...',
      'Scanning for repetitive transitional adverbs (statistical signature)...',
      'Cross-referencing grammatical syntax variance maps with GPT models...',
    ];

    const lines = [...common];
    if (type === 'image') lines.push(...imageSpecific);
    if (type === 'video') lines.push(...videoSpecific);
    if (type === 'audio') lines.push(...audioSpecific);
    if (type === 'text') lines.push(...textSpecific);

    lines.push('Assembling confidence evaluation metrics...', 'Generating explainable analysis reasoning matrix...', 'Redirecting to results panel...');
    return lines;
  };

  useEffect(() => {
    const logQueue = getLogLines();
    let currentLogIndex = 0;
    
    // Increment progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    // Push logs sequentially
    const logInterval = setInterval(() => {
      if (currentLogIndex < logQueue.length) {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${logQueue[currentLogIndex]}`]);
        currentLogIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 280);

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
    };
  }, [type]);

  useEffect(() => {
    if (progress === 100 && logs.length > 0) {
      const timeout = setTimeout(() => {
        if (onComplete) onComplete();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress, logs, onComplete]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      {/* Visual Scanning Progress */}
      <div className="flex items-center justify-between text-xs font-orbitron font-semibold text-brand-blue">
        <span>ANALYSIS ENGINE STATUS: PROCESSING</span>
        <span>{progress}%</span>
      </div>
      
      <div className="w-full bg-slate-200 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-brand-blue to-brand-purple h-full transition-all duration-300 shadow-[0_0_8px_rgba(14,165,233,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Terminal Screen */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-black/15 dark:border-white/10 shadow-lg">
        {/* Top title bar */}
        <div className="bg-slate-200 dark:bg-slate-900/90 px-4 py-2 border-b border-black/10 dark:border-white/5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 font-orbitron tracking-widest">
            VERITAS_AI_KERNEL_CONSOLE
          </span>
        </div>

        {/* Output lines */}
        <div 
          ref={containerRef}
          className="bg-slate-950 text-emerald-400 p-4 h-64 overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-emerald-500/20"
        >
          {logs.map((log, index) => (
            <div key={index} className="flex gap-2.5">
              <span className="text-slate-600 select-none font-orbitron">{(index + 1).toString().padStart(2, '0')}</span>
              <span className="whitespace-pre-wrap">{log}</span>
            </div>
          ))}
          <div className="flex gap-2.5 animate-pulse text-slate-500">
            <span className="select-none font-orbitron">{(logs.length + 1).toString().padStart(2, '0')}</span>
            <span>veritas-agent:~$ _</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationLogs;
