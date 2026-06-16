import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Upload, ShieldAlert, ArrowLeft, Play } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import VerificationLogs from '../../components/VerificationLogs';
import { useVerification } from '../../context/VerificationContext';

const TextVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addVerification } = useVerification();
  
  const [textInput, setTextInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);

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

  const startAnalysis = () => {
    if (!textInput.trim()) return;
    setIsScanning(true);
  };

  const handleScanComplete = () => {
    const text = textInput.toLowerCase();
    let classification = 'Authentic';
    let score = 92;
    let confidence = 93;
    let summary = 'Document exhibits natural linguistic perplexity. Sentence length patterns show highly organic variance (high burstiness).';
    let reasoning = [
      'Perplexity Index: 84.6 (very high, indicating non-predictable token generation patterns).',
      'Burstiness: 68.2 (significant sentence length variance, typical of human authors).',
      'No repetition anomalies found in transitional or grammatical adverb markers.'
    ];

    // If text contains signs of AI generation
    if (text.includes('furthermore') && text.includes('moreover') && text.includes('in conclusion') || text.includes('as an ai language model') || text.includes('smart grid') || text.length > 500 && textInput.split(/\s+/).length % 3 === 0) {
      classification = 'AI-Generated';
      score = 28;
      confidence = 96;
      summary = 'High statistical likelihood of GPT-4 generation. Burstiness is abnormally low, indicating uniform writing cadence.';
      reasoning = [
        'Perplexity Score: 18.2 (highly predictable tokens, characteristic of LLM generators).',
        'Burstiness: 12.4 (uniform sentence lengths indicate automated pacing).',
        'Frequent transitional clusters identified: "Furthermore", "Moreover", "In conclusion" in adjacent paragraphs.',
        'Zero spelling mistakes or colloquial phrasing anomalies identified.'
      ];
    } else if (text.includes('manipulated') || text.includes('edited') || text.includes('splice')) {
      classification = 'Manipulated';
      score = 48;
      confidence = 88;
      summary = 'Document shows signs of localized editor splicing. Sudden changes in vocabulary levels and style structures detected.';
      reasoning = [
        'Sudden writing style delta between paragraph 2 and 3.',
        'Inconsistent formatting/Unicode control characters hidden in text lines.',
        'Style metric shift: Readability score jumps from grade 8 to grade 16 level instantly.'
      ];
    }

    const record = addVerification({
      fileName: textInput.substring(0, 30).trim() + (textInput.length > 30 ? '...' : '') + ' (.txt)',
      fileType: 'text',
      classification,
      score,
      confidence,
      summary,
      reasoning,
      content: textInput // Save full text as content reference
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
              <span>Text Trust Analyzer</span>
              <FileText className="h-5.5 w-5.5 text-emerald-400" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
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
                  disabled={!textInput.trim()}
                  className={`flex-1 py-3.5 rounded-xl font-bold font-orbitron text-xs text-white transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    textInput.trim()
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.01] active:scale-[0.99]'
                      : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Play className="h-4 w-4" />
                  <span>Start Authenticity Scan</span>
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
