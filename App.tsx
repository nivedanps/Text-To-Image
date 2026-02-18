
import React, { useState, useCallback } from 'react';
import { ImageStyle, GeneratedImage } from './types';
import { creatoService } from './services/geminiService';

function useSynthesis() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const manifest = useCallback(async (prompt: string, style: ImageStyle): Promise<GeneratedImage | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const url = await creatoService.synthesize(prompt, style);
      
      const newImage: GeneratedImage = {
        id: crypto.randomUUID(),
        url,
        prompt,
        style,
        timestamp: Date.now()
      };

      const history = JSON.parse(localStorage.getItem('creato_archive') || '[]');
      localStorage.setItem('creato_archive', JSON.stringify([newImage, ...history].slice(0, 20)));

      return newImage;
    } catch (err) {
      setError("The system encountered a resistance in the latent space. Please refine your vision.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { manifest, isGenerating, error };
}

const StyleSelector: React.FC<{ 
  current: ImageStyle; 
  onSelect: (s: ImageStyle) => void 
}> = ({ current, onSelect }) => (
  <div className="flex flex-wrap gap-3">
    {Object.values(ImageStyle).map((style) => (
      <button
        key={style}
        onClick={() => onSelect(style)}
        className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 border ${
          current === style 
            ? 'bg-white border-white text-black shadow-lg scale-105' 
            : 'bg-transparent border-white/10 text-white/30 hover:border-white/40 hover:text-white'
        }`}
      >
        {style}
      </button>
    ))}
  </div>
);

export default function App() {
  const [vision, setVision] = useState('');
  const [style, setStyle] = useState<ImageStyle>(ImageStyle.REALISTIC);
  const [activeCreation, setActiveCreation] = useState<GeneratedImage | null>(null);
  
  const { manifest, isGenerating, error } = useSynthesis();

  const handleCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vision.trim() || isGenerating) return;

    const result = await manifest(vision, style);
    if (result) setActiveCreation(result);
  };

  const handleExport = () => {
    if (!activeCreation) return;
    const link = document.createElement('a');
    link.href = activeCreation.url;
    link.download = `creato-${activeCreation.id.slice(0, 8)}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col items-center font-sans">
      <main className="flex-1 flex flex-col p-8 md:p-16 lg:p-24 max-w-6xl w-full">
        
        <header className="mb-24 text-center space-y-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter hover:tracking-tight transition-all duration-1000">
            NIV CREATO
          </h1>
          <p className="text-white/20 text-lg md:text-xl font-light tracking-widest uppercase">
            Creating the thought of your mind
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-20 items-start">
          
          <section className="space-y-16">
            <form onSubmit={handleCreation} className="space-y-12">
              <div className="space-y-6">
                <div className="flex justify-between items-end px-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">The Vision</label>
                  <span className="text-[9px] font-mono text-white/10">{vision.length} / 1000</span>
                </div>
                
                <textarea
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  placeholder="Describe an image you can almost see..."
                  className="w-full h-72 p-10 bg-white/[0.02] border border-white/[0.08] rounded-[50px] focus:ring-0 focus:border-white/40 transition-all duration-700 resize-none text-xl font-light placeholder:text-white/5 leading-relaxed outline-none"
                />
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] px-2">Creation Style</label>
                <StyleSelector current={style} onSelect={setStyle} />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !vision.trim()}
                className={`w-full py-8 rounded-[50px] font-black text-[12px] uppercase tracking-[0.5em] transition-all duration-1000 ${
                  isGenerating 
                    ? 'bg-white/5 text-white/10 cursor-wait border border-white/5' 
                    : 'bg-white text-black hover:scale-[1.01] active:scale-[0.99] shadow-[0_20px_60px_-15px_rgba(255,255,255,0.2)]'
                }`}
              >
                {isGenerating ? 'Synthesizing...' : 'Bring to Life'}
              </button>

              {error && (
                <div className="p-8 rounded-[40px] bg-red-500/[0.03] border border-red-500/10 flex gap-5 items-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <div className="w-2 h-2 rounded-full bg-red-500/50" />
                   <p className="text-[11px] font-bold uppercase tracking-widest text-red-500/80">{error}</p>
                </div>
              )}
            </form>
          </section>

          <section className="lg:sticky lg:top-24">
            <div className="aspect-square relative rounded-[80px] overflow-hidden bg-white/[0.01] border border-white/[0.04] shadow-2xl group">
              
              {!activeCreation && !isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-24 text-center opacity-40">
                  <div className="w-32 h-32 rounded-full border border-white/[0.05] flex items-center justify-center mb-12 bg-white/[0.01]">
                    <svg className="w-10 h-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.6em] mb-4">Awaiting Signal</h3>
                  <p className="text-white/10 text-sm font-light leading-relaxed max-w-xs">Provide a prompt to begin the synthesis process.</p>
                </div>
              ) : isGenerating ? (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl flex flex-col items-center justify-center">
                  <div className="relative w-64 h-[2px] bg-white/5 overflow-hidden mb-16">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-[11px] font-black tracking-[0.8em] uppercase animate-pulse">Processing Vision</p>
                    <p className="text-[9px] font-mono text-white/20 uppercase">Latent Projection In Progress</p>
                  </div>
                </div>
              ) : activeCreation ? (
                <>
                  <img 
                    src={activeCreation.url} 
                    alt={activeCreation.prompt} 
                    className="w-full h-full object-cover animate-in fade-in zoom-in duration-1000 ease-out"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 p-16 flex flex-col justify-end">
                    <p className="text-2xl font-light leading-snug line-clamp-3 mb-8 italic tracking-tight opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 delay-100">
                      "{activeCreation.prompt}"
                    </p>
                    <div className="flex items-center gap-8 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 delay-200">
                      <span className="text-[10px] px-5 py-2 rounded-full bg-white text-black font-black uppercase tracking-widest">
                        {activeCreation.style}
                      </span>
                      <button 
                        onClick={handleExport}
                        className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                      >
                        Export 01
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </section>
        </div>

        <footer className="mt-40 mb-16 flex flex-col items-center gap-10">
          <div className="w-px h-24 bg-gradient-to-b from-white/10 to-transparent" />
          <div className="flex flex-col items-center gap-2 opacity-10">
            <p className="text-[10px] font-black uppercase tracking-[1em]">NIV CREATO</p>
            <p className="text-[8px] font-mono uppercase">Core Engine v2.5.0 // Stable Release</p>
          </div>
        </footer>
      </main>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        textarea::placeholder {
          transition: opacity 0.5s ease;
        }
        textarea:focus::placeholder {
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
