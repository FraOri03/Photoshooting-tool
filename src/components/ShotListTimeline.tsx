import React, { useState } from 'react';
import { useSceneStore } from '../store';
import { Plus, Trash2, Copy, CheckSquare, Square, CheckCircle2, Clock, ListChecks, ChevronUp, ChevronDown, Award } from 'lucide-react';
import { Shot } from '../types';

export default function ShotListTimeline() {
  const {
    shots,
    activeShotId,
    addShot,
    deleteShot,
    duplicateShot,
    selectShot,
    updateShotProperties,
    pushHistory
  } = useSceneStore();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const activeShot = shots.find(s => s.id === activeShotId) || shots[0];

  const handleShotChange = (key: string, val: any) => {
    if (!activeShot) return;
    updateShotProperties(activeShot.id, { [key]: val });
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;
    
    const newItem = {
      id: crypto.randomUUID().slice(0, 8),
      text: newChecklistItem.trim(),
      done: false
    };

    const currentChecklist = activeShot.checklist || [];
    const updatedChecklist = [...currentChecklist, newItem];
    
    handleShotChange('checklist', updatedChecklist);
    setNewChecklistItem('');
    
    // Save to undo history
    pushHistory();
  };

  const handleToggleChecklist = (itemId: string) => {
    const currentChecklist = activeShot.checklist || [];
    const updatedChecklist = currentChecklist.map(item => 
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    handleShotChange('checklist', updatedChecklist);
  };

  const handleDeleteChecklist = (itemId: string) => {
    const currentChecklist = activeShot.checklist || [];
    const updatedChecklist = currentChecklist.filter(item => item.id !== itemId);
    handleShotChange('checklist', updatedChecklist);
  };

  return (
    <div className="bg-[#0f0f11] border-t border-[#27272a] flex flex-col z-10 shadow-2xl shrink-0 transition-all duration-300 font-mono text-xs">
      {/* Header Bar */}
      <div className="px-4 py-2 bg-[#0a0a0b]/60 flex items-center justify-between border-b border-[#27272a]">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-white font-display">
            Storyboard & Timeline dei Take
          </span>
          <span className="text-[10px] font-mono text-zinc-400 bg-[#27272a] border border-[#3f3f46] px-1.5 py-0.5 rounded-none">
            {shots.length} Scene / Setup
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-[#121214] text-zinc-400 hover:text-white rounded-none transition cursor-pointer"
            title={isCollapsed ? "Espandi" : "Riduci"}
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {!isCollapsed && (
        <div className="flex h-56 min-h-0 divide-x divide-[#27272a]">
          
          {/* Timeline Shot Cards Scrollbar */}
          <div className="w-80 flex flex-col min-h-0">
            <div className="p-2 border-b border-[#27272a] bg-[#0a0a0b]/20 flex justify-between items-center shrink-0">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Sequenza Inquadrature</span>
              <button
                onClick={addShot}
                className="bg-[#1a142e] hover:bg-[#251b41] text-purple-400 border border-purple-800/60 font-semibold py-1 px-2 rounded-none text-[10px] flex items-center gap-1 transition cursor-pointer"
                title="Aggiungi nuovo shot basato su questo layout"
              >
                <Plus className="w-3 h-3" /> Nuova Inquadratura
              </button>
            </div>

            <div className="flex-1 overflow-x-hidden overflow-y-auto p-2 space-y-2 bg-[#0a0a0b]/10 scrollbar-thin">
              {shots.map((shot, idx) => {
                const isActive = shot.id === activeShotId;
                return (
                  <div
                    key={shot.id}
                    onClick={() => selectShot(shot.id)}
                    className={`p-2.5 rounded-none border cursor-pointer transition flex justify-between items-start group ${isActive ? 'bg-[#1a142e]/30 border-purple-800/80 text-white shadow-md' : 'bg-[#121214]/60 border-[#27272a] hover:border-[#3f3f46] text-zinc-300'}`}
                  >
                    <div className="truncate min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-purple-400 font-mono">
                          #{shot.number || idx + 1}
                        </span>
                        <span className="text-xs font-semibold truncate leading-none">
                          {shot.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 truncate mt-1 leading-normal">
                        {shot.description || 'Nessuna descrizione.'}
                      </p>
                      
                      {/* Shot details strip */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[8px] font-mono bg-[#1c1c1f] border border-[#27272a] px-1 py-0.5 rounded-none text-zinc-400">
                          {shot.duration || '5s'}
                        </span>
                        <span className={`text-[8px] font-semibold px-1 py-0.5 rounded-none uppercase ${shot.priority === 'High' ? 'bg-red-950/40 border border-red-900/40 text-red-400' : 'bg-[#27272a] border border-[#3f3f46] text-zinc-400'}`}>
                          {shot.priority}
                        </span>
                        <span className="text-[8px] font-mono text-zinc-500">
                          {shot.elements?.length || 0} oggetti
                        </span>
                      </div>
                    </div>

                    {/* Timeline Controls */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateShot(shot.id);
                        }}
                        className="p-1 hover:bg-[#27272a] rounded-none text-zinc-400 hover:text-white cursor-pointer"
                        title="Duplica inquadratura"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteShot(shot.id);
                        }}
                        className="p-1 hover:bg-[#27272a] rounded-none text-zinc-400 hover:text-red-400 cursor-pointer"
                        title="Elimina"
                        disabled={shots.length <= 1}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Shot Detail Form */}
          <div className="flex-1 flex min-h-0">
            {/* Left Side: General description */}
            <div className="flex-1 p-3.5 space-y-3 overflow-y-auto min-h-0">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[8px] text-zinc-500 uppercase tracking-wider mb-1">Titolo Scena / Shot</label>
                  <input
                    type="text"
                    value={activeShot.name}
                    onChange={(e) => handleShotChange('name', e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] text-zinc-500 uppercase tracking-wider mb-1">Durata Prevista</label>
                    <input
                      type="text"
                      value={activeShot.duration || '10s'}
                      onChange={(e) => handleShotChange('duration', e.target.value)}
                      className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none focus:border-[#3f3f46] text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-zinc-500 uppercase tracking-wider mb-1">Priorità</label>
                    <select
                      value={activeShot.priority}
                      onChange={(e) => handleShotChange('priority', e.target.value)}
                      className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none"
                    >
                      <option value="High">Alta</option>
                      <option value="Medium">Media</option>
                      <option value="Low">Bassa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] text-zinc-500 uppercase tracking-wider mb-1">Stato Ripresa</label>
                  <select
                    value={activeShot.status}
                    onChange={(e) => handleShotChange('status', e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none focus:border-[#3f3f46]"
                  >
                    <option value="Draft">Bozza (Draft)</option>
                    <option value="Planned">Pianificato (Planned)</option>
                    <option value="Approved">Approvato (Approved)</option>
                    <option value="Shot">GIRATO (Shot)</option>
                    <option value="Omitted">Oggiato (Omitted)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[8px] text-zinc-500 uppercase tracking-wider mb-1">Descrizione Tecnica</label>
                  <textarea
                    rows={3}
                    value={activeShot.description}
                    onChange={(e) => handleShotChange('description', e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#3f3f46] resize-none font-mono"
                    placeholder="Note descrittive..."
                  />
                </div>
                <div>
                  <label className="block text-[8px] text-zinc-500 uppercase tracking-wider mb-1">Storyboard / Movimento Scenico</label>
                  <textarea
                    rows={3}
                    value={activeShot.storyboardText || ''}
                    onChange={(e) => handleShotChange('storyboardText', e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#3f3f46] resize-none font-mono"
                    placeholder="Esempio: La camera effettua una panoramica orizzontale seguendo l'attore..."
                  />
                </div>
              </div>
            </div>

            {/* Right Side: To-Do Checklist */}
            <div className="w-80 p-3.5 flex flex-col min-h-0 bg-[#0a0a0b]/30">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block border-b border-[#27272a] pb-1">
                To-Do Checklist del Take
              </span>

              {/* Checklist list */}
              <div className="flex-1 overflow-y-auto space-y-1 mb-2 pr-1 min-h-0 scrollbar-thin">
                {(!activeShot.checklist || activeShot.checklist.length === 0) ? (
                  <p className="text-[10px] text-zinc-600 italic py-6 text-center">Nessuna azione pianificata.</p>
                ) : (
                  activeShot.checklist.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-1.5 rounded-none bg-[#0c0c0e] border border-[#27272a] hover:bg-[#121214] transition"
                    >
                      <button
                        onClick={() => handleToggleChecklist(item.id)}
                        className="flex items-center gap-2 text-left text-xs text-zinc-300 truncate cursor-pointer"
                      >
                        {item.done ? (
                          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-none border border-[#3f3f46] shrink-0" />
                        )}
                        <span className={`truncate ${item.done ? 'line-through text-zinc-600' : ''}`}>
                          {item.text}
                        </span>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteChecklist(item.id)}
                        className="p-0.5 hover:text-red-400 text-zinc-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add checklist item */}
              <form onSubmit={handleAddChecklist} className="flex gap-1 shrink-0">
                <input
                  type="text"
                  placeholder="Azione (es. Carica bat.)"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  className="flex-1 bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none focus:border-[#3f3f46]"
                />
                <button
                  type="submit"
                  className="bg-[#1a142e] hover:bg-[#251b41] text-purple-400 border border-purple-800/60 rounded-none px-2.5 text-xs font-semibold cursor-pointer"
                >
                  Ok
                </button>
              </form>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
