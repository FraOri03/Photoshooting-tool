import React, { useState } from 'react';
import { useSceneStore } from '../store';
import { Sparkles, Send, Flame, Camera, Compass, RotateCcw, Lightbulb, UserCheck, AlertCircle } from 'lucide-react';

export default function AIAssistant() {
  const { loadRawElements, pushHistory } = useSceneStore();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState('');

  const suggestions = [
    {
      title: "Set Beauty Fotografico",
      prompt: "Crea un set fotografico per uno shooting beauty con due softbox e un controluce."
    },
    {
      title: "Drone su Pista da Sci",
      prompt: "Crea una scena su pista da sci estiva con neveplast, un fotografo a bordo pista e due camere."
    },
    {
      title: "Intervista Cinematografica",
      prompt: "Configura un set intervista video con luce chiave a 45 gradi, un pannello led di riempimento e una camera con focale 85mm per sfocato cinematografico."
    },
    {
      title: "Set Esterno Notte",
      prompt: "Crea un set in esterni notturni con due attori vicini, un faro spot giallo simulante il lampione stradale e un controluce freddo azzurro."
    }
  ];

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleGenerate = async (selectedPrompt: string) => {
    setIsLoading(true);
    setError(null);
    setSuccessInfo(null);

    const steps = [
      "Contattando il regista virtuale...",
      "Configurando il piano delle coordinate...",
      "Calcolando i coni visivi delle camere (FOV)...",
      "Sincronizzando le temperature delle luci...",
      "Posizionando gli attori e lo sfondo...",
      "Pronto! Disegnando i blueprint sul Canvas..."
    ];

    try {
      // Rotate steps for user delight
      const stepPromise = (async () => {
        for (const step of steps) {
          setLoadingStep(step);
          await sleep(650);
        }
      })();

      const fetchPromise = fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: selectedPrompt })
      });

      // Wait for both the delightful animation steps and the actual API call
      const [_, response] = await Promise.all([stepPromise, fetchPromise]);

      if (!response.ok) {
        throw new Error("Errore durante la generazione dello scenario. Riprova.");
      }

      const data = await response.json();
      
      if (data && Array.isArray(data.elements)) {
        loadRawElements(data.elements);
        const cameras = data.elements.filter((e: any) => e.type === 'camera').length;
        const lights = data.elements.filter((e: any) => e.type === 'light').length;
        const others = data.elements.length - cameras - lights;

        setSuccessInfo(
          `Set generato con successo! Aggiunti: ${cameras} Camere, ${lights} Luci, ${others} Elementi scenici.`
        );
      } else {
        throw new Error("Il formato della risposta dell'AI non è valido.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Errore sconosciuto. Verifica la chiave API.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    handleGenerate(prompt);
  };

  return (
    <div className="p-4 space-y-4 bg-[#121214]/40 rounded-none border border-[#27272a] font-mono text-xs">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-white font-display">Assistente AI Set Designer</h3>
      </div>
      
      <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
        Descrivi la scena che vuoi pianificare. L'AI configurerà la posizione ottimale di camere, luci e attori sul set.
      </p>

      {/* Suggestion list */}
      <div className="space-y-2">
        <span className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1.5 block">Esempi rapidi</span>
        <div className="grid grid-cols-1 gap-1.5">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(s.prompt);
                handleGenerate(s.prompt);
              }}
              className="text-left text-xs p-2 bg-[#0a0a0b] hover:bg-[#121214] hover:border-[#3f3f46] border border-[#27272a] rounded-none text-zinc-300 transition duration-150 flex items-center justify-between group cursor-pointer"
              disabled={isLoading}
            >
              <span className="truncate pr-4 font-medium group-hover:text-purple-300 font-sans">{s.title}</span>
              <Sparkles className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 text-purple-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Form input */}
      <form onSubmit={handleFormSubmit} className="space-y-2 pt-2 border-t border-[#27272a]">
        <div className="relative">
          <textarea
            rows={3}
            placeholder="Scrivi qui il prompt (es. Crea un set intervista con 3 luci...)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#3f3f46] resize-none pr-10 font-sans"
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="absolute bottom-3 right-3 p-1.5 bg-[#1a142e] disabled:bg-[#0a0a0b] disabled:text-zinc-600 disabled:border-[#27272a] text-purple-400 rounded-none border border-purple-800/60 hover:bg-[#251b41] transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Loading overlay / steps */}
      {isLoading && (
        <div className="p-4 bg-[#1a142e]/30 border border-purple-800/40 rounded-none space-y-3 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Generazione in corso...</span>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono italic">{loadingStep}</p>
        </div>
      )}

      {/* Success Banner */}
      {successInfo && (
        <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 rounded-none text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[10px]">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Successo!</span>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans">{successInfo}</p>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 rounded-none text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[10px]">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>Errore di Generazione</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal font-sans">{error}</p>
          <p className="text-[10px] text-zinc-500 pt-1 leading-normal font-sans">
            L'applicazione sta usando una configurazione offline di fallback per assicurarti un set completo anche in assenza di chiavi!
          </p>
        </div>
      )}
    </div>
  );
}
