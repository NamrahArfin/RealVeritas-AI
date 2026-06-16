import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Image, Upload, ShieldAlert, ArrowLeft, Play, Eye } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import VerificationLogs from '../../components/VerificationLogs';
import { useVerification } from '../../context/VerificationContext';

const ImageVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addVerification } = useVerification();
  
  const [fileDetails, setFileDetails] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);

  // Check if routed with file state from Unified Upload
  useEffect(() => {
    if (location.state && location.state.fileName) {
      setFileDetails({
        name: location.state.fileName,
        size: location.state.fileSize || 'Unknown size'
      });
      if (location.state.previewUrl) {
        setPreviewUrl(location.state.previewUrl);
      }
      setIsScanning(true); // Auto-start scan
    } else {
      // Direct access landing redirect to Unified Upload under the same tab
      navigate('/upload', { state: { tab: 'image' }, replace: true });
    }
  }, [location, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileDetails({ name: file.name, size: (file.size / (1024 * 1024)).toFixed(2) + ' MB' });
    setPreviewUrl(URL.createObjectURL(file));
  };

  const triggerSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const startAnalysis = () => {
    if (!fileDetails) return;
    setIsScanning(true);
  };

  const handleScanComplete = () => {
    // Determine mock classification based on file name or simple heuristics
    const name = fileDetails.name.toLowerCase();
    let classification = 'Authentic';
    let score = 96;
    let confidence = 95;
    let summary = 'No visual splices, compression errors, or structural camera noise discrepancies identified.';
    let reasoning = [
      'CFA Pattern: Camera noise field consistency is uniform (deviation < 2%).',
      'Double Compression: No secondary quantization tables discovered.',
      'EXIF Metadata matches local source structure profile.'
    ];

    if (name.includes('deepfake') || name.includes('manipulated') || name.includes('photoshop') || name.includes('splice')) {
      classification = 'Manipulated';
      score = 24;
      confidence = 91;
      summary = 'Localized pixel modifications detected around focus coordinates. Edge artifacts suggest splice overlays.';
      reasoning = [
        'Boundary mismatch detected along secondary lighting gradients.',
        'quantization tables indicate block double-compression (8x8 grid offset).',
        'Error Level Analysis (ELA) peaks in localized quadrants: x:340, y:510.'
      ];
    } else if (name.includes('ai') || name.includes('diffusion') || name.includes('midjourney') || name.includes('generated') || name.includes('gan')) {
      classification = 'AI-Generated';
      score = 42;
      confidence = 96;
      summary = 'Synthesized structural features match Generative Diffusion patterns (Midjourney/DALL-E templates).';
      reasoning = [
        'Background noise matches GAN signature distributions.',
        'High frequency detailing shows pixel texture smearing (atypical of camera sensors).',
        'Inconsistent directional reflections in secondary light targets.'
      ];
    }

    // Add verification record
    const record = addVerification({
      fileName: fileDetails.name,
      fileType: 'image',
      classification,
      score,
      confidence,
      summary,
      reasoning,
      content: previewUrl // Save image preview URL as content reference
    });

    // Route to results
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
              <span>Image Trust Analyzer</span>
              <Image className="h-5.5 w-5.5 text-sky-400" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Check images for edits, cropped changes, and AI generation signatures.
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
              accept="image/*" 
              className="hidden" 
            />

            {!fileDetails ? (
              /* Drop file locally */
              <div 
                onClick={triggerSelect}
                className="border-2 border-dashed border-black/15 dark:border-white/10 rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[280px] hover:border-sky-400/50 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-all"
              >
                <div className="p-4 rounded-full bg-slate-200/50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 w-fit mx-auto mb-4 border border-black/5 dark:border-white/5">
                  <Upload className="h-8 w-8 animate-pulse" />
                </div>
                <h4 className="font-orbitron font-bold text-sm text-slate-800 dark:text-slate-100">
                  Select Image Asset to Begin Analysis
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Supports JPEG, PNG, and WEBP formats up to 10MB
                </p>
              </div>
            ) : (
              /* Asset Preview State */
              <div className="space-y-6">
                <div className="relative max-w-lg mx-auto rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-md">
                  {previewUrl ? (
                    <img src={previewUrl} alt="preview" className="max-h-72 w-full object-contain mx-auto" />
                  ) : (
                    <div className="h-48 flex items-center justify-center">
                      <Image className="h-12 w-12 text-slate-400" />
                    </div>
                  )}
                  {/* Overlay scan overlay simulation */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.15)_1px,transparent_1px)] bg-[size:100%_8px]" />
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
                      setPreviewUrl('');
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/5 text-xs font-bold font-orbitron transition-all cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                <button
                  onClick={startAnalysis}
                  className="w-full py-3.5 rounded-xl font-bold font-orbitron text-xs bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
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
          <VerificationLogs type="image" onComplete={handleScanComplete} />
        </div>
      )}
    </div>
  );
};

export default ImageVerification;
