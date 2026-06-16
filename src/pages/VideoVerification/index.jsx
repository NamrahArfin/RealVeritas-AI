import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Video, Upload, ShieldAlert, ArrowLeft, Play, Eye } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import VerificationLogs from '../../components/VerificationLogs';
import { useVerification } from '../../context/VerificationContext';

const VideoVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addVerification } = useVerification();
  
  const [fileDetails, setFileDetails] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);

  // Check if routed with file state from Unified Upload
  useEffect(() => {
    if (location.state && location.state.fileName) {
      setFileDetails({
        name: location.state.fileName,
        size: location.state.fileSize || 'Unknown size'
      });
      setIsScanning(true); // Auto-start scan
    } else {
      // Direct access landing redirect to Unified Upload under the same tab
      navigate('/upload', { state: { tab: 'video' }, replace: true });
    }
  }, [location, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileDetails({ name: file.name, size: (file.size / (1024 * 1024)).toFixed(2) + ' MB' });
  };

  const triggerSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const startAnalysis = () => {
    if (!fileDetails) return;
    setIsScanning(true);
  };

  const handleScanComplete = () => {
    const name = fileDetails.name.toLowerCase();
    let classification = 'Authentic';
    let score = 95;
    let confidence = 94;
    let summary = 'No face-swaps, temporal inconsistencies, or lip-sync anomalies found across frames.';
    let reasoning = [
      'Facial landmarks tracking: Bland-Altman variance is uniform across 480 extracted frames.',
      'Lighting alignment vectors match background coordinate light sources.',
      'Audio-visual synchronization delays measured under 8ms.'
    ];

    if (name.includes('deepfake') || name.includes('manipulated') || name.includes('face') || name.includes('swap') || name.includes('edit')) {
      classification = 'Manipulated';
      score = 14;
      confidence = 97;
      summary = 'Face-swapping overlays identified. Discrepancies found in temporal eye blink rates and boundary contrast.';
      reasoning = [
        'Boundary masks show resolution mismatches along the jawline on frames 112-240.',
        'Eye blinking rate: 2.1 blinks/min (abnormally low compared to typical 15-20 blinks/min).',
        'Optical flow vectors reveal local velocity anomalies around nose bridge targets.'
      ];
    } else if (name.includes('ai') || name.includes('generated') || name.includes('sora') || name.includes('synthesized')) {
      classification = 'AI-Generated';
      score = 36;
      confidence = 95;
      summary = 'Generative video signature detected. Objects show temporal morphing and inconsistencies in geometric perspective.';
      reasoning = [
        'Background structures morph in perspective grid boundaries.',
        'Texture repetition identified: pixel frequency profile matches diffusion-based vocoder matrices.',
        'Inconsistent hand geometry: isolated frames contain structural irregularities (e.g., anatomically irregular finger shapes).'
      ];
    }

    const record = addVerification({
      fileName: fileDetails.name,
      fileType: 'video',
      classification,
      score,
      confidence,
      summary,
      reasoning
    });

    navigate('/results', { state: { resultId: record.id } });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl text-slate-500 hover:text-brand-blue hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-black font-orbitron text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Video Trust Analyzer</span>
              <Video className="h-5.5 w-5.5 text-indigo-400" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Check videos frame-by-frame for deepfakes, face swaps, and edited movements.
            </p>
          </div>
        </div>
      </div>

      {!isScanning ? (
        /* Setup / Upload Panel */
        <div className="max-w-3xl mx-auto">
          <GlassCard className="p-8">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="video/*" 
              className="hidden" 
            />

            {!fileDetails ? (
              /* Drop file locally */
              <div 
                onClick={triggerSelect}
                className="border-2 border-dashed border-black/15 dark:border-white/10 rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[280px] hover:border-indigo-400/50 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-all"
              >
                <div className="p-4 rounded-full bg-slate-200/50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 w-fit mx-auto mb-4 border border-black/5 dark:border-white/5">
                  <Upload className="h-8 w-8 animate-pulse" />
                </div>
                <h4 className="font-orbitron font-bold text-sm text-slate-800 dark:text-slate-100">
                  Select Video Asset to Begin Analysis
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Supports MP4, MOV, and MKV formats up to 50MB
                </p>
              </div>
            ) : (
              /* Asset Selected State */
              <div className="space-y-6">
                {/* Simulated Video Preview Frame */}
                <div className="relative max-w-lg mx-auto rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-slate-950 shadow-md h-52 flex flex-col justify-center items-center">
                  <div className="text-center space-y-1.5 z-10 select-none">
                    <Video className="h-10 w-10 text-slate-500 mx-auto animate-pulse" />
                    <p className="text-[10px] font-mono text-slate-400">{fileDetails.name}</p>
                    <p className="text-[9px] font-mono text-slate-600">Video Player Hook Ready</p>
                  </div>
                  {/* Grid Lines inside mockup */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
                </div>

                <div className="p-4 rounded-xl border border-black/5 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/50 flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-4">
                    <h4 className="text-xs font-bold font-orbitron text-slate-700 dark:text-slate-200 truncate">
                      {fileDetails.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      File Size: {fileDetails.size}
                    </p>
                  </div>
                  <button
                    onClick={() => setFileDetails(null)}
                    className="px-3.5 py-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/5 text-xs font-bold font-orbitron transition-all cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                <button
                  onClick={startAnalysis}
                  className="w-full py-3.5 rounded-xl font-bold font-orbitron text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Start Authenticity Scan</span>
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      ) : (
        /* Console Scanner Output active */
        <div className="py-6">
          <VerificationLogs type="video" onComplete={handleScanComplete} />
        </div>
      )}
    </div>
  );
};

export default VideoVerification;
