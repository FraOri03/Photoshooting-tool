import { create } from 'zustand';
import { SceneState, SceneElement, Shot, ElementType, CameraElement, LightElement, PersonElement, PropElement } from './types';

// Initial fallback/default elements to give a stunning starting experience
const getInitialElements = (): SceneElement[] => [
  {
    id: 'actor-init',
    type: 'person',
    name: 'Soggetto Principal',
    x: 0,
    y: 0,
    rotation: 90,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    zIndex: 1,
    locked: false,
    hidden: false,
    color: '#a855f7',
    role: 'Model',
    lookAngle: 270,
    personHeight: 175,
    pose: 'standing'
  } as PersonElement,
  {
    id: 'camera-init',
    type: 'camera',
    name: 'Camera A (Cinema)',
    x: 0,
    y: 350,
    rotation: 270,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    zIndex: 2,
    locked: false,
    hidden: false,
    color: '#10b981',
    sensor: 'Full Frame',
    focalLength: 50,
    fov: 46,
    aperture: 'f/2.8',
    iso: 400,
    shutter: '1/50s',
    cameraHeight: 150,
    tilt: 0,
    pan: 270,
    roll: 0,
    cameraNumber: 'A',
    shotType: 'Medium',
    targetDistance: 350
  } as CameraElement,
  {
    id: 'light-init-key',
    type: 'light',
    name: 'Softbox Key Light',
    x: -160,
    y: 200,
    rotation: 320,
    scaleX: 1,
    scaleY: 1,
    opacity: 0.9,
    zIndex: 3,
    locked: false,
    hidden: false,
    color: '#FFE0B2',
    lightType: 'softbox',
    intensity: 80,
    colorTemperature: 5600,
    beamAngle: 65,
    falloff: 300,
    lightHeight: 200,
    showTargetLine: true,
    targetX: 0,
    targetY: 0
  } as LightElement,
  {
    id: 'light-init-rim',
    type: 'light',
    name: 'Tube Light Rim',
    x: 100,
    y: -140,
    rotation: 120,
    scaleX: 1,
    scaleY: 1,
    opacity: 0.8,
    zIndex: 4,
    locked: false,
    hidden: false,
    color: '#E0F7FA',
    lightType: 'tube_light',
    intensity: 50,
    colorTemperature: 6500,
    beamAngle: 120,
    falloff: 200,
    lightHeight: 180,
    showTargetLine: false
  } as LightElement,
  {
    id: 'backdrop-init',
    type: 'prop',
    name: 'Wall Background',
    x: 0,
    y: -120,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    zIndex: 0,
    locked: true,
    hidden: false,
    color: '#3f3f46',
    propType: 'backdrop',
    width: 400,
    height: 15
  } as PropElement
];

const initialShots: Shot[] = [
  {
    id: 'shot-1',
    number: 1,
    name: '01 - Master Setup (Medium Wide)',
    description: 'Medium wide shot establishing character position relative to key softbox lighting.',
    storyboardText: 'L\'attore guarda in macchina. La luce principale illumina il lato destro del viso, creando un piacevole contrasto di chiaroscuro.',
    duration: '10s',
    priority: 'High',
    status: 'Planned',
    colorTag: '#10b981',
    checklist: [
      { id: 'c1', text: 'Posizionare stativi e Softbox', done: true },
      { id: 'c2', text: 'Impostare Camera A a f/2.8, ISO 400', done: true },
      { id: 'c3', text: 'Filtro di diffusione su obiettivo', done: false }
    ],
    elements: getInitialElements()
  }
];

export interface SceneActions {
  addElement: (type: ElementType, x: number, y: number, customProps?: Partial<SceneElement>) => void;
  updateElement: (id: string, partial: Partial<SceneElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  setCanvasTransform: (scale: number, tx: number, ty: number) => void;
  setTool: (tool: SceneState['tool']) => void;
  setTheme: (theme: SceneState['theme']) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  toggleRulers: () => void;
  
  // Shots & Timeline
  addShot: () => void;
  duplicateShot: (shotId: string) => void;
  deleteShot: (shotId: string) => void;
  selectShot: (shotId: string) => void;
  updateShotProperties: (shotId: string, partial: Partial<Shot>) => void;
  reorderShots: (reordered: Shot[]) => void;

  // History Undo/Redo
  pushHistory: (customShots?: Shot[]) => void;
  undo: () => void;
  redo: () => void;

  // JSON Save/Load
  loadFromJSON: (jsonString: string) => boolean;
  loadRawElements: (elements: SceneElement[]) => void;
  resetAll: () => void;
}

export type SceneStoreType = SceneState & SceneActions;

export const useSceneStore = create<SceneStoreType>((set, get) => ({
  shots: initialShots,
  activeShotId: 'shot-1',
  selectedElementId: null,
  canvasScale: 1,
  canvasTranslateX: 300, // offset canvas center
  canvasTranslateY: 250,
  tool: 'select',
  gridVisible: true,
  gridSnap: true,
  rulersVisible: true,
  theme: 'dark',
  history: [JSON.parse(JSON.stringify(initialShots))],
  historyIndex: 0,

  pushHistory: (customShots) => {
    const { shots, history, historyIndex } = get();
    const targetShots = customShots ? customShots : shots;
    const copied = JSON.parse(JSON.stringify(targetShots));
    
    // Slice off any redo history if we were in the middle of undoing
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(copied);

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
      shots: targetShots
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const prevShotsState = JSON.parse(JSON.stringify(history[targetIndex]));
      set({
        shots: prevShotsState,
        historyIndex: targetIndex,
        selectedElementId: null
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const nextShotsState = JSON.parse(JSON.stringify(history[targetIndex]));
      set({
        shots: nextShotsState,
        historyIndex: targetIndex,
        selectedElementId: null
      });
    }
  },

  setCanvasTransform: (scale, tx, ty) => set({
    canvasScale: Math.max(0.05, Math.min(20, scale)),
    canvasTranslateX: tx,
    canvasTranslateY: ty
  }),

  setTool: (tool) => set({ tool }),

  setTheme: (theme) => set({ theme }),

  toggleGrid: () => set((state) => ({ gridVisible: !state.gridVisible })),
  toggleSnap: () => set((state) => ({ gridSnap: !state.gridSnap })),
  toggleRulers: () => set((state) => ({ rulersVisible: !state.rulersVisible })),

  selectElement: (id) => set({ selectedElementId: id }),

  addElement: (type, x, y, customProps = {}) => {
    const { shots, activeShotId } = get();
    const id = `${type}-${crypto.randomUUID().slice(0, 8)}`;
    
    // Create element with standard reasonable defaults
    let newElement: SceneElement;

    const base = {
      id,
      type,
      name: `${type.toUpperCase()} ${shots.flatMap(s => s.elements).filter(e => e.type === type).length + 1}`,
      x,
      y,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      zIndex: 10,
      locked: false,
      hidden: false,
      color: '#3b82f6',
      notes: ''
    };

    if (type === 'camera') {
      newElement = {
        ...base,
        name: `Camera ${String.fromCharCode(65 + shots.flatMap(s => s.elements).filter(e => e.type === 'camera').length)}`,
        color: '#10b981',
        sensor: 'Full Frame',
        focalLength: 50,
        fov: 46,
        aperture: 'f/2.8',
        iso: 800,
        shutter: '1/50s',
        cameraHeight: 160,
        tilt: 0,
        pan: 0,
        roll: 0,
        cameraNumber: String.fromCharCode(65 + shots.flatMap(s => s.elements).filter(e => e.type === 'camera').length),
        shotType: 'Medium',
        targetDistance: 250
      } as CameraElement;
    } else if (type === 'light') {
      newElement = {
        ...base,
        name: `Light ${shots.flatMap(s => s.elements).filter(e => e.type === 'light').length + 1}`,
        color: '#f59e0b',
        lightType: 'softbox',
        intensity: 75,
        colorTemperature: 5600,
        beamAngle: 60,
        falloff: 300,
        lightHeight: 180,
        showTargetLine: false
      } as LightElement;
    } else if (type === 'person') {
      newElement = {
        ...base,
        name: `Actor ${shots.flatMap(s => s.elements).filter(e => e.type === 'person').length + 1}`,
        color: '#ec4899',
        role: 'Actor',
        lookAngle: 0,
        personHeight: 180,
        pose: 'standing'
      } as PersonElement;
    } else {
      newElement = {
        ...base,
        name: `Prop ${shots.flatMap(s => s.elements).filter(e => e.type === type).length + 1}`,
        color: '#64748b',
        propType: 'cube',
        width: 100,
        height: 100
      } as PropElement;
    }

    // Merge in any AI or custom properties
    const mergedElement = { ...newElement, ...customProps } as SceneElement;

    const updatedShots = shots.map((shot) => {
      if (shot.id === activeShotId) {
        return {
          ...shot,
          elements: [...shot.elements, mergedElement]
        };
      }
      return shot;
    });

    get().pushHistory(updatedShots);
    set({ selectedElementId: id });
  },

  updateElement: (id, partial) => {
    const { shots, activeShotId } = get();
    const updatedShots = shots.map((shot) => {
      if (shot.id === activeShotId) {
        return {
          ...shot,
          elements: shot.elements.map((el) => {
            if (el.id === id) {
              const updated = { ...el, ...partial } as SceneElement;
              // If focal length is changed, update the fov based on full-frame equivalent
              if (el.type === 'camera' && 'focalLength' in partial && partial.focalLength) {
                const focal = partial.focalLength;
                const calculatedFov = Math.round(2 * Math.atan(36 / (2 * focal)) * (180 / Math.PI));
                (updated as CameraElement).fov = calculatedFov;
              }
              return updated;
            }
            return el;
          })
        };
      }
      return shot;
    });

    // We do NOT always push to history on every single drag pixel update to avoid choking memory,
    // but React handles lightweight pushes fine. Let's do direct set and trigger pushHistory when done.
    set({ shots: updatedShots });
  },

  deleteElement: (id) => {
    const { shots, activeShotId, selectedElementId } = get();
    const updatedShots = shots.map((shot) => {
      if (shot.id === activeShotId) {
        return {
          ...shot,
          elements: shot.elements.filter((el) => el.id !== id)
        };
      }
      return shot;
    });

    get().pushHistory(updatedShots);
    set({
      selectedElementId: selectedElementId === id ? null : selectedElementId
    });
  },

  duplicateElement: (id) => {
    const { shots, activeShotId } = get();
    const currentShot = shots.find(s => s.id === activeShotId);
    if (!currentShot) return;

    const source = currentShot.elements.find((el) => el.id === id);
    if (!source) return;

    const duplicated: SceneElement = {
      ...JSON.parse(JSON.stringify(source)),
      id: `${source.type}-${crypto.randomUUID().slice(0, 8)}`,
      name: `${source.name} (Copy)`,
      x: source.x + 30, // slight offset to show copy
      y: source.y + 30,
      locked: false
    };

    const updatedShots = shots.map((shot) => {
      if (shot.id === activeShotId) {
        return {
          ...shot,
          elements: [...shot.elements, duplicated]
        };
      }
      return shot;
    });

    get().pushHistory(updatedShots);
    set({ selectedElementId: duplicated.id });
  },

  addShot: () => {
    const { shots, activeShotId } = get();
    const currentShot = shots.find(s => s.id === activeShotId);
    
    // Copy elements from the current shot to start smoothly!
    const copiedElements = currentShot ? JSON.parse(JSON.stringify(currentShot.elements)) : [];
    
    const newId = `shot-${crypto.randomUUID().slice(0, 8)}`;
    const newNumber = Math.max(...shots.map(s => s.number), 0) + 1;
    const newShot: Shot = {
      id: newId,
      number: newNumber,
      name: `Shot ${newNumber} - New Setup`,
      description: 'Setup description...',
      priority: 'Medium',
      status: 'Draft',
      checklist: [],
      elements: copiedElements
    };

    const updatedShots = [...shots, newShot];
    get().pushHistory(updatedShots);
    set({ activeShotId: newId, selectedElementId: null });
  },

  duplicateShot: (shotId) => {
    const { shots } = get();
    const sourceShot = shots.find(s => s.id === shotId);
    if (!sourceShot) return;

    const newId = `shot-${crypto.randomUUID().slice(0, 8)}`;
    const newNumber = Math.max(...shots.map(s => s.number), 0) + 1;
    const duplicatedShot: Shot = {
      ...JSON.parse(JSON.stringify(sourceShot)),
      id: newId,
      number: newNumber,
      name: `${sourceShot.name} (Copia)`,
    };

    const updatedShots = [...shots, duplicatedShot];
    get().pushHistory(updatedShots);
    set({ activeShotId: newId, selectedElementId: null });
  },

  deleteShot: (shotId) => {
    const { shots, activeShotId } = get();
    if (shots.length <= 1) return; // Must have at least 1 shot

    const updatedShots = shots.filter((s) => s.id !== shotId);
    
    // Auto renumber
    const orderedShots = updatedShots.map((s, idx) => ({
      ...s,
      number: idx + 1
    }));

    let nextActiveId = activeShotId;
    if (activeShotId === shotId) {
      nextActiveId = orderedShots[0].id;
    }

    get().pushHistory(orderedShots);
    set({ activeShotId: nextActiveId, selectedElementId: null });
  },

  selectShot: (shotId) => {
    set({ activeShotId: shotId, selectedElementId: null });
  },

  updateShotProperties: (shotId, partial) => {
    const { shots } = get();
    const updatedShots = shots.map((shot) => {
      if (shot.id === shotId) {
        return {
          ...shot,
          ...partial
        };
      }
      return shot;
    });
    set({ shots: updatedShots });
    // Push on blur or complete changes. For simple edits we write direct.
  },

  reorderShots: (reordered) => {
    get().pushHistory(reordered);
  },

  loadFromJSON: (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.shots) && data.shots.length > 0) {
        const firstShot = data.shots[0];
        set({
          shots: data.shots,
          activeShotId: firstShot.id,
          selectedElementId: null
        });
        get().pushHistory(data.shots);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to parse loaded JSON', e);
      return false;
    }
  },

  loadRawElements: (newElements) => {
    const { shots, activeShotId } = get();
    
    // Assign random UUIDs if missing
    const prepared = newElements.map(el => ({
      ...el,
      id: el.id || `${el.type}-${crypto.randomUUID().slice(0, 8)}`,
      scaleX: el.scaleX ?? 1,
      scaleY: el.scaleY ?? 1,
      opacity: el.opacity ?? 1,
      zIndex: el.zIndex ?? 10,
      locked: el.locked ?? false,
      hidden: el.hidden ?? false,
      color: el.color || (el.type === 'camera' ? '#10b981' : el.type === 'light' ? '#f59e0b' : '#3b82f6'),
    }));

    const updatedShots = shots.map(s => {
      if (s.id === activeShotId) {
        return {
          ...s,
          elements: prepared
        };
      }
      return s;
    });

    get().pushHistory(updatedShots);
  },

  resetAll: () => {
    set({
      shots: initialShots,
      activeShotId: 'shot-1',
      selectedElementId: null,
      canvasScale: 1,
      canvasTranslateX: 300,
      canvasTranslateY: 250,
      tool: 'select',
      history: [JSON.parse(JSON.stringify(initialShots))],
      historyIndex: 0
    });
  }
}));
