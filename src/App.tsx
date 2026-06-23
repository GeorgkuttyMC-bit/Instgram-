import { useState, useEffect, useRef } from 'react';
import { Play, Square, RefreshCcw, Eye, Info, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [url, setUrl] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [refreshInterval, setRefreshInterval] = useState(10); // seconds
  const [embedUrl, setEmbedUrl] = useState('');
  const [frameKey, setFrameKey] = useState(0);
  const [recentUrls, setRecentUrls] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('insta-loop-recent-urls');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse recent urls', e);
    }
    return [];
  });

  // Convert regular instagram URL to embed URL
  const parseUrl = (input: string) => {
    try {
      const parsed = new URL(input);
      if (parsed.hostname.includes('instagram.com')) {
         const parts = parsed.pathname.split('/').filter(Boolean);
         if (parts.length >= 2 && (parts[0] === 'p' || parts[0] === 'reel' || parts[0] === 'tv')) {
            return `https://www.instagram.com/p/${parts[1]}/embed/?autoplay=1`;
         }
      }
    } catch (e) {
      // invalid URL
    }
    return '';
  };

  const handleStart = () => {
    const embed = parseUrl(url);
    if (!embed) {
      alert('Please enter a valid Instagram video or reel link.');
      return;
    }
    
    const updatedRecents = [url, ...recentUrls.filter(u => u !== url)].slice(0, 5);
    setRecentUrls(updatedRecents);
    try {
      localStorage.setItem('insta-loop-recent-urls', JSON.stringify(updatedRecents));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }

    setEmbedUrl(embed);
    setIsActive(true);
    setViewCount(1);
  };

  const handleStop = () => {
    setIsActive(false);
    setEmbedUrl('');
  };

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (isActive && embedUrl) {
      intervalId = setInterval(() => {
        setViewCount((c) => c + 1);
        setFrameKey((k) => k + 1);
      }, refreshInterval * 1000);
    }
    return () => clearInterval(intervalId);
  }, [isActive, embedUrl, refreshInterval]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col items-center p-4 sm:p-8 font-sans">
      <div className="max-w-xl w-full flex flex-col gap-8">
        
        <header className="text-center space-y-4 pt-4 sm:pt-12">
           <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center p-3 sm:p-4 rounded-full bg-neutral-900 shadow-xl border border-neutral-800"
            >
              <RefreshCcw className="w-8 h-8 text-pink-500" />
           </motion.div>
           <h1 className="text-3xl font-medium tracking-tight text-white">Insta Loop Viewer</h1>
           <p className="text-neutral-500 text-sm">Automatically refresh Instagram embeds.</p>
        </header>

        <main className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-2xl">
           
           <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-400">Instagram Video Link</label>
              <input 
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isActive}
                placeholder="e.g. https://www.instagram.com/reel/Cxxxxxxx/"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all disabled:opacity-50 font-mono text-sm"
              />
              {recentUrls.length > 0 && !isActive && (
                <div className="pt-2">
                  <div className="text-xs text-neutral-500 flex items-center gap-1.5 mb-2 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    Recent Links
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentUrls.map((rUrl, i) => (
                      <button
                        key={i}
                        onClick={() => setUrl(rUrl)}
                        className="text-xs bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-300 py-1.5 px-3 rounded-lg max-w-[200px] truncate transition-colors text-left"
                        title={rUrl}
                      >
                        {rUrl.replace('https://www.instagram.com', '...')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
           </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-neutral-400 flex items-center justify-between">
                <span>Refresh Interval</span>
                <span className="text-neutral-200 font-mono bg-neutral-800 px-2 py-1 rounded">{refreshInterval}s</span>
              </label>
              <input 
                type="range"
                min="5"
                max="60"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                disabled={isActive}
                className="w-full accent-pink-500 disabled:opacity-50"
              />
           </div>

           <div className="pt-4 flex gap-4">
              {!isActive ? (
                <button
                  onClick={handleStart}
                  disabled={!url}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Start Viewing
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 border border-neutral-700 transition-colors"
                >
                  <Square className="w-5 h-5 text-red-400" />
                  Stop Viewer
                </button>
              )}
           </div>

           {isActive && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-neutral-950 rounded-xl p-6 flex flex-col items-center justify-center gap-3 border border-neutral-800 mt-2"
             >
                <div className="flex items-center gap-3 text-pink-500">
                  <Eye className="w-6 h-6 animate-pulse" />
                  <span className="text-4xl font-mono text-white">{viewCount}</span>
                </div>
                <div className="text-sm text-neutral-500 font-medium">Total Refreshes Automated</div>
             </motion.div>
           )}

        </main>

        <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-4 flex gap-3 text-sm text-blue-200/70">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>
                <strong>Heads up:</strong> Instagram's internal algorithms evaluate bot traffic. Re-rendering an iframe repeatedly from the same IP origin might not always translate linearly to view counts on the platform due to their spam-prevention systems.
              </p>
            </div>
        </div>

        {/* Hidden or small iframe to trigger the views */}
        {isActive && embedUrl && (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 aspect-square max-w-sm mx-auto w-full opacity-30 relative pointer-events-none grayscale"
          >
             <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-sm z-0 font-medium">
               Connecting to embed...
             </div>
             <iframe
               key={frameKey}
               src={embedUrl}
               className="w-full h-full relative z-10"
               allow="autoplay"
               title="Instagram video embed"
             />
          </motion.div>
        )}
      </div>
    </div>
  );
}
