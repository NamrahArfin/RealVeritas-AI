import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Volume2, Upload, ShieldAlert, ArrowLeft, Play, Eye } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import VerificationLogs from '../../components/VerificationLogs';
import { useVerification } from '../../context/VerificationContext';
import { useAuth } from '../../context/AuthContext';

const AudioVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addVerification, globalFile, setGlobalFile } = useVerification();
  const { user } = useAuth();
  
  const [fileDetails, setFileDetails] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const [apiFinished, setApiFinished] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const fileInputRef = useRef(null);
  const fetchStarted = useRef(false);

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
      navigate('/upload', { state: { tab: 'audio' }, replace: true });
    }
  }, [location, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileDetails({ name: file.name, size: (file.size / (1024 * 1024)).toFixed(2) + ' MB' });
    setGlobalFile(file);
  };

  const triggerSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const startAnalysis = () => {
    if (!fileDetails) return;
    setIsScanning(true);
  };

  // Trigger API fetch once scanning starts
  useEffect(() => {
    if (!isScanning || apiFinished || fetchStarted.current) return;
    fetchStarted.current = true;

    const fetchVerification = async () => {
      try {
        let fileToUpload = globalFile;
        if (!fileToUpload && previewUrl && previewUrl.startsWith('blob:')) {
          const res = await fetch(previewUrl);
          const blob = await res.blob();
          fileToUpload = new File([blob], fileDetails?.name || 'audio.mp3', { type: blob.type });
        }

        if (!fileToUpload) {
          setScanResult({
            classification: 'Error: No File',
            score: 0,
            confidence: 0,
            summary: 'The file to upload was missing or lost from memory.',
            reasoning: ['globalFile was null', 'previewUrl could not be fetched']
          });
          return;
        }

        const formData = new FormData();
        formData.append('file', fileToUpload);
        if (user?.email) {
          formData.append('user_email', user.email);
        }

        const response = await fetch('http://127.0.0.1:8000/upload', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          setScanResult(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setScanResult({
            classification: `Error: HTTP ${response.status}`,
            score: 0,
            confidence: 0,
            summary: errorData.detail || 'Server rejected the file',
            reasoning: ['Backend returned an error status.']
          });
        }
      } catch (err) {
        console.error("Backend upload failed", err);
        setScanResult({
          classification: 'Error: Network/Exception',
          score: 0,
          confidence: 0,
          summary: err.message || 'Unknown network error',
          reasoning: ['Fetch threw an exception.', err.toString()]
        });
      } finally {
        setApiFinished(true);
      }
    };

    fetchVerification();
  }, [isScanning, globalFile, previewUrl, fileDetails, user]);

  // Sync animation completion and API completion
  useEffect(() => {
    if (animationDone && apiFinished) {
      const record = addVerification({
        fileName: fileDetails?.name || 'Unknown',
        fileType: 'audio',
        classification: scanResult?.classification || 'Error: Null Result',
        score: scanResult?.score || 0,
        confidence: scanResult?.confidence || 0,
        summary: scanResult?.summary || 'scanResult was undefined.',
        reasoning: scanResult?.reasoning || [],
        content: null
      });

      navigate('/results', { state: { resultId: record.id } });
    }
  }, [animationDone, apiFinished, scanResult, navigate, addVerification, fileDetails]);

  const handleScanComplete = () => {
    setAnimationDone(true);
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
            <h2 className="text-3xl font-black font-orbitron bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(14,165,233,0.3)] flex items-center gap-3">
              Audio Forensics Tool
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Check voice recordings to detect clones, artificial speech patterns, and sound edits.
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
              accept="audio/*" 
              className="hidden" 
            />

            {!fileDetails ? (
              /* Drop file locally */
              <div 
                onClick={triggerSelect}
                className="border-2 border-dashed border-black/15 dark:border-white/10 rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[280px] hover:border-fuchsia-400/50 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-all"
              >
                <div className="p-4 rounded-full bg-slate-200/50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 w-fit mx-auto mb-4 border border-black/5 dark:border-white/5">
                  <Upload className="h-8 w-8 animate-pulse" />
                </div>
                <h4 className="font-orbitron font-bold text-sm text-slate-800 dark:text-slate-100">
                  Select Audio Asset to Begin Analysis
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Supports WAV, MP3, and AAC formats up to 20MB
                </p>
              </div>
            ) : (
              /* Asset Selected State */
              <div className="space-y-6">
                {/* Simulated Waveform Preview Component */}
                <div className="relative max-w-lg mx-auto rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-slate-950 p-6 shadow-md flex flex-col justify-center gap-4">
                  {/* Waveform graphic */}
                  <div className="flex items-center justify-between gap-1.5 h-16 w-full">
                    {[3, 5, 8, 4, 11, 6, 2, 7, 10, 4, 8, 12, 14, 5, 9, 3, 6, 9, 13, 8, 4, 2, 8, 11, 5, 7, 10, 6, 3, 5].map((h, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded bg-fuchsia-500/80 transition-all duration-300 ${
                          isPlaying ? 'animate-pulse' : 'opacity-60'
                        }`}
                        style={{ height: `${h * 6}%` }}
                      />
                    ))}
                  </div>

                  {/* Audio trigger controls */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 text-[10px] font-bold font-orbitron transition-all cursor-pointer"
                    >
                      {isPlaying ? 'PAUSE PREVIEW' : 'PLAY WAVEFORM'}
                    </button>
                    <span className="text-[9px] font-mono text-slate-500">
                      Format: WAV • duration: 00:24
                    </span>
                  </div>
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
                    onClick={() => {
                      setFileDetails(null);
                      setIsPlaying(false);
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/5 text-xs font-bold font-orbitron transition-all cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                <button
                  onClick={startAnalysis}
                  className="w-full py-3.5 rounded-xl font-bold font-orbitron text-xs bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-md hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
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
          <VerificationLogs type="audio" onComplete={handleScanComplete} />
        </div>
      )}
    </div>
  );
};

export default AudioVerification;
