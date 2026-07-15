export type ElementType = 'camera' | 'light' | 'person' | 'prop' | 'environment' | 'nature' | 'vehicle' | 'furniture';

export interface BaseElement {
  id: string;
  type: ElementType;
  name: string;
  x: number; // in cm
  y: number; // in cm
  rotation: number; // degrees
  scaleX: number;
  scaleY: number;
  opacity: number;
  zIndex: number;
  locked: boolean;
  hidden: boolean;
  color: string;
  label?: string;
  notes?: string;
  customSvgPath?: string; // custom or preselected vector path
  category?: string;
  width?: number; // cm
  height?: number; // cm
}

export interface CameraElement extends BaseElement {
  type: 'camera';
  sensor: 'Full Frame' | 'APS-C' | 'Super 35' | 'Medium Format';
  focalLength: number; // mm
  fov: number; // degrees
  aperture: string; // e.g., f/2.8
  iso: number;
  shutter: string; // e.g., 1/50s
  cameraHeight: number; // cm
  tilt: number; // degrees
  pan: number; // degrees
  roll: number; // degrees
  cameraNumber: string; // e.g. "A", "B", "1", "2"
  shotType: 'Close Up' | 'Medium' | 'Wide' | 'Extreme Wide' | 'Detail';
  targetDistance: number; // cm
}

export interface LightElement extends BaseElement {
  type: 'light';
  lightType: 'fresnel' | 'led_panel' | 'par' | 'softbox' | 'stripbox' | 'beauty_dish' | 'open_face' | 'tube_light' | 'practical' | 'spot' | 'ellipsoidal' | 'sun' | 'moon' | 'bounce';
  intensity: number; // wattage or power scale (0-100)
  colorTemperature: number; // Kelvin (1000 - 10000)
  beamAngle: number; // degrees (10 - 180)
  falloff: number; // distance in cm
  lightHeight: number; // cm
  gelName?: string;
  dmxChannel?: number;
  showTargetLine: boolean;
  targetX?: number;
  targetY?: number;
}

export interface PersonElement extends BaseElement {
  type: 'person';
  role: 'Actor' | 'Extra' | 'Model' | 'Crew' | 'Photographer' | 'Assistant' | 'Client' | 'Makeup' | 'Hair';
  lookAngle: number; // direction of gaze, degrees
  personHeight: number; // cm
  pose: 'standing' | 'sitting' | 'kneeling' | 'action';
}

export interface PropElement extends BaseElement {
  type: 'prop' | 'environment' | 'nature' | 'vehicle' | 'furniture';
  propType: string; // Table, Chair, cyclorama, green_screen, window, wall, tree, etc.
}

export type SceneElement = CameraElement | LightElement | PersonElement | PropElement;

export interface Shot {
  id: string;
  number: number;
  name: string;
  description: string;
  storyboardText?: string;
  duration?: string; // e.g. "5s", "30s"
  priority: 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Planned' | 'Approved' | 'Shot' | 'Omitted';
  colorTag?: string; // hex or color name
  checklist: { id: string; text: string; done: boolean }[];
  elements: SceneElement[]; // Every shot contains its custom element layout configuration!
}

export interface SceneState {
  shots: Shot[];
  activeShotId: string;
  selectedElementId: string | null;
  canvasScale: number;
  canvasTranslateX: number;
  canvasTranslateY: number;
  tool: 'select' | 'pan' | 'add_camera' | 'add_light' | 'add_person' | 'add_prop';
  gridVisible: boolean;
  gridSnap: boolean;
  rulersVisible: boolean;
  theme: 'light' | 'dark';
  
  // Undo/Redo State stacks
  history: Shot[][]; // list of shots states
  historyIndex: number;
}
