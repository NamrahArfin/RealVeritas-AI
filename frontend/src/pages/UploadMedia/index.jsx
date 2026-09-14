import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Image, Video, Volume2, FileText, 
  FileCode, ArrowRight, Sparkles
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { useVerification } from '../../context/VerificationContext';
 
const UploadMedia = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setGlobalFile } = useVerification();
  
  const [activeTab, setActiveTab] = useState(() => {
    if (location.state && location.state.tab) {
      return location.state.tab;
    }
    return 'image';
  });
  
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (location.state && location.state.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  const tabs = [
    { id: 'image', label: 'Image', icon: Image, accept: 'image/*', text: 'JPEG, PNG, WEBP up to 10MB' },
    { id: 'video', label: 'Video', icon: Video, accept: 'video/*', text: 'MP4, MOV, MKV up to 50MB' },
    { id: 'audio', label: 'Audio', icon: Volume2, accept: 'audio/*', text: 'WAV, MP3, AAC, OGG up to 20MB' },
    { id: 'text', label: 'Text', icon: FileText, accept: '.txt,.pdf,.docx', text: 'Upload .txt, .pdf, .docx or paste text' },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setFile(null);
    setPreviewUrl('');
    setTextContent('');
  };

  const extractTextFromFile = async (selectedFile) => {
    setIsExtracting(true);
    setFile(selectedFile);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/extract-text', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setTextContent(data.text);
      } else {
        console.error('Failed to parse document');
        setTextContent('Error extracting text from file.');
      }
    } catch (err) {
      console.error(err);
      setTextContent('Network error while extracting text.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (activeTab === 'text') {
      extractTextFromFile(selected);
      return;
    }

    setFile(selected);
    
    // Create preview for image/video/audio
    if (selected.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;

    // Validate type matches tab
    if (activeTab === 'image' && dropped.type.startsWith('image/')) {
      setFile(dropped);
      setPreviewUrl(URL.createObjectURL(dropped));
    } else if (activeTab === 'video' && dropped.type.startsWith('video/')) {
      setFile(dropped);
    } else if (activeTab === 'audio' && dropped.type.startsWith('audio/')) {
      setFile(dropped);
    } else if (activeTab === 'text') {
      const ext = dropped.name.split('.').pop().toLowerCase();
      if (['txt', 'pdf', 'docx'].includes(ext)) {
        extractTextFromFile(dropped);
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAnalyze = () => {
    if (activeTab === 'text') {
      if (!textContent.trim()) return;
      // Route to /text passing pasted text
      navigate('/text', { state: { text: textContent } });
    } else {
      if (!file) return;
      setGlobalFile(file);
      // Route to corresponding module passing file details
      navigate(`/${activeTab}`, { 
        state: { 
          fileName: file.name, 
          fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          previewUrl: previewUrl
        } 
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Page Header */}
      <div className="border-b border-black/5 dark:border-white/5 pb-6">
        <h2 className="text-3xl font-black font-orbitron bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(14,165,233,0.3)] flex items-center gap-3">
          Start New Case Investigation
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Upload evidence files for automated AI analysis and processing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Tab selectors */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex items-center gap-3 px-4 py-4 rounded-xl text-left text-sm font-bold font-orbitron transition-all cursor-pointer overflow-hidden group ${
                  activeTab === tab.id 
                    ? 'text-slate-800 dark:text-white bg-black/5 dark:bg-transparent' 
                    : 'bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="active-tab-bg"
                    className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-brand-purple/10 border border-brand-blue/30 shadow-[0_0_20px_rgba(14,165,233,0.15)] rounded-xl"
                  />
                )}
                {activeTab === tab.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-blue rounded-r-full shadow-[0_0_10px_#0ea5e9]" />
                )}
                <div className={`relative z-10 flex items-center justify-center p-2 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-gradient-to-br from-brand-blue to-brand-purple text-white' : 'bg-white/10'}`}>
                  <Icon className="h-4 w-4 shrink-0" />
                </div>
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Upload Box or text block */}
        <div className="lg:col-span-9 space-y-6">
          <GlassCard className="p-1 relative overflow-hidden">
            {/* Background scanner grid overlay */}
            <div className="absolute inset-0 grid-bg-overlay opacity-30 pointer-events-none" />
            
            <div className="p-8 relative z-10 bg-white/40 dark:bg-slate-900/60 rounded-xl backdrop-blur-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab !== 'text' ? (
                  /* Dropzone for file uploads */
                  <div className="space-y-8 flex flex-col items-center">
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={!file ? triggerFileInput : undefined}
                  className={`w-full max-w-2xl border-2 border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden group ${
                    file 
                      ? 'border-brand-purple/50 bg-brand-purple/5 shadow-[0_0_30px_rgba(99,102,241,0.1)]' 
                      : 'min-h-[320px] border-brand-blue/30 hover:border-brand-blue bg-brand-blue/5 hover:bg-brand-blue/10 shadow-[0_0_30px_rgba(14,165,233,0.1)] cursor-pointer'
                  }`}
                >
                  {/* Glowing Pulse behind dropzone */}
                  {!file && <div className="absolute inset-0 bg-brand-blue/20 blur-[100px] rounded-full pointer-events-none pulse-glow" />}
                  
                  {/* File Input hidden */}
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={tabs.find(t => t.id === activeTab)?.accept}
                    className="hidden"
                  />

                  {!file ? (
                    /* Standard Upload state */
                    <div className="space-y-6 relative z-10 flex flex-col items-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-brand-blue blur-xl opacity-50 rounded-full" />
                        <div className="p-6 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-purple text-white relative z-10 border border-white/20 shadow-xl">
                          <Upload className="h-10 w-10 animate-bounce" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-orbitron font-bold text-xl md:text-2xl text-slate-800 dark:text-white drop-shadow-md">
                          Drag & drop files to analyze
                        </h4>
                        <p className="text-xs text-brand-blue/80 font-medium mt-3 tracking-widest uppercase">
                          Supported: {tabs.find(t => t.id === activeTab)?.text}
                        </p>
                      </div>
                      <div className="pt-4 flex items-center justify-center gap-4 text-xs font-bold text-slate-400">
                        <span className="w-12 h-px bg-white/20" /> OR <span className="w-12 h-px bg-white/20" />
                      </div>
                      <button className="text-xs font-orbitron font-bold text-brand-blue hover:text-white transition-colors underline decoration-brand-blue/50 underline-offset-4">
                        Browse Files
                      </button>
                    </div>
                  ) : (
                    /* File Loaded Preview State */
                    <div className="space-y-6 w-full relative z-10">
                      {/* Visual Preview */}
                      {activeTab === 'image' && previewUrl ? (
                        <div className="relative h-48 rounded-xl overflow-hidden border border-brand-purple/30 bg-slate-900 mx-auto shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
                          <img src={previewUrl} alt="preview" className="h-full w-full object-contain" />
                          <div className="absolute bottom-4 left-4 z-20">
                             <p className="text-xs font-bold text-white flex items-center gap-2"><FileCode className="h-4 w-4 text-brand-purple"/> {file.name}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 rounded-xl bg-slate-800/80 border border-brand-purple/30 flex items-center gap-4 text-left mx-auto w-full shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                          <div className="p-3 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-purple text-white">
                            <FileCode className="h-6 w-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold font-orbitron text-white truncate">
                              {file.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'unknown type'}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            setPreviewUrl('');
                          }}
                          className="px-4 py-2 rounded-lg text-xs font-bold font-orbitron border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerFileInput();
                          }}
                          className="px-4 py-2 rounded-lg text-xs font-bold font-orbitron border border-white/10 text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          Choose Different
                        </button>
                      </div>

                      <div className="w-full pt-4 mx-auto flex justify-center">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleAnalyze}
                          className="w-full py-4 rounded-xl font-bold font-orbitron text-sm text-white bg-gradient-to-r from-brand-blue via-brand-purple to-brand-blue bg-[length:200%_auto] shadow-[0_0_30px_rgba(14,165,233,0.4)] flex items-center justify-center gap-3 cursor-pointer border border-white/20"
                        >
                          <Sparkles className="h-5 w-5" />
                          <span>UPLOAD & ANALYZE</span>
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Text Input form */
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* File Upload / Drag & Drop for Text */}
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    className="md:w-1/3 border-2 border-dashed border-black/15 dark:border-white/10 rounded-xl p-6 text-center hover:border-brand-blue/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[220px]"
                  >
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".txt,.pdf,.docx"
                      className="hidden"
                    />
                    <div className="p-3 rounded-full bg-slate-200/50 dark:bg-slate-900/60 mb-3 border border-black/5 dark:border-white/5">
                      <Upload className="h-6 w-6 text-slate-500" />
                    </div>
                    <p className="font-orbitron font-bold text-xs text-slate-700 dark:text-slate-200">
                      Upload Document
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">.txt, .pdf, .docx</p>
                    
                    {file && (
                      <div className="mt-4 px-3 py-1.5 bg-brand-blue/10 rounded-md">
                        <p className="text-[10px] font-semibold text-brand-blue truncate w-32">
                          {file.name}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Textarea for pasting */}
                  <div className="md:w-2/3 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-orbitron uppercase">
                      Or Paste Text Content
                    </label>
                    <textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder={isExtracting ? "Extracting text..." : "Paste or extract text passages to scan for machine-generation signatures..."}
                      disabled={isExtracting}
                      className="w-full h-[220px] p-4 rounded-xl border border-black/15 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 text-sm outline-none focus:border-brand-blue/50 transition-all font-sans leading-relaxed resize-none"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      <span>{textContent.length} characters</span>
                      <span>{textContent.split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <motion.button
                    whileHover={textContent.trim() && textContent.split(/\s+/).filter(Boolean).length >= 10 ? { scale: 1.02 } : {}}
                    whileTap={textContent.trim() && textContent.split(/\s+/).filter(Boolean).length >= 10 ? { scale: 0.98 } : {}}
                    onClick={handleAnalyze}
                    disabled={!textContent.trim() || textContent.split(/\s+/).filter(Boolean).length < 10}
                    className={`px-8 py-3.5 rounded-xl font-bold font-orbitron text-xs text-white transition-all flex items-center gap-2 cursor-pointer ${
                      textContent.trim() && textContent.split(/\s+/).filter(Boolean).length >= 10
                        ? 'bg-gradient-to-r from-brand-blue to-brand-purple shadow-md hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]'
                        : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <span>{(!textContent.trim() || textContent.split(/\s+/).filter(Boolean).length < 10) ? 'Requires 10+ Words' : 'Analyze Content'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            )}
              </motion.div>
            </AnimatePresence>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
};

export default UploadMedia;
