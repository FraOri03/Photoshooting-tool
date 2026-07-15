export interface PresetItem {
  name: string;
  type: 'camera' | 'light' | 'person' | 'prop' | 'environment' | 'nature' | 'vehicle' | 'furniture';
  category: string;
  width: number; // in cm
  height: number; // in cm
  color: string;
  customSvgPath?: string; // Standard path
  iconName?: string;
  props?: any; // any default fields
}

export const ELEMENT_CATEGORIES = {
  CAMERA: 'Camere & Supporti',
  LIGHT: 'Sorgenti di Luce',
  PERSON: 'Persone & Crew',
  ENVIRONMENT: 'Ambiente & Scena',
  VEHICLE: 'Veicoli',
  NATURE: 'Natura & Esterni',
  FURNITURE: 'Arredamento'
};

export const PRESET_LIBRARY: PresetItem[] = [
  // --- CAMERAS ---
  {
    name: 'DSLR Camera',
    type: 'camera',
    category: ELEMENT_CATEGORIES.CAMERA,
    width: 35,
    height: 25,
    color: '#10b981',
    props: { sensor: 'Full Frame', focalLength: 50, cameraNumber: 'A', shotType: 'Medium' }
  },
  {
    name: 'Mirrorless Camera',
    type: 'camera',
    category: ELEMENT_CATEGORIES.CAMERA,
    width: 30,
    height: 20,
    color: '#10b981',
    props: { sensor: 'Full Frame', focalLength: 35, cameraNumber: 'B', shotType: 'Medium' }
  },
  {
    name: 'Cinema Camera',
    type: 'camera',
    category: ELEMENT_CATEGORIES.CAMERA,
    width: 45,
    height: 35,
    color: '#059669',
    props: { sensor: 'Super 35', focalLength: 85, cameraNumber: 'C', shotType: 'Close Up' }
  },
  {
    name: 'Drone Cam',
    type: 'camera',
    category: ELEMENT_CATEGORIES.CAMERA,
    width: 40,
    height: 40,
    color: '#34d399',
    props: { sensor: 'APS-C', focalLength: 24, cameraNumber: 'D', shotType: 'Extreme Wide' }
  },
  {
    name: 'GoPro / Action Cam',
    type: 'camera',
    category: ELEMENT_CATEGORIES.CAMERA,
    width: 15,
    height: 12,
    color: '#10b981',
    props: { sensor: 'APS-C', focalLength: 16, cameraNumber: 'E', shotType: 'Wide' }
  },
  {
    name: '360 Camera',
    type: 'camera',
    category: ELEMENT_CATEGORIES.CAMERA,
    width: 15,
    height: 15,
    color: '#10b981',
    props: { sensor: 'Full Frame', focalLength: 8, cameraNumber: 'F', shotType: 'Extreme Wide' }
  },
  {
    name: 'Dolly Track System',
    type: 'prop',
    category: ELEMENT_CATEGORIES.CAMERA,
    width: 400,
    height: 60,
    color: '#6b7280',
    customSvgPath: 'dolly'
  },
  {
    name: 'Slider Support',
    type: 'prop',
    category: ELEMENT_CATEGORIES.CAMERA,
    width: 120,
    height: 15,
    color: '#4b5563',
    customSvgPath: 'slider'
  },
  {
    name: 'Tripod Standard',
    type: 'prop',
    category: ELEMENT_CATEGORIES.CAMERA,
    width: 80,
    height: 80,
    color: '#374151',
    customSvgPath: 'tripod'
  },

  // --- LIGHTS ---
  {
    name: 'Fresnel Light',
    type: 'light',
    category: ELEMENT_CATEGORIES.LIGHT,
    width: 35,
    height: 35,
    color: '#f59e0b',
    props: { lightType: 'fresnel', intensity: 80, colorTemperature: 3200, beamAngle: 40 }
  },
  {
    name: 'LED Panel 1x1',
    type: 'light',
    category: ELEMENT_CATEGORIES.LIGHT,
    width: 45,
    height: 45,
    color: '#fbbf24',
    props: { lightType: 'led_panel', intensity: 70, colorTemperature: 5600, beamAngle: 120 }
  },
  {
    name: 'Softbox Soft Light',
    type: 'light',
    category: ELEMENT_CATEGORIES.LIGHT,
    width: 80,
    height: 60,
    color: '#fcd34d',
    props: { lightType: 'softbox', intensity: 90, colorTemperature: 5600, beamAngle: 90 }
  },
  {
    name: 'Stripbox Light',
    type: 'light',
    category: ELEMENT_CATEGORIES.LIGHT,
    width: 140,
    height: 40,
    color: '#fcd34d',
    props: { lightType: 'softbox', intensity: 85, colorTemperature: 5600, beamAngle: 75 }
  },
  {
    name: 'Beauty Dish',
    type: 'light',
    category: ELEMENT_CATEGORIES.LIGHT,
    width: 50,
    height: 50,
    color: '#f59e0b',
    props: { lightType: 'beauty_dish', intensity: 75, colorTemperature: 5600, beamAngle: 50 }
  },
  {
    name: 'Tube Light (RGB)',
    type: 'light',
    category: ELEMENT_CATEGORIES.LIGHT,
    width: 120,
    height: 10,
    color: '#3b82f6',
    props: { lightType: 'tube_light', intensity: 60, colorTemperature: 6500, beamAngle: 180 }
  },
  {
    name: 'Spot / Profile Light',
    type: 'light',
    category: ELEMENT_CATEGORIES.LIGHT,
    width: 30,
    height: 40,
    color: '#d97706',
    props: { lightType: 'spot', intensity: 95, colorTemperature: 3200, beamAngle: 15 }
  },
  {
    name: 'Sunlight Directional',
    type: 'light',
    category: ELEMENT_CATEGORIES.LIGHT,
    width: 100,
    height: 100,
    color: '#fef08a',
    props: { lightType: 'sun', intensity: 100, colorTemperature: 5500, beamAngle: 25 }
  },
  {
    name: 'Bounce Board White',
    type: 'light',
    category: ELEMENT_CATEGORIES.LIGHT,
    width: 100,
    height: 15,
    color: '#ffffff',
    props: { lightType: 'bounce', intensity: 20, colorTemperature: 5600, beamAngle: 120 }
  },

  // --- PEOPLE ---
  {
    name: 'Actor / Attore',
    type: 'person',
    category: ELEMENT_CATEGORIES.PERSON,
    width: 50,
    height: 45,
    color: '#ec4899',
    props: { role: 'Actor', pose: 'standing', lookAngle: 90 }
  },
  {
    name: 'Model / Modella',
    type: 'person',
    category: ELEMENT_CATEGORIES.PERSON,
    width: 45,
    height: 40,
    color: '#d946ef',
    props: { role: 'Model', pose: 'standing', lookAngle: 90 }
  },
  {
    name: 'Extra / Comparsa',
    type: 'person',
    category: ELEMENT_CATEGORIES.PERSON,
    width: 50,
    height: 45,
    color: '#f43f5e',
    props: { role: 'Extra', pose: 'standing', lookAngle: 90 }
  },
  {
    name: 'Photographer',
    type: 'person',
    category: ELEMENT_CATEGORIES.PERSON,
    width: 55,
    height: 50,
    color: '#3b82f6',
    props: { role: 'Photographer', pose: 'standing', lookAngle: 90 }
  },
  {
    name: 'Director / Assistant',
    type: 'person',
    category: ELEMENT_CATEGORIES.PERSON,
    width: 50,
    height: 45,
    color: '#06b6d4',
    props: { role: 'Assistant', pose: 'standing', lookAngle: 90 }
  },

  // --- ENVIRONMENT / SCENE ---
  {
    name: 'Pareti (Wall)',
    type: 'prop',
    category: ELEMENT_CATEGORIES.ENVIRONMENT,
    width: 300,
    height: 20,
    color: '#4b5563',
    customSvgPath: 'wall'
  },
  {
    name: 'Porta (Door swing)',
    type: 'prop',
    category: ELEMENT_CATEGORIES.ENVIRONMENT,
    width: 90,
    height: 90,
    color: '#b45309',
    customSvgPath: 'door'
  },
  {
    name: 'Finestra (Window)',
    type: 'prop',
    category: ELEMENT_CATEGORIES.ENVIRONMENT,
    width: 120,
    height: 15,
    color: '#38bdf8',
    customSvgPath: 'window'
  },
  {
    name: 'Cyclorama (Curved studio)',
    type: 'prop',
    category: ELEMENT_CATEGORIES.ENVIRONMENT,
    width: 500,
    height: 150,
    color: '#ffffff',
    customSvgPath: 'cyclorama'
  },
  {
    name: 'Green Screen Backdrop',
    type: 'prop',
    category: ELEMENT_CATEGORIES.ENVIRONMENT,
    width: 350,
    height: 20,
    color: '#22c55e',
    customSvgPath: 'backdrop'
  },
  {
    name: 'Black Screen Backdrop',
    type: 'prop',
    category: ELEMENT_CATEGORIES.ENVIRONMENT,
    width: 350,
    height: 20,
    color: '#09090b',
    customSvgPath: 'backdrop'
  },

  // --- VEHICLES ---
  {
    name: 'Auto Berlina (Car)',
    type: 'prop',
    category: ELEMENT_CATEGORIES.VEHICLE,
    width: 440,
    height: 180,
    color: '#ef4444',
    customSvgPath: 'car'
  },
  {
    name: 'Moto (Motorcycle)',
    type: 'prop',
    category: ELEMENT_CATEGORIES.VEHICLE,
    width: 210,
    height: 70,
    color: '#e11d48',
    customSvgPath: 'motorcycle'
  },
  {
    name: 'Bicicletta (Bicycle)',
    type: 'prop',
    category: ELEMENT_CATEGORIES.VEHICLE,
    width: 170,
    height: 50,
    color: '#22c55e',
    customSvgPath: 'bicycle'
  },

  // --- NATURE ---
  {
    name: 'Albero Grande (Tree)',
    type: 'prop',
    category: ELEMENT_CATEGORIES.NATURE,
    width: 180,
    height: 180,
    color: '#15803d',
    customSvgPath: 'tree'
  },
  {
    name: 'Roccia (Rock)',
    type: 'prop',
    category: ELEMENT_CATEGORIES.NATURE,
    width: 100,
    height: 80,
    color: '#71717a',
    customSvgPath: 'rock'
  },

  // --- FURNITURE ---
  {
    name: 'Tavolo Rettangolare',
    type: 'prop',
    category: ELEMENT_CATEGORIES.FURNITURE,
    width: 180,
    height: 90,
    color: '#78350f',
    customSvgPath: 'table'
  },
  {
    name: 'Sedia Ufficio',
    type: 'prop',
    category: ELEMENT_CATEGORIES.FURNITURE,
    width: 55,
    height: 55,
    color: '#1e293b',
    customSvgPath: 'chair'
  },
  {
    name: 'Divano 3 Posti',
    type: 'prop',
    category: ELEMENT_CATEGORIES.FURNITURE,
    width: 220,
    height: 90,
    color: '#1d4ed8',
    customSvgPath: 'sofa'
  },
  {
    name: 'Letto Matrimoniale',
    type: 'prop',
    category: ELEMENT_CATEGORIES.FURNITURE,
    width: 200,
    height: 160,
    color: '#4338ca',
    customSvgPath: 'bed'
  }
];
