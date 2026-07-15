import React, { useState } from 'react';
import { useSceneStore } from '../store';
import { PRESET_LIBRARY, ELEMENT_CATEGORIES } from '../library';
import { Camera, Lightbulb, Users, Layers, Layout, HelpCircle, Eye, EyeOff, Lock, Unlock, Trash2, Plus, Download, Upload } from 'lucide-react';
import { ElementType } from '../types';

export default function SidebarLibrary() {
  const {
    shots,
    activeShotId,
    selectedElementId,
    tool,
    addElement,
    deleteElement,
    selectElement,
    updateElement,
    setTool
  } = useSceneStore();

  const currentShot = shots.find(s => s.id === activeShotId) || shots[0];
  const elements = currentShot?.elements || [];

  const [activeTab, setActiveTab] = useState<'presets' | 'layers' | 'custom'>('presets');
  const [selectedCategory, setSelectedCategory] = useState<string>(ELEMENT_CATEGORIES.CAMERA);

  // Custom Prop Creator States
  const [customName, setCustomName] = useState('Pannello Diffusore');
  const [customWidth, setCustomWidth] = useState(150);
  const [customHeight, setCustomHeight] = useState(25);
  const [customColor, setCustomColor] = useState('#ffffff');
  const [customPath, setCustomPath] = useState('backdrop');

  const categoriesList = Object.values(ELEMENT_CATEGORIES);

  const handleAddPreset = (preset: typeof PRESET_LIBRARY[0]) => {
    addElement(preset.type, 0, 0, {
      name: preset.name,
      color: preset.color,
      width: preset.width,
      height: preset.height,
      customSvgPath: preset.customSvgPath,
      ...preset.props
    });
  };

  const handleAddCustomProp = () => {
    addElement('prop', 0, 0, {
      name: customName,
      color: customColor,
      width: Number(customWidth),
      height: Number(customHeight),
      customSvgPath: customPath,
      propType: customPath
    });
  };

  // Preselected categories icons
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case ELEMENT_CATEGORIES.CAMERA: return <Camera className="w-4 h-4" />;
      case ELEMENT_CATEGORIES.LIGHT: return <Lightbulb className="w-4 h-4" />;
      case ELEMENT_CATEGORIES.PERSON: return <Users className="w-4 h-4" />;
      default: return <Layout className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-80 h-full bg-[#0f0f11] border-r border-[#27272a] flex flex-col z-10 shadow-lg font-sans">
      {/* Header */}
      <div className="p-4 border-b border-[#27272a] bg-[#0a0a0b]/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-950/40 border border-purple-500/20 rounded-none">
            <Layers className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-widest text-white leading-none uppercase font-display">Scene Designer</h1>
            <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">v1.2 • 2026 pre-viz</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#27272a] bg-[#0a0a0b]/20 p-1 gap-1 font-mono">
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-none transition ${activeTab === 'presets' ? 'bg-[#27272a] text-white border border-[#3f3f46]' : 'text-zinc-500 border border-transparent hover:text-zinc-300'}`}
        >
          Libreria
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-none transition relative ${activeTab === 'layers' ? 'bg-[#27272a] text-white border border-[#3f3f46]' : 'text-zinc-500 border border-transparent hover:text-zinc-300'}`}
        >
          Livelli
          {elements.length > 0 && (
            <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-purple-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-none transition ${activeTab === 'custom' ? 'bg-[#27272a] text-white border border-[#3f3f46]' : 'text-zinc-500 border border-transparent hover:text-zinc-300'}`}
        >
          Personalizza
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        
        {/* TAB 1: PRESET LIBRARY */}
        {activeTab === 'presets' && (
          <div className="flex h-full min-h-0">
            {/* Category selection bar */}
            <div className="w-16 border-r border-[#27272a] flex flex-col items-center py-2 gap-3 bg-[#0a0a0b]/40 shrink-0">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-2.5 rounded-none transition-all relative group border ${selectedCategory === cat ? 'bg-[#27272a] text-purple-400 border-[#3f3f46]' : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-[#121214]'}`}
                  title={cat}
                >
                  {getCategoryIcon(cat)}
                  {/* Tooltip */}
                  <span className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-[#0a0a0b] text-white text-[10px] rounded-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-30 shadow-lg border border-[#27272a]">
                    {cat}
                  </span>
                </button>
              ))}
            </div>

            {/* Presets Grid */}
            <div className="flex-1 p-3 overflow-y-auto min-h-0 bg-[#0a0a0b]/10">
              <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono mb-3 border-b border-[#27272a] pb-1.5 flex items-center justify-between">
                <span>{selectedCategory}</span>
                <span className="text-[8px] text-zinc-500">GRID VIEW</span>
              </h2>
              
              <div className="grid grid-cols-2 gap-2">
                {PRESET_LIBRARY.filter(item => item.category === selectedCategory).map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddPreset(preset)}
                    className="flex flex-col items-start p-2 bg-[#121214]/40 hover:bg-[#18181b] hover:border-zinc-500 border border-[#27272a] rounded-none transition text-left group font-mono"
                  >
                    {/* Visual representative icon style depending on item type */}
                    <div className="w-full h-12 rounded-none bg-[#0a0a0b] mb-2 flex items-center justify-center border border-[#27272a] group-hover:border-[#3f3f46] transition">
                      {preset.type === 'camera' && <Camera className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />}
                      {preset.type === 'light' && <Lightbulb className="w-5 h-5 text-amber-400 group-hover:scale-110 transition" />}
                      {preset.type === 'person' && <Users className="w-5 h-5 text-pink-400 group-hover:scale-110 transition" />}
                      {preset.type === 'prop' && <Layout className="w-5 h-5 text-zinc-400 group-hover:scale-110 transition" />}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-300 truncate w-full group-hover:text-white transition">
                      {preset.name}
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-tight">
                      {preset.width}x{preset.height} cm
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FIGMA-STYLE LAYER SYSTEM */}
        {activeTab === 'layers' && (
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-[#27272a] pb-2">
              <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider font-mono">
                Livelli in Scena ({elements.length})
              </span>
              {elements.length > 0 && (
                <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-tight">Z-index Auto</span>
              )}
            </div>

            {elements.length === 0 ? (
              <div className="py-12 text-center text-zinc-600 flex flex-col items-center justify-center border border-dashed border-[#27272a] rounded-none p-4 font-mono">
                <Layers className="w-8 h-8 opacity-40 mb-2 text-zinc-500" />
                <p className="text-xs">Nessun elemento sul set.</p>
                <button
                  onClick={() => setActiveTab('presets')}
                  className="mt-3 text-xs text-purple-400 hover:text-purple-300 underline font-semibold"
                >
                  Sfoglia la libreria
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {elements
                  .slice()
                  .sort((a, b) => b.zIndex - a.zIndex) // Display topmost elements first
                  .map((el) => {
                    const isSelected = selectedElementId === el.id;
                    return (
                      <div
                        key={el.id}
                        onClick={() => selectElement(el.id)}
                        className={`flex items-center justify-between p-2 rounded-none cursor-pointer border transition font-mono ${isSelected ? 'bg-purple-950/20 border-purple-800 text-purple-200' : 'bg-[#0a0a0b]/40 border-[#27272a] hover:bg-[#121214] hover:border-zinc-500 text-zinc-300'}`}
                      >
                        <div className="flex items-center gap-2 truncate min-w-0">
                          {/* Colored element badge */}
                          <span
                            className="w-2 h-2 rounded-none shrink-0"
                            style={{ backgroundColor: el.color }}
                          />
                          <span className="text-xs font-medium truncate">
                            {el.name}
                          </span>
                        </div>

                        {/* Visibility & Lock indicators */}
                        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100">
                          {/* Hide */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateElement(el.id, { hidden: !el.hidden });
                            }}
                            className="p-1 hover:text-white rounded-none hover:bg-[#27272a] transition"
                            title={el.hidden ? 'Mostra' : 'Nascondi'}
                          >
                            {el.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          
                          {/* Lock */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateElement(el.id, { locked: !el.locked });
                            }}
                            className="p-1 hover:text-white rounded-none hover:bg-[#27272a] transition"
                            title={el.locked ? 'Sblocca' : 'Blocca'}
                          >
                            {el.locked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteElement(el.id);
                            }}
                            className="p-1 hover:text-red-400 rounded-none hover:bg-[#27272a] transition"
                            title="Elimina"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CUSTOM SVG CREATOR */}
        {activeTab === 'custom' && (
          <div className="p-4 space-y-4 font-mono">
            <div>
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest border-b border-[#27272a] pb-1.5">Nuovo Elemento</h3>
              <p className="text-[10px] text-zinc-500 mt-1">Definisci forme e dimensioni reali sul piano cartesiano.</p>
            </div>

            {/* Form */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Nome Oggetto</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#3f3f46]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Largh. (cm)</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#3f3f46] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Prof. (cm)</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#3f3f46] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Forma / Simbolo</label>
                <select
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                  className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#3f3f46]"
                >
                  <option value="box">Rettangolo Standard</option>
                  <option value="wall">Parete Spessa</option>
                  <option value="door">Porta Interna</option>
                  <option value="window">Finestra</option>
                  <option value="cyclorama">Cyclorama Curvo</option>
                  <option value="backdrop">Fondale (Backdrop)</option>
                  <option value="car">Automobile Berlina</option>
                  <option value="table">Tavolo d'Arredo</option>
                  <option value="chair">Sedia</option>
                  <option value="sofa">Divano</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Colore Blueprint</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-8 h-8 bg-transparent border-0 rounded-none cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="flex-1 bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#3f3f46] font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleAddCustomProp}
                className="w-full bg-purple-900/60 hover:bg-purple-800 border border-purple-500 text-white font-medium py-2 px-3 rounded-none text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Aggiungi al set
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
