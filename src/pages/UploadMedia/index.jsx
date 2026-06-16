import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Upload, Image, Video, Volume2, FileText, 
  FileCode, ArrowRight
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
 
const UploadMedia = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(() => {
    if (location.state && location.state.tab) {
      return location.state.tab;
    }
    return 'image';
  });
  
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (location.state && location.state.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  const tabs = [
    { id: 'image', label: 'Image', icon: Image, accept: 'image/*', text: 'JPEG, PNG, WEBP up to 10MB' },
    { id: 'video', label: 'Video', icon: Video, accept: 'video/*', text: 'MP4, MOV, MKV up to 50MB' },
    { id: 'audio', label: 'Audio', icon: Volume2, accept: 'audio/*', text: 'WAV, MP3, AAC up to 20MB' },
    { id: 'text', label: 'Text', icon: FileText, accept: null, text: 'Paste text copy up to 50,000 characters' },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setFile(null);
    setPreviewUrl('');
    setTextContent('');
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-black/5 dark:border-white/5 pb-6">
        <h2 className="text-xl md:text-2xl font-black font-orbitron text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>Upload Center</span>
          <Upload className="h-5.5 w-5.5 text-brand-blue" />
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Select or drop a file under the appropriate format tab to begin verification scans.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Tab selectors */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold font-orbitron transition-all border cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-brand-blue/15 to-brand-purple/15 text-brand-blue border-brand-blue/30 shadow-[0_0_15px_rgba(14,165,233,0.06)]'
                    : 'bg-white/40 dark:bg-black/20 border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Upload Box or text block */}
        <div className="lg:col-span-9 space-y-6">
          <GlassCard className="p-8">
            {activeTab !== 'text' ? (
              /* Dropzone for file uploads */
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={!file ? triggerFileInput : undefined}
                className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[280px] transition-all duration-300 ${
                  file 
                    ? 'border-brand-purple/30 bg-brand-purple/5' 
                    : 'border-black/15 dark:border-white/10 hover:border-brand-blue/40 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer'
                }`}
              >
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
                  <div className="space-y-4">
                    <div className="p-4 rounded-full bg-slate-200/50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 w-fit mx-auto border border-black/5 dark:border-white/5">
                      <Upload className="h-8 w-8 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="font-orbitron font-bold text-sm text-slate-800 dark:text-slate-100">
                        Drag and drop file here, or click to browse
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        {tabs.find(t => t.id === activeTab)?.text}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* File Loaded Preview State */
                  <div className="space-y-6 w-full max-w-md">
                    {/* Visual Preview */}
                    {activeTab === 'image' && previewUrl ? (
                      <div className="relative h-44 rounded-lg overflow-hidden border border-black/10 dark:border-white/10 bg-slate-100 dark:bg-slate-900 mx-auto shadow-md">
                        <img src={previewUrl} alt="preview" className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <div className="p-6 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-black/5 dark:border-white/5 flex items-center gap-4 text-left mx-auto w-full">
                        <div className="p-3 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-purple text-white">
                          <FileCode className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold font-orbitron text-slate-700 dark:text-slate-200 truncate">
                            {file.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">
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
                        className="px-4 py-2 rounded-lg text-xs font-bold font-orbitron border border-red-500/20 text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerFileInput();
                        }}
                        className="px-4 py-2 rounded-lg text-xs font-bold font-orbitron border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        Choose Different
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Text Input form */
              <div className="space-y-4">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-orbitron uppercase">
                  Paste Text Content
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Enter or paste paragraphs here..."
                  className="w-full h-64 p-4 rounded-xl border border-black/15 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 text-sm outline-none focus:border-brand-blue/50 transition-all font-sans leading-relaxed resize-none"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  <span>Characters: {textContent.length}</span>
                  <span>Word count: {textContent.split(/\s+/).filter(Boolean).length}</span>
                </div>
              </div>
            )}

            {/* CTA action analysis button */}
            <div className="mt-6 border-t border-black/5 dark:border-white/5 pt-6 flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={activeTab === 'text' ? !textContent.trim() : !file}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold font-orbitron text-white transition-all flex items-center gap-2 cursor-pointer ${
                  (activeTab === 'text' ? textContent.trim() : file)
                    ? 'bg-gradient-to-r from-brand-blue to-brand-purple hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:scale-[1.01] active:scale-[0.99]'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed'
                }`}
              >
                <span>Process Verification</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default UploadMedia;
