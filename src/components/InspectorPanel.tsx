import React from 'react';
import { useSceneStore } from '../store';
import { CameraElement, LightElement, PersonElement, PropElement } from '../types';
import { Settings, MousePointer, Info, AlignCenter, Sliders, Shield, HelpCircle, Eye, EyeOff, Lock, Unlock, Trash2, Copy } from 'lucide-react';

export default function InspectorPanel() {
  const {
    shots,
    activeShotId,
    selectedElementId,
    gridVisible,
    gridSnap,
    rulersVisible,
    updateElement,
    deleteElement,
    duplicateElement,
    toggleGrid,
    toggleSnap,
    toggleRulers
  } = useSceneStore();

  const currentShot = shots.find(s => s.id === activeShotId) || shots[0];
  const selectedElement = currentShot?.elements.find(el => el.id === selectedElementId);

  const handleBaseChange = (key: string, val: any) => {
    if (!selectedElement) return;
    updateElement(selectedElement.id, { [key]: val });
  };

  return (
    <div className="w-80 h-full bg-[#0f0f11] border-l border-[#27272a] flex flex-col z-10 shadow-lg font-mono text-xs">
      <div className="p-4 border-b border-[#27272a] bg-[#0a0a0b]/40 flex items-center gap-2">
        <Sliders className="w-4 h-4 text-purple-400" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-white font-display">Inspector</h2>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {selectedElement ? (
          <div className="p-4 space-y-5">
            {/* Element Identity */}
            <div className="bg-[#121214]/60 p-3 rounded-none border border-[#27272a] space-y-3">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest bg-[#150f22] border border-purple-900 px-1.5 py-0.5 rounded-none">
                    {selectedElement.type}
                  </span>
                  <input
                    type="text"
                    value={selectedElement.name}
                    onChange={(e) => handleBaseChange('name', e.target.value)}
                    className="block w-full bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-[#27272a] focus:border-[#3f3f46] focus:outline-none mt-1.5 font-sans"
                  />
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => duplicateElement(selectedElement.id)}
                    className="p-1.5 bg-[#0a0a0b] hover:bg-[#18181b] text-zinc-400 hover:text-white rounded-none border border-[#27272a] transition"
                    title="Duplica elemento"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteElement(selectedElement.id)}
                    className="p-1.5 bg-[#0a0a0b] hover:bg-[#18181b] text-zinc-400 hover:text-red-400 rounded-none border border-[#27272a] transition"
                    title="Elimina"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Position and Rotation coordinates */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block text-[8px] text-zinc-500 uppercase tracking-wider mb-0.5">Pos X (cm)</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.x)}
                    onChange={(e) => handleBaseChange('x', Number(e.target.value))}
                    className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-1.5 py-1 text-[11px] font-mono text-white focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
                <div>
                  <label className="block text-[8px] text-zinc-500 uppercase tracking-wider mb-0.5">Pos Y (cm)</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.y)}
                    onChange={(e) => handleBaseChange('y', Number(e.target.value))}
                    className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-1.5 py-1 text-[11px] font-mono text-white focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
                <div>
                  <label className="block text-[8px] text-zinc-500 uppercase tracking-wider mb-0.5">Rotaz. (°)</label>
                  <input
                    type="number"
                    value={selectedElement.rotation}
                    onChange={(e) => handleBaseChange('rotation', Number(e.target.value))}
                    className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-1.5 py-1 text-[11px] font-mono text-white focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>
              </div>
            </div>

            {/* --- CAMERA INSPECTOR --- */}
            {selectedElement.type === 'camera' && (() => {
              const cam = selectedElement as CameraElement;
              return (
                <div className="space-y-4">
                  <div className="border-t border-[#27272a] pt-3">
                    <h3 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Preset & Sensore</h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase mb-1">Lettera Cam</label>
                        <input
                          type="text"
                          value={cam.cameraNumber || 'A'}
                          maxLength={3}
                          onChange={(e) => handleBaseChange('cameraNumber', e.target.value.toUpperCase())}
                          className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none focus:border-[#3f3f46] font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase mb-1">Sensore</label>
                        <select
                          value={cam.sensor}
                          onChange={(e) => handleBaseChange('sensor', e.target.value)}
                          className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none focus:border-[#3f3f46]"
                        >
                          <option value="Full Frame">Full Frame (35mm)</option>
                          <option value="APS-C">APS-C</option>
                          <option value="Super 35">Super 35</option>
                          <option value="Medium Format">Medio Formato</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Lens slider and fov calculator */}
                  <div className="border-t border-[#27272a] pt-3 space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                          Lunghezza Focale
                        </label>
                        <span className="text-xs font-mono text-emerald-400 font-bold">{cam.focalLength}mm</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="200"
                        value={cam.focalLength}
                        onChange={(e) => handleBaseChange('focalLength', Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer bg-[#121214] h-1 rounded-none"
                      />
                      <div className="flex justify-between text-[8px] text-zinc-500 font-mono uppercase mt-0.5">
                        <span>Wide (12mm)</span>
                        <span>Tele (200mm)</span>
                      </div>
                    </div>

                    <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-none p-2.5 flex items-center justify-between text-xs text-emerald-300">
                      <span>Field of View (FOV) Calcolato:</span>
                      <span className="font-mono font-bold text-emerald-400">{cam.fov}°</span>
                    </div>

                    <div>
                      <label className="block text-[8px] text-zinc-500 uppercase tracking-wider mb-1">Shot Type (Inquadratura)</label>
                      <select
                        value={cam.shotType}
                        onChange={(e) => handleBaseChange('shotType', e.target.value)}
                        className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none focus:border-[#3f3f46]"
                      >
                        <option value="Extreme Wide">Extreme Wide Shot (Campo Lunghissimo)</option>
                        <option value="Wide">Wide Shot (Campo Lungo)</option>
                        <option value="Medium">Medium Shot (Mezza Figura)</option>
                        <option value="Close Up">Close Up (Primo Piano)</option>
                        <option value="Detail">Detail (Particolare)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] text-zinc-500 uppercase">Distanza Soggetto (Target)</label>
                        <span className="text-xs font-mono text-zinc-300">{cam.targetDistance} cm</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="800"
                        value={cam.targetDistance}
                        onChange={(e) => handleBaseChange('targetDistance', Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer bg-[#121214] h-1 rounded-none"
                      />
                    </div>
                  </div>

                  {/* Exposure Settings */}
                  <div className="border-t border-[#27272a] pt-3">
                    <h3 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Parametri Camera (Esposizione)</h3>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase mb-1">Diaframma</label>
                        <select
                          value={cam.aperture}
                          onChange={(e) => handleBaseChange('aperture', e.target.value)}
                          className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-1 py-1 text-[11px] text-white focus:outline-none"
                        >
                          <option value="f/1.2">f/1.2</option>
                          <option value="f/1.4">f/1.4</option>
                          <option value="f/1.8">f/1.8</option>
                          <option value="f/2.0">f/2.0</option>
                          <option value="f/2.8">f/2.8</option>
                          <option value="f/4.0">f/4.0</option>
                          <option value="f/5.6">f/5.6</option>
                          <option value="f/8.0">f/8.0</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase mb-1">ISO</label>
                        <select
                          value={cam.iso}
                          onChange={(e) => handleBaseChange('iso', Number(e.target.value))}
                          className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-1 py-1 text-[11px] text-white focus:outline-none"
                        >
                          <option value="100">100</option>
                          <option value="200">200</option>
                          <option value="400">400</option>
                          <option value="800">800</option>
                          <option value="1600">1600</option>
                          <option value="3200">3200</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase mb-1">Shutter</label>
                        <select
                          value={cam.shutter}
                          onChange={(e) => handleBaseChange('shutter', e.target.value)}
                          className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-1 py-1 text-[11px] text-white focus:outline-none"
                        >
                          <option value="1/25s">1/25s</option>
                          <option value="1/50s">1/50s</option>
                          <option value="1/100s">1/100s</option>
                          <option value="1/200s">1/200s</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Heights & Tilt */}
                  <div className="border-t border-[#27272a] pt-3">
                    <h3 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Posizionamento 3D</h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase mb-1">Altezza (cm)</label>
                        <input
                          type="number"
                          value={cam.cameraHeight || 150}
                          onChange={(e) => handleBaseChange('cameraHeight', Number(e.target.value))}
                          className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase mb-1">Inclinazione (Tilt °)</label>
                        <input
                          type="number"
                          value={cam.tilt || 0}
                          onChange={(e) => handleBaseChange('tilt', Number(e.target.value))}
                          className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* --- LIGHT INSPECTOR --- */}
            {selectedElement.type === 'light' && (() => {
              const light = selectedElement as LightElement;
              return (
                <div className="space-y-4">
                  <div className="border-t border-[#27272a] pt-3">
                    <h3 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Caratteristiche Lampada</h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase mb-1">Tipo Luce</label>
                        <select
                          value={light.lightType}
                          onChange={(e) => handleBaseChange('lightType', e.target.value)}
                          className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none focus:border-[#3f3f46]"
                        >
                          <option value="softbox">Softbox</option>
                          <option value="stripbox">Stripbox</option>
                          <option value="fresnel">Fresnel Lente</option>
                          <option value="led_panel">Pannello LED</option>
                          <option value="tube_light">Tube Light</option>
                          <option value="spot">Faro Spot</option>
                          <option value="bounce">Pannello Riflettente</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase mb-1">Altezza Stativo (cm)</label>
                        <input
                          type="number"
                          value={light.lightHeight || 180}
                          onChange={(e) => handleBaseChange('lightHeight', Number(e.target.value))}
                          className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Intensity and Temp */}
                  <div className="border-t border-[#27272a] pt-3 space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                          Intensità (Watt / %)
                        </label>
                        <span className="text-xs font-mono text-amber-400 font-bold">{light.intensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={light.intensity}
                        onChange={(e) => handleBaseChange('intensity', Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer bg-[#121214] h-1 rounded-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                          Temperatura Colore
                        </label>
                        <span className="text-xs font-mono text-orange-300 font-bold">{light.colorTemperature}K</span>
                      </div>
                      <input
                        type="range"
                        min="2000"
                        max="9000"
                        step="100"
                        value={light.colorTemperature}
                        onChange={(e) => handleBaseChange('colorTemperature', Number(e.target.value))}
                        className="w-full accent-orange-400 cursor-pointer bg-[#121214] h-1 rounded-none"
                      />
                      <div className="flex justify-between text-[8px] text-zinc-500 font-mono uppercase">
                        <span>Warm (2000K)</span>
                        <span>Cool (9000K)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                          Angolo del Fascio
                        </label>
                        <span className="text-xs font-mono text-amber-400 font-bold">{light.beamAngle}°</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="180"
                        value={light.beamAngle}
                        onChange={(e) => handleBaseChange('beamAngle', Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer bg-[#121214] h-1 rounded-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] text-zinc-500 uppercase">Decadimento (Falloff cm)</label>
                        <span className="text-xs font-mono text-zinc-400">{light.falloff || 300} cm</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="1000"
                        value={light.falloff || 300}
                        onChange={(e) => handleBaseChange('falloff', Number(e.target.value))}
                        className="w-full accent-zinc-550 cursor-pointer bg-[#121214] h-1 rounded-none"
                      />
                    </div>
                  </div>

                  {/* Gel & DMX */}
                  <div className="border-t border-[#27272a] pt-3">
                    <h3 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Gelatine & DMX</h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase mb-1">Gelatina (Nome)</label>
                        <input
                          type="text"
                          placeholder="CTO, CTB, Magenta..."
                          value={light.gelName || ''}
                          onChange={(e) => handleBaseChange('gelName', e.target.value)}
                          className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase mb-1">Canale DMX</label>
                        <input
                          type="number"
                          min={1}
                          max={512}
                          value={light.dmxChannel || 1}
                          onChange={(e) => handleBaseChange('dmxChannel', Number(e.target.value))}
                          className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* --- PERSON INSPECTOR --- */}
            {selectedElement.type === 'person' && (() => {
              const pers = selectedElement as PersonElement;
              return (
                <div className="space-y-4">
                  <div className="border-t border-[#27272a] pt-3">
                    <h3 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Profilo Soggetto</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[8px] text-zinc-500 uppercase mb-1">Ruolo Set</label>
                        <select
                          value={pers.role}
                          onChange={(e) => handleBaseChange('role', e.target.value)}
                          className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none focus:border-[#3f3f46]"
                        >
                          <option value="Actor">Attore Protagonista</option>
                          <option value="Model">Modella / Soggetto</option>
                          <option value="Extra">Comparsa (Extra)</option>
                          <option value="Photographer">Fotografo</option>
                          <option value="Crew">Operatore / Regista</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[9px] text-zinc-500 uppercase">Direzione Sguardo (Gaze)</label>
                          <span className="text-xs font-mono text-zinc-300">{pers.lookAngle}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={pers.lookAngle}
                          onChange={(e) => handleBaseChange('lookAngle', Number(e.target.value))}
                          className="w-full accent-pink-500 cursor-pointer bg-[#121214] h-1 rounded-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8px] text-zinc-500 uppercase mb-1">Posa</label>
                          <select
                            value={pers.pose}
                            onChange={(e) => handleBaseChange('pose', e.target.value)}
                            className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none"
                          >
                            <option value="standing">In piedi</option>
                            <option value="sitting">Seduto</option>
                            <option value="kneeling">Inginocchiato</option>
                            <option value="action">In movimento</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[8px] text-zinc-500 uppercase mb-1">Altezza (cm)</label>
                          <input
                            type="number"
                            value={pers.personHeight}
                            onChange={(e) => handleBaseChange('personHeight', Number(e.target.value))}
                            className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* --- PROP / OTHER INSPECTOR --- */}
            {(selectedElement.type === 'prop' ||
              selectedElement.type === 'environment' ||
              selectedElement.type === 'nature' ||
              selectedElement.type === 'vehicle' ||
              selectedElement.type === 'furniture') && (() => {
                const pr = selectedElement as any;
                return (
                  <div className="space-y-4">
                    <div className="border-t border-[#27272a] pt-3">
                      <h3 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Dimensioni Reali</h3>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8px] text-zinc-500 uppercase mb-1">Larghezza (cm)</label>
                          <input
                            type="number"
                            value={pr.width || 100}
                            onChange={(e) => handleBaseChange('width', Math.max(1, Number(e.target.value)))}
                            className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-zinc-500 uppercase mb-1">Profondità (cm)</label>
                          <input
                            type="number"
                            value={pr.height || 100}
                            onChange={(e) => handleBaseChange('height', Math.max(1, Number(e.target.value)))}
                            className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#27272a] pt-3">
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Colore Oggetto</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={pr.color || '#64748b'}
                          onChange={(e) => handleBaseChange('color', e.target.value)}
                          className="w-8 h-8 bg-transparent border-0 rounded-none cursor-pointer"
                        />
                        <input
                          type="text"
                          value={pr.color || '#64748b'}
                          onChange={(e) => handleBaseChange('color', e.target.value)}
                          className="flex-1 bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* General Properties */}
            <div className="border-t border-[#27272a] pt-3 space-y-3">
              <h3 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Proprietà Generali</h3>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9px] text-zinc-500 uppercase">Opacità Blueprint</label>
                  <span className="text-xs font-mono text-zinc-400">{Math.round(selectedElement.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={selectedElement.opacity}
                  onChange={(e) => handleBaseChange('opacity', Number(e.target.value))}
                  className="w-full accent-zinc-400 cursor-pointer bg-[#121214] h-1 rounded-none"
                />
              </div>

              <div>
                <label className="block text-[8px] text-zinc-500 uppercase tracking-wider mb-1">Z-Index (Ordine)</label>
                <input
                  type="number"
                  value={selectedElement.zIndex}
                  onChange={(e) => handleBaseChange('zIndex', Number(e.target.value))}
                  className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[8px] text-zinc-500 uppercase tracking-wider mb-1">Etichetta Alternativa (Label)</label>
                <input
                  type="text"
                  placeholder={selectedElement.name}
                  value={selectedElement.label || ''}
                  onChange={(e) => handleBaseChange('label', e.target.value)}
                  className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[8px] text-zinc-500 uppercase tracking-wider mb-1">Note Tecniche</label>
                <textarea
                  rows={2}
                  placeholder="Es. stativo a giraffa, presa a muro..."
                  value={selectedElement.notes || ''}
                  onChange={(e) => handleBaseChange('notes', e.target.value)}
                  className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-none px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#3f3f46] resize-none font-mono"
                />
              </div>
            </div>

          </div>
        ) : (
          /* Empty state - Show helpful guidelines & shortcuts */
          <div className="p-4 space-y-6 text-xs text-zinc-400">
            <div className="bg-[#0a0a0b]/40 p-4 rounded-none border border-[#27272a] flex flex-col items-center text-center space-y-2">
              <MousePointer className="w-5 h-5 text-zinc-600 mb-1" />
              <p className="font-bold text-zinc-300 uppercase tracking-wider text-[10px]">Nessun elemento selezionato</p>
              <p className="text-[10px] text-zinc-500 leading-normal font-mono">
                Clicca un elemento sul canvas o nell'elenco dei livelli per sintonizzare i parametri tecnici ed espositivi.
              </p>
            </div>

            {/* Canvas Preferences Form */}
            <div className="space-y-3 bg-[#0a0a0b]/20 p-3 rounded-none border border-[#27272a]">
              <h3 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2 border-b border-[#27272a] pb-1">Preferenze Canvas</h3>
              
              <div className="flex items-center justify-between text-[11px]">
                <span>Visualizza Griglia</span>
                <button
                  onClick={toggleGrid}
                  className={`w-8 h-4 rounded-none relative transition ${gridVisible ? 'bg-emerald-600' : 'bg-zinc-800'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-none bg-white transition ${gridVisible ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span>Snap alla Griglia (10cm)</span>
                <button
                  onClick={toggleSnap}
                  className={`w-8 h-4 rounded-none relative transition ${gridSnap ? 'bg-emerald-600' : 'bg-zinc-800'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-none bg-white transition ${gridSnap ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span>Visualizza Righelli</span>
                <button
                  onClick={toggleRulers}
                  className={`w-8 h-4 rounded-none relative transition ${rulersVisible ? 'bg-emerald-600' : 'bg-zinc-800'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-none bg-white transition ${rulersVisible ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Interactive Keyboard Shortcuts */}
            <div className="space-y-2.5">
              <h3 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest border-b border-[#27272a] pb-1">Figma Shortcuts</h3>
              
              <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-zinc-500 uppercase tracking-tight">
                <div className="flex flex-col gap-0.5"><kbd className="bg-[#121214] border border-[#27272a] px-1 py-0.5 rounded-none text-zinc-300 text-[9px] w-fit">Spazio + Drag</kbd><span>Sposta Canvas</span></div>
                <div className="flex flex-col gap-0.5"><kbd className="bg-[#121214] border border-[#27272a] px-1 py-0.5 rounded-none text-zinc-300 text-[9px] w-fit">Scroll</kbd><span>Zoom in / out</span></div>
                <div className="flex flex-col gap-0.5"><kbd className="bg-[#121214] border border-[#27272a] px-1 py-0.5 rounded-none text-zinc-300 text-[9px] w-fit">Shift + Drag</kbd><span>Blocca asse</span></div>
                <div className="flex flex-col gap-0.5"><kbd className="bg-[#121214] border border-[#27272a] px-1 py-0.5 rounded-none text-zinc-300 text-[9px] w-fit">Alt + Drag</kbd><span>Duplica nodo</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
