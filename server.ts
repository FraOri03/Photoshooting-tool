import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Scene Generator Endpoint
app.post('/api/ai', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Return beautiful fallback default elements if the API key is not yet set, to keep user experience perfect!
      console.warn('GEMINI_API_KEY is not defined, returning fallback set');
      return res.json({
        elements: getFallbackElements(prompt)
      });
    }

    const systemInstruction = `You are an expert Filmmaking & Photography Set Designer AI. 
Given a prompt, design a 2D top-down set layout.
Represent distances in centimeters (cm). Place objects logically relative to each other on a coordinate plane where (0,0) is the center subject.
You MUST generate a list of elements that matches the user's setup description.

For each element, choose one of the following types:
1. 'camera': Representing a camera. Front view is along the positive X-axis (rotation 0 points right, 90 points down, 180 points left, 270 points up).
   - cameraNumber: e.g. "A", "B", "C"
   - focalLength: focal length in mm (e.g. 24, 35, 50, 85)
   - fov: field of view angle (e.g. 63)
   - targetDistance: distance in cm to target/subject (e.g., 200)
   - shotType: "Close Up", "Medium", "Wide", "Extreme Wide"
   - sensor: "Full Frame", "APS-C", "Super 35"
2. 'light': Representing a light fixture.
   - lightType: "softbox", "fresnel", "led_panel", "tube", "bounce", "spot"
   - intensity: 10 to 100
   - beamAngle: 10 to 120 (in degrees)
   - colorTemperature: Kelvin value (e.g. 3200, 5600, 6500)
   - color: hex color code representing the light color (e.g. "#FFF3E0", "#E0F7FA", "#FFEB3B")
3. 'person': Representing actors, models, crew, or photographers.
   - role: "Actor", "Extra", "Model", "Photographer", "Director"
4. 'prop': Representing scene furniture or assets.
   - propType: "table", "chair", "sofa", "bed", "wall", "backdrop", "cyclorama", "green_screen"
   - color: optional hex color

Coordinates:
- Place the main subject/actor/model at or close to (0, 0).
- Place cameras facing the subject (e.g., at x: 0, y: -250, looking up towards the subject at y: 0, which corresponds to rotation 270 degrees).
- Place lights to illuminate the subject (e.g., 45-degree key light at x: -150, y: -150, backlight at x: 100, y: 150).
Make the arrangement extremely professional and realistic according to the prompt description.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Design a set based on: "${prompt}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['elements'],
          properties: {
            elements: {
              type: Type.ARRAY,
              description: 'The list of elements in the generated layout',
              items: {
                type: Type.OBJECT,
                required: ['type', 'name', 'x', 'y', 'rotation'],
                properties: {
                  type: {
                    type: Type.STRING,
                    description: 'Type of element: camera, light, person, prop',
                    enum: ['camera', 'light', 'person', 'prop']
                  },
                  name: {
                    type: Type.STRING,
                    description: 'Human-readable name of the element'
                  },
                  x: {
                    type: Type.INTEGER,
                    description: 'X coordinate in cm'
                  },
                  y: {
                    type: Type.INTEGER,
                    description: 'Y coordinate in cm'
                  },
                  rotation: {
                    type: Type.INTEGER,
                    description: 'Rotation angle in degrees (0 to 360)'
                  },
                  // Camera Specifics
                  cameraNumber: { type: Type.STRING },
                  focalLength: { type: Type.INTEGER },
                  fov: { type: Type.INTEGER },
                  targetDistance: { type: Type.INTEGER },
                  shotType: { type: Type.STRING },
                  sensor: { type: Type.STRING },
                  // Light Specifics
                  lightType: { type: Type.STRING },
                  intensity: { type: Type.INTEGER },
                  beamAngle: { type: Type.INTEGER },
                  colorTemperature: { type: Type.INTEGER },
                  color: { type: Type.STRING },
                  // Person Specifics
                  role: { type: Type.STRING },
                  // Prop Specifics
                  propType: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text || '';
    const data = JSON.parse(text);
    return res.json(data);
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate layout' });
  }
});

function getFallbackElements(prompt: string) {
  const p = prompt.toLowerCase();
  
  const actor = {
    id: 'actor-1',
    type: 'person',
    name: 'Protagonista',
    x: 0,
    y: 0,
    rotation: 90,
    color: '#a855f7',
    role: 'Actor',
    pose: 'In piedi'
  };

  const cameraA = {
    id: 'camera-a',
    type: 'camera',
    name: 'Camera A',
    x: 0,
    y: 300,
    rotation: 270,
    color: '#10b981',
    cameraNumber: 'A',
    focalLength: 50,
    fov: 46,
    targetDistance: 300,
    shotType: 'Medium',
    sensor: 'Full Frame'
  };

  if (p.includes('beauty') || p.includes('ritratto') || p.includes('portrait')) {
    return [
      actor,
      cameraA,
      {
        id: 'light-key',
        type: 'light',
        name: 'Softbox Key Light (Luce Principale)',
        x: -120,
        y: 200,
        rotation: 330,
        color: '#FFF3E0',
        lightType: 'softbox',
        intensity: 80,
        beamAngle: 60,
        colorTemperature: 5600
      },
      {
        id: 'light-fill',
        type: 'light',
        name: 'Softbox Fill Light (Luce di Riempimento)',
        x: 120,
        y: 200,
        rotation: 210,
        color: '#E0F7FA',
        lightType: 'softbox',
        intensity: 40,
        beamAngle: 80,
        colorTemperature: 5600
      },
      {
        id: 'light-rim',
        type: 'light',
        name: 'Controluce (Rim Light)',
        x: 80,
        y: -150,
        rotation: 120,
        color: '#E0F2F1',
        lightType: 'spot',
        intensity: 90,
        beamAngle: 30,
        colorTemperature: 6500
      },
      {
        id: 'prop-bg',
        type: 'prop',
        name: 'Fondale Grigio',
        x: 0,
        y: -100,
        rotation: 0,
        color: '#555555',
        propType: 'backdrop'
      }
    ];
  }

  if (p.includes('ski') || p.includes('sci') || p.includes('neve') || p.includes('outdoor')) {
    return [
      {
        id: 'photog',
        type: 'person',
        name: 'Fotografo Bordo Pista',
        x: -200,
        y: 100,
        rotation: 45,
        color: '#3b82f6',
        role: 'Photographer'
      },
      {
        id: 'skier',
        type: 'person',
        name: 'Sciatore',
        x: 0,
        y: -100,
        rotation: 180,
        color: '#ef4444',
        role: 'Actor'
      },
      cameraA,
      {
        id: 'camera-b',
        type: 'camera',
        name: 'Camera B (Drone)',
        x: 150,
        y: -150,
        rotation: 135,
        color: '#10b981',
        cameraNumber: 'B',
        focalLength: 24,
        fov: 84,
        targetDistance: 400,
        shotType: 'Wide',
        sensor: 'Full Frame'
      },
      {
        id: 'light-sun',
        type: 'light',
        name: 'Luce Solare',
        x: -400,
        y: -300,
        rotation: 45,
        color: '#FFFDE7',
        lightType: 'spot',
        intensity: 100,
        beamAngle: 20,
        colorTemperature: 5500
      },
      {
        id: 'prop-ski-run',
        type: 'prop',
        name: 'Pista di Sci / Neveplast',
        x: 0,
        y: 0,
        rotation: 0,
        color: '#ffffff',
        propType: 'cyclorama'
      }
    ];
  }

  // General default movie set layout
  return [
    actor,
    cameraA,
    {
      id: 'light-key',
      type: 'light',
      name: 'Key Light',
      x: -150,
      y: 150,
      rotation: 315,
      color: '#FFE0B2',
      lightType: 'led_panel',
      intensity: 75,
      beamAngle: 70,
      colorTemperature: 4500
    },
    {
      id: 'light-fill',
      type: 'light',
      name: 'Fill Light',
      x: 150,
      y: 150,
      rotation: 225,
      color: '#E0F7FA',
      lightType: 'fresnel',
      intensity: 35,
      beamAngle: 80,
      colorTemperature: 5000
    }
  ];
}

// Vite and static asset serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware loaded (Development Mode)');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving static files from:', distPath);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
