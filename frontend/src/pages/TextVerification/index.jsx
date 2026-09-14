import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Upload, ShieldAlert, ArrowLeft, Play } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import VerificationLogs from '../../components/VerificationLogs';
import { useVerification } from '../../context/VerificationContext';
import { useAuth } from '../../context/AuthContext';

const TextVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addVerification } = useVerification();
  const { user } = useAuth();
  
  const [textInput, setTextInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [apiFinished, setApiFinished] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const fetchStarted = useRef(false);

  // Check if routed with text state from Unified Upload
  useEffect(() => {
    if (location.state && location.state.text) {
      setTextInput(location.state.text);
      setIsScanning(true); // Auto-start scan
    } else {
      // Direct access landing redirect to Unified Upload under the same tab
      navigate('/upload', { state: { tab: 'text' }, replace: true });
    }
  }, [location, navigate]);

  // Trigger API fetch once scanning starts
  useEffect(() => {
    if (!isScanning || apiFinished || fetchStarted.current) return;
    fetchStarted.current = true;
    
    let isMounted = true;
    const fetchVerification = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/verify/text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            text: textInput,
            user_email: user?.email 
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setScanResult(data);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          if (isMounted) {
            setScanResult({
              classification: `Error: HTTP ${response.status}`,
              score: 0,
              confidence: 0,
              summary: errorData.detail || 'Server rejected the text',
              reasoning: ['Backend returned an error status.']
            });
          }
        }
      } catch (err) {
        console.error('Text verification failed:', err);
        if (isMounted) {
          setScanResult({
            classification: 'Error: Network/Exception',
            score: 0,
            confidence: 0,
            summary: err.message || 'Unknown network error',
            reasoning: ['Fetch threw an exception.', err.toString()]
          });
        }
      } finally {
        if (isMounted) {
          setApiFinished(true);
        }
      }
    };
    
    fetchVerification();
    return () => {
      isMounted = false;
    };
  }, [isScanning, textInput, apiFinished, user]);

  // Sync animation completion and API completion
  useEffect(() => {
    if (animationDone && apiFinished) {
      const record = addVerification({
        fileName: textInput.substring(0, 30).trim() + (textInput.length > 30 ? '...' : '') + ' (.txt)',
        fileType: 'text',
        classification: scanResult?.classification || 'Error: Null Result',
        score: scanResult?.score || 0,
        confidence: scanResult?.confidence || 0,
        summary: scanResult?.summary || 'scanResult was undefined.',
        reasoning: scanResult?.reasoning || [],
        content: textInput, // Save full text
        highlights: scanResult?.highlights || []
      });
      navigate('/results', { state: { resultId: record.id } });
    }
  }, [animationDone, apiFinished, scanResult, navigate, addVerification, textInput]);

  const startAnalysis = () => {
    if (!textInput.trim()) return;
    setApiFinished(false);
    setAnimationDone(false);
    setScanResult(null);
    setIsScanning(true);
  };

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
              Text & Article Verification
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Check articles and documents to detect AI-generated phrasing, predictability patterns, and style changes.
            </p>
          </div>
        </div>
      </div>

      {!isScanning ? (
        /* Setup / Input Panel */
        <div className="max-w-3xl mx-auto">
          <GlassCard className="p-8">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-orbitron uppercase">
                  Paste Document Content
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste or enter text passages to scan for machine-generation signatures..."
                  className="w-full h-64 p-4 rounded-xl border border-black/15 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 text-sm outline-none focus:border-emerald-500/50 transition-all font-sans leading-relaxed resize-none"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  <span>Passage length: {textInput.length} characters</span>
                  <span>Words count: {textInput.split(/\s+/).filter(Boolean).length}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setTextInput('')}
                  disabled={!textInput}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold font-orbitron border transition-all cursor-pointer ${
                    textInput 
                      ? 'border-red-500/20 text-red-500 hover:bg-red-500/5' 
                      : 'border-black/5 dark:border-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  Clear Input
                </button>
                <button
                  onClick={startAnalysis}
                  disabled={!textInput.trim() || textInput.split(/\s+/).filter(Boolean).length < 10}
                  className={`flex-1 py-3.5 rounded-xl font-bold font-orbitron text-xs text-white transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    textInput.trim() && textInput.split(/\s+/).filter(Boolean).length >= 10
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.01] active:scale-[0.99]'
                      : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Play className="h-4 w-4" />
                  <span>
                    {(textInput.trim().length > 0 && textInput.split(/\s+/).filter(Boolean).length < 10)
                      ? 'Requires 10+ Words' 
                      : 'Start Authenticity Scan'}
                  </span>
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      ) : (
        /* Console Scanner Output active */
        <div className="py-6">
          <VerificationLogs type="text" onComplete={handleScanComplete} />
        </div>
      )}
    </div>
  );
};

export default TextVerification;
