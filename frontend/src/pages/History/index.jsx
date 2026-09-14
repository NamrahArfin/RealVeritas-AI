import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  History, Search, LayoutGrid, List, Trash2, 
  ExternalLink, Eye, ShieldAlert, ShieldCheck, Sparkles, Filter, Activity,
  Image, Video, Volume2, FileText
} from 'lucide-react';
import { useVerification } from '../../context/VerificationContext';
import GlassCard from '../../components/GlassCard';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { history, selectVerification, deleteVerification } = useVerification();
  
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('historyViewMode') || 'table';
  });

  useEffect(() => {
    localStorage.setItem('historyViewMode', viewMode);
  }, [viewMode]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'image' | 'video' | 'audio' | 'text'
  const [selectedClass, setSelectedClass] = useState('all'); // 'all' | 'Authentic' | 'Manipulated' | 'AI-Generated'

  const handleOpenResult = (item) => {
    selectVerification(item);
    navigate('/results', { state: { resultId: item.id } });
  };

  // Filter history records
  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || item.fileType === selectedType;
    let matchesClass = selectedClass === 'all';
    if (selectedClass !== 'all') {
      const cls = (item.classification || '').toLowerCase();
      if (selectedClass === 'Authentic') matchesClass = cls.includes('authentic');
      else if (selectedClass === 'Manipulated') matchesClass = cls.includes('manipulat');
      else if (selectedClass === 'AI-Generated') matchesClass = cls.includes('ai') && cls.includes('generat');
    }

    return matchesSearch && matchesType && matchesClass;
  });

  const getBadgeColors = (classification) => {
    const cls = (classification || '').toLowerCase();
    if (cls.includes('authentic')) {
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    } else if (cls.includes('manipulat')) {
      return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
    } else {
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
  };

  const getMediaBadge = (type) => {
    switch (type) {
      case 'image': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'video': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'audio': return 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const getMediaIcon = (type, className = "h-5 w-5") => {
    switch (type) {
      case 'image': return <Image className={className} />;
      case 'video': return <Video className={className} />;
      case 'audio': return <Volume2 className={className} />;
      case 'text': return <FileText className={className} />;
      default: return <FileText className={className} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="border-b border-black/5 dark:border-white/5 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-orbitron bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(14,165,233,0.3)] flex items-center gap-3">
            Audit History Archives
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Search, filter, and inspect past media verification records.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/50 dark:bg-slate-900/60 border border-black/5 dark:border-white/5 w-fit">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'table' 
                ? 'bg-white dark:bg-slate-800 text-brand-blue shadow-sm' 
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            aria-label="Table View"
          >
            <List className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'card' 
                ? 'bg-white dark:bg-slate-800 text-brand-blue shadow-sm' 
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            aria-label="Card View"
          >
            <LayoutGrid className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="md:col-span-5 flex items-center gap-2 px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/40 text-slate-400 focus-within:border-brand-blue/50 transition-all">
          <Search className="h-4.5 w-4.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by filename or audit ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full text-slate-700 dark:text-slate-200"
          />
        </div>

        {/* Filter Type */}
        <div className="md:col-span-3 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/40">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-slate-600 dark:text-slate-300 w-full font-medium cursor-pointer"
          >
            <option value="all" className="bg-bg-light dark:bg-bg-dark">All Formats</option>
            <option value="image" className="bg-bg-light dark:bg-bg-dark">Images</option>
            <option value="video" className="bg-bg-light dark:bg-bg-dark">Videos</option>
            <option value="audio" className="bg-bg-light dark:bg-bg-dark">Audio</option>
            <option value="text" className="bg-bg-light dark:bg-bg-dark">Text</option>
          </select>
        </div>

        {/* Filter Classification */}
        <div className="md:col-span-4 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-slate-100/50 dark:bg-slate-900/40">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-slate-600 dark:text-slate-300 w-full font-medium cursor-pointer"
          >
            <option value="all" className="bg-bg-light dark:bg-bg-dark">All Statuses</option>
            <option value="Authentic" className="bg-bg-light dark:bg-bg-dark text-emerald-500">Authentic</option>
            <option value="Manipulated" className="bg-bg-light dark:bg-bg-dark text-amber-400">Manipulated</option>
            <option value="AI-Generated" className="bg-bg-light dark:bg-bg-dark text-red-500">AI-Generated</option>
          </select>
        </div>
      </div>

      {/* Main logs display list */}
      {filteredHistory.length > 0 ? (
        viewMode === 'table' ? (
          /* Table View */
          /* Table View */
          <div className="glass-panel-light dark:glass-panel-dark rounded-2xl overflow-hidden border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-slate-400 font-orbitron uppercase text-[10px] font-bold tracking-widest">
                    <th className="py-5 px-6">File Name</th>
                    <th className="py-5 px-6 text-center">Status</th>
                    <th className="py-5 px-6 text-center">Type</th>
                    <th className="py-5 px-6">Date & Time</th>
                    <th className="py-5 px-6 text-center">Score</th>
                    <th className="py-5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredHistory.map((item, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={item.id} 
                      className="hover:bg-white/5 transition-colors group relative"
                    >
                      <td className="py-5 px-6 relative">
                        {/* Left glowing border on hover */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-gradient-to-b group-hover:from-brand-blue group-hover:to-brand-purple transition-all" />
                        
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${getMediaBadge(item.fileType)} shadow-inner`}>
                            {getMediaIcon(item.fileType, "h-5 w-5 opacity-90")}
                          </div>
                          <div>
                            <p className="font-bold text-white truncate max-w-xs">{item.fileName}</p>
                            <p className="text-[10px] font-mono text-slate-500 mt-1">ID: {item.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className={`inline-block px-3 py-1.5 rounded-full border text-[10px] font-black font-orbitron uppercase tracking-wider ${getBadgeColors(item.classification)} shadow-lg`}>
                          {item.classification}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className="text-xs font-bold text-slate-300 capitalize">{item.fileType}</span>
                      </td>
                      <td className="py-5 px-6 text-xs text-slate-400 font-medium font-mono">
                        {item.date}
                      </td>
                      <td className="py-5 px-6 text-center font-bold font-orbitron text-brand-blue">
                        {item.score}%
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleOpenResult(item)}
                            className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-all cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteVerification(item.id)}
                            className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Card View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHistory.map((item) => (
              <GlassCard 
                key={item.id} 
                hoverGlow={true}
                className="flex flex-col justify-between h-60"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-slate-500 font-bold">{item.id}</span>
                    <span className={`px-2 py-1 flex items-center gap-1.5 rounded border text-[9px] font-bold font-orbitron uppercase ${getMediaBadge(item.fileType)}`}>
                      {getMediaIcon(item.fileType, "h-3 w-3")}
                      {item.fileType}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                    {item.fileName}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Timestamp: {item.date}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full border text-[8px] font-bold font-orbitron uppercase ${getBadgeColors(item.classification)}`}>
                      {item.classification}
                    </span>
                    <span className="text-xs font-black font-orbitron text-slate-700 dark:text-slate-300">
                      Score: {item.score}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenResult(item)}
                      className="p-1.5 rounded-lg border border-black/5 dark:border-white/5 hover:border-brand-blue/30 hover:bg-brand-blue/5 text-slate-500 dark:text-slate-300 hover:text-brand-blue cursor-pointer"
                      title="Inspect results"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteVerification(item.id)}
                      className="p-1.5 rounded-lg border border-black/5 dark:border-white/5 hover:border-red-500/30 hover:bg-red-500/5 text-slate-500 dark:text-slate-300 hover:text-red-500 cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )
      ) : (
        /* Empty Filter State */
        <GlassCard className="text-center py-16">
          <History className="h-10 w-10 text-slate-400 mx-auto mb-3 animate-pulse" />
          <h4 className="font-orbitron font-bold text-sm text-slate-700 dark:text-slate-200">No matching logs found</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or media formats/classification filter selections.
          </p>
        </GlassCard>
      )}
    </motion.div>
  );
};

export default HistoryPage;
