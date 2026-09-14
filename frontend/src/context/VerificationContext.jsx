import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

const VerificationContext = createContext();

const SEED_DATA = [
  {
    id: 'ver-101',
    fileName: 'deepfake_interview_president.mp4',
    fileType: 'video',
    date: '2026-06-12 14:24',
    classification: 'Manipulated',
    score: 18,
    confidence: 94,
    summary: 'Face-swapping deepfake detected on speech frames 240-360 with clear boundary artifacts around the chin and eyes.',
    reasoning: [
      'Temporal inconsistencies in eye blinking rate (under 4 blinks/min).',
      'Inconsistent lighting shadows on the facial mask compared to background sources.',
      'Loss of fine texture in mouth interior during phonemes "O" and "U".',
      'Audio-visual lip-sync delay of approximately 42ms.'
    ]
  },
  {
    id: 'ver-102',
    fileName: 'ai_climate_essay.txt',
    fileType: 'text',
    date: '2026-06-11 09:12',
    classification: 'AI-Generated',
    score: 45,
    confidence: 89,
    summary: 'High probability of GPT-4 architecture generation. Sentences exhibit low burstiness and repetitive syntax structures.',
    content: 'Global warming poses a severe threat to planetary biodiversity. Prompt mitigation actions, including carbon sequestration and renewable grids, represent key technical levers...',
    reasoning: [
      'Burstiness score: 14.2 (highly uniform sentence lengths).',
      'Perplexity score: 24.8 (highly predictable next-token generation).',
      'Repetitive transitional adverbs ("Furthermore", "Moreover", "Consequently") used in rapid succession.',
      'Lack of spelling anomalies or human colloquialisms.'
    ]
  },
  {
    id: 'ver-103',
    fileName: 'satellite_terrain_analysis.png',
    fileType: 'image',
    date: '2026-06-10 17:45',
    classification: 'Authentic',
    score: 98,
    confidence: 96,
    summary: 'Camera sensor noise matches standard metadata profile. No anomalies found in color filter array or lighting angles.',
    reasoning: [
      'Sensor Noise (PRNU): Confirmed consistent pattern across entire canvas.',
      'Metadata: Consistent EXIF creation dates, matching camera hardware signature.',
      'Error Level Analysis (ELA): Uniform compression levels, no double-saving overlays detected.',
      'Shadow vectors align perfectly with solar coordinates at the logged capture time.'
    ]
  },
  {
    id: 'ver-104',
    fileName: 'voice_clone_ceo_scam.wav',
    fileType: 'audio',
    date: '2026-06-08 11:30',
    classification: 'AI-Generated',
    score: 12,
    confidence: 97,
    summary: 'Voice synthesis patterns match commercial text-to-speech models. Absence of natural sub-harmonic breathing pauses.',
    reasoning: [
      'Spectrogram analysis shows sharp vertical phase cancellations in high frequency regions.',
      'Pitch stability: Extremely uniform pitch variance (less than 1.5%), atypical of emotional human speech.',
      'Spectral envelope shows robotic harmonic alignment above 4000 Hz.',
      'No background room ambience or microphone noise fluctuations.'
    ]
  }
];

export const VerificationProvider = ({ children }) => {
  const { user } = useAuth();
  
  const historyKey = user?.email ? `verification_history_${user.email}` : 'verification_history';
  const resultKey = user?.email ? `current_result_${user.email}` : 'current_result';

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(historyKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch(e) {}
    return SEED_DATA;
  });
  const [globalFile, setGlobalFile] = useState(null);

  const [currentResult, setCurrentResult] = useState(() => {
    const saved = localStorage.getItem(resultKey);
    return saved ? JSON.parse(saved) : null;
  });

  // Fetch history from backend when user changes
  useEffect(() => {
    if (user?.email) {
      fetch(`http://127.0.0.1:8000/history?user_email=${encodeURIComponent(user.email)}&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
            setHistory(prev => {
                const merged = [...data];
                const dataIds = new Set(data.map(d => d.id));
                for (const item of prev) {
                    if (!dataIds.has(item.id)) {
                        merged.push(item);
                    }
                }
                merged.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
                return merged;
            });
        })
        .catch(err => console.error("Failed to fetch history:", err));
    } else {
      try {
        const saved = localStorage.getItem(historyKey);
        setHistory(saved ? JSON.parse(saved) : SEED_DATA);
      } catch(e) {
        setHistory(SEED_DATA);
      }
    }

    const savedResult = localStorage.getItem(resultKey);
    setCurrentResult(savedResult ? JSON.parse(savedResult) : null);
  }, [user]);

  useEffect(() => {
    if (currentResult !== null) {
      localStorage.setItem(resultKey, JSON.stringify(currentResult));
    }
  }, [currentResult, resultKey]);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(historyKey, JSON.stringify(history));
    }
  }, [history, historyKey]);

  const addVerification = useCallback((item) => {
    const newItem = {
      id: `ver-${Date.now()}`,
      date: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(',', ''),
      ...item
    };
    setHistory((prev) => [newItem, ...prev]);
    setCurrentResult(newItem);
    return newItem;
  }, []);

  const getVerification = useCallback((id) => {
    return history.find((v) => v.id === id);
  }, [history]);

  const selectVerification = useCallback((item) => {
    setCurrentResult(item);
  }, []);

  const deleteVerification = useCallback((id) => {
    // Optimistically update the UI
    setHistory((prev) => prev.filter((v) => v.id !== id));
    
    // Send DELETE request to backend
    fetch(`http://127.0.0.1:8000/delete/${id}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (!res.ok) {
        console.error("Failed to delete from backend:", res.statusText);
        // Optionally, refetch history here if needed
      }
    })
    .catch(err => console.error("Error calling delete endpoint:", err));
  }, []);

  const providerValue = useMemo(() => ({
    history,
    currentResult,
    globalFile,
    setGlobalFile,
    addVerification,
    getVerification,
    selectVerification,
    deleteVerification
  }), [history, currentResult, globalFile, setGlobalFile, addVerification, getVerification, selectVerification, deleteVerification]);

  return (
    <VerificationContext.Provider value={providerValue}>
      {children}
    </VerificationContext.Provider>
  );
};

export const useVerification = () => {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
};
