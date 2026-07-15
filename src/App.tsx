/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSceneStore } from './store';
import Canvas from './components/Canvas';
import SidebarLibrary from './components/SidebarLibrary';
import InspectorPanel from './components/InspectorPanel';
import ShotListTimeline from './components/ShotListTimeline';
import AIAssistant from './components/AIAssistant';
import {
  Sparkles,
  Undo2,
  Redo2,
  Download,
  Upload,
  Camera,
  Lightbulb,
  UserPlus,
  Box,
  RotateCcw,
  Sliders,
  Maximize2,
  Trash2,
  Info,
  CheckCircle2,
  MousePointer,
  HelpCircle,
  Menu
} from 'lucide-react';

export default function App() {
  const {
    shots,
    activeShotId,
    tool,
    history,
    historyIndex,
    addElement,
    setTool,
    undo,
    redo,
    loadFromJSON,
    resetAll
  } = useSceneStore();

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [showWelcomeMsg, setShowWelcomeMsg] = useState(true);

  const activeShot = shots.find(s => s.id === activeShotId) || shots[0];

  // Global hotkey handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Z -> Undo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        e.preventDefault();
      }
      // Cmd/Ctrl + Y -> Redo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        redo();
        e.preventDefault();
      }
      // V -> Select tool
      if (e.key.toLowerCase() === 'v' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        setTool('select');
      }
      // H -> Pan tool
      if (e.key.toLowerCase() === 'h' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        setTool('pan');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, setTool]);

  // Export scene layout as JSON file
  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ version: "1.2", shots }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `scene-designer-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import scene layout from JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const success = loadFromJSON(text);
        if (success) {
          alert('Configurazione caricata con successo!');
        } else {
          alert('Errore: formato JSON non compatibile.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleQuickAdd = (type: 'camera' | 'light' | 'person' | 'prop') => {
    // Add to center of active workspace
    addElement(type, 0, 0);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0a0a0b] text-zinc-100 overflow-hidden font-sans select-none">
      
      {/* 1. HEADER BRANDING & TOOLBAR */}
      <header className="h-14 border-b border-[#27272a] bg-[#0f0f11]/90 flex items-center justify-between px-4 shrink-0 z-20 backdrop-blur shadow-md font-mono">
        
        {/* App Title & Quick status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xs font-bold tracking-widest uppercase text-white font-display">
              Scene Designer
            </h1>
          </div>
          <span className="text-[9px] bg-[#121214] text-zinc-400 border border-[#27272a] px-2 py-0.5 rounded-none font-mono hidden sm:inline-block tracking-wider">
            Pre-production Board
          </span>
        </div>

        {/* Center Quick Tools */}
        <div className="flex items-center bg-[#0a0a0b] border border-[#27272a] p-1 rounded-none gap-1">
          <button
            onClick={() => setTool('select')}
            className={`px-3 py-1 text-[11px] rounded-none font-medium flex items-center gap-1.5 transition ${tool === 'select' ? 'bg-[#27272a] text-white border border-[#3f3f46] shadow-sm' : 'text-zinc-400 border border-transparent hover:text-zinc-200 hover:bg-[#18181b]'}`}
            title="Strumento Seleziona (V)"
          >
            <MousePointer className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Seleziona</span>
          </button>
          
          <button
            onClick={() => setTool('pan')}
            className={`px-3 py-1 text-[11px] rounded-none font-medium flex items-center gap-1.5 transition ${tool === 'pan' ? 'bg-[#27272a] text-white border border-[#3f3f46] shadow-sm' : 'text-zinc-400 border border-transparent hover:text-zinc-200 hover:bg-[#18181b]'}`}
            title="Strumento Mano (H)"
          >
            <Menu className="w-3.5 h-3.5 rotate-90 text-amber-400" />
            <span className="hidden md:inline">Sposta</span>
          </button>

          <span className="w-px h-4 bg-[#27272a] mx-1" />

          {/* Quick Adders */}
          <button
            onClick={() => handleQuickAdd('camera')}
            className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-[#18181b] border border-transparent hover:border-[#27272a] rounded-none transition"
            title="Aggiungi Camera"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleQuickAdd('light')}
            className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-[#18181b] border border-transparent hover:border-[#27272a] rounded-none transition"
            title="Aggiungi Sorgente Luce"
          >
            <Lightbulb className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleQuickAdd('person')}
            className="p-1.5 text-zinc-400 hover:text-pink-400 hover:bg-[#18181b] border border-transparent hover:border-[#27272a] rounded-none transition"
            title="Aggiungi Attore/Persona"
          >
            <UserPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleQuickAdd('prop')}
            className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-[#18181b] border border-transparent hover:border-[#27272a] rounded-none transition"
            title="Aggiungi Oggetto Generico"
          >
            <Box className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Controls (AI, Undo, Redo, Import/Export) */}
        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex bg-[#121214] border border-[#27272a] p-0.5 rounded-none">
            <button
              onClick={undo}
              disabled={historyIndex === 0}
              className="p-1.5 hover:bg-[#18181b] text-zinc-400 hover:text-white rounded-none disabled:opacity-30 disabled:hover:bg-transparent transition"
              title="Annulla (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 hover:bg-[#18181b] text-zinc-400 hover:text-white rounded-none disabled:opacity-30 disabled:hover:bg-transparent transition"
              title="Ripristina (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Import/Export */}
          <div className="flex items-center bg-[#121214] border border-[#27272a] p-0.5 rounded-none gap-0.5">
            <label className="p-1.5 hover:bg-[#18181b] text-zinc-400 hover:text-white rounded-none transition cursor-pointer" title="Importa JSON">
              <Upload className="w-3.5 h-3.5" />
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
            <button
              onClick={handleExportJSON}
              className="p-1.5 hover:bg-[#18181b] text-zinc-400 hover:text-white rounded-none transition"
              title="Esporta JSON"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Toggle */}
          <button
            onClick={() => setIsAiOpen(!isAiOpen)}
            className={`px-3 py-1.5 rounded-none text-[11px] font-bold flex items-center gap-1.5 transition ${isAiOpen ? 'bg-purple-800 text-white border border-purple-500 shadow-md shadow-purple-950/50' : 'bg-[#150f22] hover:bg-[#201535] border border-purple-900/50 text-purple-300'}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI ASSISTANT</span>
          </button>
        </div>
      </header>

      {/* 2. WORKSPACE CENTER BODY */}
      <div className="flex-1 flex min-h-0 relative">
        
        {/* Left Sidebar Library */}
        <SidebarLibrary />

        {/* Central interactive canvas viewport */}
        <div className="flex-1 h-full min-w-0 relative bg-[#0a0a0b]">
          <Canvas />

          {/* Welcoming guidelines banner */}
          {showWelcomeMsg && (
            <div className="absolute top-4 left-4 max-w-sm bg-[#0f0f11]/95 border border-[#27272a] p-4 rounded-none text-xs text-zinc-300 space-y-2.5 shadow-2xl backdrop-blur-md z-10 font-mono">
              <div className="flex justify-between items-center border-b border-[#27272a] pb-2">
                <div className="flex items-center gap-1.5 font-bold text-white uppercase tracking-wider text-[11px]">
                  <Info className="w-4 h-4 text-emerald-400" />
                  <span>Progettazione Set 2D</span>
                </div>
                <button
                  onClick={() => setShowWelcomeMsg(false)}
                  className="text-zinc-500 hover:text-zinc-200 font-mono text-[10px] uppercase border border-[#27272a] px-1 hover:bg-[#18181b]"
                >
                  chiudi [x]
                </button>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Trascina le camere e le luci per orientarle sul set. Usa l'<b>Inspector</b> a destra per sintonizzare focale lente (mm) e coni di luce!
              </p>
              <div className="flex items-center gap-3 text-[10px] text-zinc-500 pt-1">
                <span>• 1 Quadretto = 1 Metro</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Collapsible AI Panel */}
        {isAiOpen && (
          <div className="w-80 h-full bg-[#0f0f11] border-l border-[#27272a] flex flex-col z-20 shadow-2xl shrink-0 font-mono">
            <div className="p-4 border-b border-[#27272a] bg-[#0a0a0b]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-white">Sceneggiatore AI</h2>
              </div>
              <button
                onClick={() => setIsAiOpen(false)}
                className="text-zinc-500 hover:text-white text-[10px] uppercase border border-[#27272a] px-1 hover:bg-[#18181b]"
              >
                Chiudi
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              <AIAssistant />
            </div>
          </div>
        )}

        {/* Right Inspector Panel */}
        <InspectorPanel />
      </div>

      {/* 3. STORYBOARD TIMELINE SEQUENCE SECTION */}
      <ShotListTimeline />

    </div>
  );
}

