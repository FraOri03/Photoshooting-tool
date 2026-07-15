import React, { useState, useRef, useEffect } from 'react';
import { useSceneStore } from '../store';
import { SceneElement, CameraElement, LightElement, PersonElement, PropElement } from '../types';

export default function Canvas() {
  const {
    shots,
    activeShotId,
    selectedElementId,
    canvasScale,
    canvasTranslateX,
    canvasTranslateY,
    tool,
    gridVisible,
    gridSnap,
    rulersVisible,
    selectElement,
    updateElement,
    pushHistory,
    setCanvasTransform
  } = useSceneStore();

  const currentShot = shots.find(s => s.id === activeShotId) || shots[0];
  const elements = currentShot?.elements || [];

  const canvasRef = useRef<SVGSVGElement | null>(null);

  // Dragging states
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });
  const [isRotating, setIsRotating] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);

  // Capture Spacebar for Hand Tool
  const [spacePressed, setSpacePressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(true);
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Helper to convert screen mouse coords to canvas coordinates (centimeters)
  const getCanvasCoords = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    
    // Reverse the zoom and translate formulas
    // screenX = canvasTranslateX + x * canvasScale
    const x = (screenX - canvasTranslateX) / canvasScale;
    const y = (screenY - canvasTranslateY) / canvasScale;
    return { x, y };
  };

  // Zooming around pointer location
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top;

    // Pointer location in canvas coordinates before zoom
    const canvasX = (pointerX - canvasTranslateX) / canvasScale;
    const canvasY = (pointerY - canvasTranslateY) / canvasScale;

    // Zoom speed
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.05, Math.min(20, canvasScale * zoomFactor));

    // New translation to keep pointer fixed in same physical spot
    const newTx = pointerX - canvasX * newScale;
    const newTy = pointerY - canvasY * newScale;

    setCanvasTransform(newScale, newTx, newTy);
  };

  // Mouse interaction down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (spacePressed || tool === 'pan' || e.button === 1) {
      // Middle click or space+drag starts canvas Pan
      setPanStart({ x: e.clientX - canvasTranslateX, y: e.clientY - canvasTranslateY });
      e.preventDefault();
      return;
    }

    const coords = getCanvasCoords(e);

    // If clicked on empty space, deselect
    if (e.target === canvasRef.current || (e.target as SVGElement).id === 'grid-bg') {
      selectElement(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (panStart) {
      const newTx = e.clientX - panStart.x;
      const newTy = e.clientY - panStart.y;
      setCanvasTransform(canvasScale, newTx, newTy);
      return;
    }

    if (draggedElementId) {
      const coords = getCanvasCoords(e);
      const targetEl = elements.find(el => el.id === draggedElementId);
      if (!targetEl) return;

      if (isRotating) {
        // Compute rotation angle
        const angleRad = Math.atan2(coords.y - targetEl.y, coords.x - targetEl.x);
        let angleDeg = Math.round((angleRad * 180) / Math.PI) - 90; // offset for top handles
        
        // Normalize 0-360
        if (angleDeg < 0) angleDeg += 360;
        
        // Snap rotation optional (e.g. to 15 degrees if shift pressed)
        if (e.shiftKey) {
          angleDeg = Math.round(angleDeg / 15) * 15;
        }

        updateElement(draggedElementId, { rotation: angleDeg });
      } else {
        // Move element
        let newX = coords.x - dragStartOffset.x;
        let newY = coords.y - dragStartOffset.y;

        // Smart snap to grid (default 10cm or 50cm)
        if (gridSnap) {
          const snapValue = e.shiftKey ? 50 : 10; // 50cm if shift pressed, otherwise 10cm
          newX = Math.round(newX / snapValue) * snapValue;
          newY = Math.round(newY / snapValue) * snapValue;
        }

        updateElement(draggedElementId, { x: newX, y: newY });
      }
    }
  };

  const handleMouseUp = () => {
    if (panStart) {
      setPanStart(null);
    }
    if (draggedElementId) {
      setDraggedElementId(null);
      setIsRotating(false);
      // Save snapshot of final drag/rotate state to history
      pushHistory();
    }
  };

  // Click handler to initiate drag/rotate or selection
  const handleElementMouseDown = (el: SceneElement, e: React.MouseEvent, isRotationTrigger = false) => {
    e.stopPropagation();
    if (spacePressed || tool === 'pan') return;

    selectElement(el.id);
    const coords = getCanvasCoords(e);

    if (isRotationTrigger) {
      setIsRotating(true);
      setDraggedElementId(el.id);
    } else {
      if (el.locked) return;
      setIsRotating(false);
      setDraggedElementId(el.id);
      setDragStartOffset({
        x: coords.x - el.x,
        y: coords.y - el.y
      });
    }
  };

  // Convert Kelvin to approx light color
  const kelvinToColor = (kelvin: number) => {
    if (kelvin < 3000) return '#ffaa44'; // candle light / warm warm
    if (kelvin < 4500) return '#ffcc88'; // halogen warm
    if (kelvin < 5800) return '#fff3e0'; // sunlight white
    if (kelvin < 7500) return '#e0f7fa'; // cool white
    return '#80deea'; // sky blue daylight
  };

  // Draw customized SVG elements based on preset patterns
  const renderPropShape = (el: PropElement & { width?: number; height?: number }) => {
    const width = el.width || 100;
    const height = el.height || 100;
    const strokeColor = selectedElementId === el.id ? '#ffffff' : el.color;
    const fillColor = `${el.color}33`; // alpha 20%

    switch (el.customSvgPath) {
      case 'wall':
        return (
          <rect
            x={-width / 2} y={-height / 2}
            width={width} height={height}
            fill="#3f3f46"
            stroke={strokeColor}
            strokeWidth={2}
            rx={2}
          />
        );
      case 'door':
        return (
          <g>
            {/* Main wall thickness */}
            <line x1={-width / 2} y1={0} x2={-width / 2 + 10} y2={0} stroke="#4b5563" strokeWidth={6} />
            {/* Door leaf */}
            <line
              x1={-width / 2 + 10} y1={0}
              x2={width / 2} y2={-width + 10}
              stroke={strokeColor}
              strokeWidth={3}
            />
            {/* Swing curve arc */}
            <path
              d={`M ${-width / 2 + 10} 0 A ${width - 10} ${width - 10} 0 0 1 ${width / 2} 0`}
              fill="none"
              stroke="#4b5563"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          </g>
        );
      case 'window':
        return (
          <g>
            <rect
              x={-width / 2} y={-height / 2}
              width={width} height={height}
              fill="#0ea5e933"
              stroke="#38bdf8"
              strokeWidth={2}
            />
            <line x1={-width / 2} y1={0} x2={width / 2} y2={0} stroke="#38bdf8" strokeWidth={1} />
          </g>
        );
      case 'cyclorama':
        return (
          <path
            d={`M ${-width / 2} ${-height / 2} C ${-width / 4} ${height / 2}, ${width / 4} ${height / 2}, ${width / 2} ${-height / 2}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth={4}
          />
        );
      case 'backdrop':
        return (
          <g>
            <line x1={-width / 2} y1={0} x2={width / 2} y2={0} stroke={strokeColor} strokeWidth={8} strokeLinecap="round" />
            <line x1={-width / 2} y1={0} x2={width / 2} y2={0} stroke="#18181b" strokeWidth={2} />
          </g>
        );
      case 'car':
        return (
          <g opacity={el.opacity}>
            {/* Car outline */}
            <rect x={-width / 2} y={-height / 2} width={width} height={height} rx={25} fill={fillColor} stroke={strokeColor} strokeWidth={3} />
            {/* Windshield */}
            <path d={`M ${-width / 5} ${-height / 2.5} L ${width / 5} ${-height / 2.5} Q ${width / 4} 0, ${width / 5} ${height / 2.5} L ${-width / 5} ${height / 2.5} Z`} fill="#1e293b" stroke={strokeColor} strokeWidth={1.5} />
            {/* Hood lines */}
            <line x1={-width / 2} y1={-height / 3} x2={-width / 4} y2={-height / 3} stroke={strokeColor} strokeWidth={1.5} />
            <line x1={-width / 2} y1={height / 3} x2={-width / 4} y2={height / 3} stroke={strokeColor} strokeWidth={1.5} />
            {/* Headlights */}
            <ellipse cx={-width / 2 + 10} cy={-height / 2.8} rx={12} ry={6} fill="#fbbf24" />
            <ellipse cx={-width / 2 + 10} cy={height / 2.8} rx={12} ry={6} fill="#fbbf24" />
          </g>
        );
      case 'motorcycle':
        return (
          <g>
            <rect x={-width / 2} y={-10} width={width} height={20} rx={5} fill={fillColor} stroke={strokeColor} strokeWidth={2} />
            <circle cx={-width / 2 + 20} cy={0} r={15} fill="#18181b" stroke={strokeColor} strokeWidth={2} />
            <circle cx={width / 2 - 20} cy={0} r={15} fill="#18181b" stroke={strokeColor} strokeWidth={2} />
            <line x1={-10} y1={-25} x2={-10} y2={25} stroke={strokeColor} strokeWidth={3} />
          </g>
        );
      case 'bicycle':
        return (
          <g>
            <line x1={-width / 2} y1={0} x2={width / 2} y2={0} stroke={strokeColor} strokeWidth={3} />
            <circle cx={-width / 2} cy={0} r={12} fill="none" stroke={strokeColor} strokeWidth={2} />
            <circle cx={width / 2} cy={0} r={12} fill="none" stroke={strokeColor} strokeWidth={2} />
            <line x1={-15} y1={-15} x2={15} y2={15} stroke={strokeColor} strokeWidth={1.5} />
          </g>
        );
      case 'tree':
        return (
          <g>
            <circle cx={0} cy={0} r={width / 2} fill="#16653433" stroke={strokeColor} strokeWidth={2} strokeDasharray="6,3" />
            <circle cx={0} cy={0} r={width / 3} fill="#15803d55" stroke={strokeColor} strokeWidth={1.5} />
            <circle cx={0} cy={0} r={12} fill="#78350f" />
          </g>
        );
      case 'rock':
        return (
          <polygon
            points={`0,${-height / 2} ${width / 2.2},${-height / 3} ${width / 2},${height / 4} ${width / 5},${height / 2} ${-width / 2.5},${height / 2.2} ${-width / 2},${-height / 5}`}
            fill="#52525b55"
            stroke={strokeColor}
            strokeWidth={2}
          />
        );
      case 'table':
        return (
          <g>
            <rect x={-width / 2} y={-height / 2} width={width} height={height} rx={5} fill={fillColor} stroke={strokeColor} strokeWidth={2} />
            {/* Draw top plates and cups for a high-end detailed architect blueprint feel! */}
            <circle cx={0} cy={0} r={15} fill="none" stroke={strokeColor} strokeWidth={1} strokeDasharray="3,3" />
            <circle cx={-width / 3} cy={0} r={10} fill="none" stroke={strokeColor} strokeWidth={1} />
            <circle cx={width / 3} cy={0} r={10} fill="none" stroke={strokeColor} strokeWidth={1} />
          </g>
        );
      case 'chair':
        return (
          <g>
            <rect x={-width / 2} y={-height / 2} width={width} height={height} rx={8} fill={fillColor} stroke={strokeColor} strokeWidth={2} />
            {/* Curved backrest */}
            <path d={`M ${-width / 2} ${-height / 2.5} Q 0 ${-height / 2}, ${width / 2} ${-height / 2.5}`} fill="none" stroke={strokeColor} strokeWidth={2} />
            {/* Armrests */}
            <line x1={-width / 2} y1={-height / 4} x2={-width / 2} y2={height / 4} stroke={strokeColor} strokeWidth={1.5} />
            <line x1={width / 2} y1={-height / 4} x2={width / 2} y2={height / 4} stroke={strokeColor} strokeWidth={1.5} />
          </g>
        );
      case 'sofa':
        return (
          <g>
            <rect x={-width / 2} y={-height / 2} width={width} height={height} rx={6} fill={fillColor} stroke={strokeColor} strokeWidth={2.5} />
            {/* Back cushions */}
            <rect x={-width / 2 + 10} y={-height / 2 + 5} width={width - 20} height={20} fill="none" stroke={strokeColor} strokeWidth={1.5} />
            {/* Armrest left/right */}
            <rect x={-width / 2 + 3} y={-height / 2 + 3} width={12} height={height - 6} fill="none" stroke={strokeColor} strokeWidth={1.5} />
            <rect x={width / 2 - 15} y={-height / 2 + 3} width={12} height={height - 6} fill="none" stroke={strokeColor} strokeWidth={1.5} />
          </g>
        );
      case 'bed':
        return (
          <g>
            <rect x={-width / 2} y={-height / 2} width={width} height={height} rx={4} fill={fillColor} stroke={strokeColor} strokeWidth={2} />
            {/* Pillows */}
            <rect x={-width / 2 + 15} y={-height / 2 + 10} width={width / 2.8} height={35} rx={5} fill="none" stroke={strokeColor} strokeWidth={1.5} />
            <rect x={width / 2 - width / 2.8 - 15} y={-height / 2 + 10} width={width / 2.8} height={35} rx={5} fill="none" stroke={strokeColor} strokeWidth={1.5} />
            {/* Blanket line */}
            <line x1={-width / 2} y1={-height / 8} x2={width / 2} y2={-height / 8} stroke={strokeColor} strokeWidth={1.5} />
          </g>
        );
      case 'dolly':
        return (
          <g>
            {/* Rails */}
            <line x1={-width / 2} y1={-15} x2={width / 2} y2={-15} stroke={strokeColor} strokeWidth={3} />
            <line x1={-width / 2} y1={15} x2={width / 2} y2={15} stroke={strokeColor} strokeWidth={3} />
            {/* Ties */}
            {Array.from({ length: 8 }).map((_, i) => {
              const xPos = -width / 2 + (width / 7) * i;
              return <line key={i} x1={xPos} y1={-25} x2={xPos} y2={25} stroke={strokeColor} strokeWidth={1.5} />;
            })}
          </g>
        );
      case 'slider':
        return (
          <g>
            <line x1={-width / 2} y1={0} x2={width / 2} y2={0} stroke={strokeColor} strokeWidth={4} strokeLinecap="round" />
            <circle cx={-width / 2} cy={0} r={5} fill={strokeColor} />
            <circle cx={width / 2} cy={0} r={5} fill={strokeColor} />
            <rect x={-15} y={-8} width={30} height={16} rx={2} fill="#1e293b" stroke={strokeColor} strokeWidth={1.5} />
          </g>
        );
      case 'tripod':
        return (
          <g>
            <circle cx={0} cy={0} r={10} fill={strokeColor} />
            <line x1={0} y1={0} x2={-width / 2} y2={-height / 2} stroke={strokeColor} strokeWidth={2.5} />
            <line x1={0} y1={0} x2={width / 2} y2={-height / 2} stroke={strokeColor} strokeWidth={2.5} />
            <line x1={0} y1={0} x2={0} y2={height / 2} stroke={strokeColor} strokeWidth={2.5} />
          </g>
        );
      default:
        // Generic rectangular box
        return (
          <g>
            <rect
              x={-width / 2} y={-height / 2}
              width={width} height={height}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={2}
              rx={4}
            />
            {/* Cross inside to show it's a structural generic prop */}
            <line x1={-width / 2} y1={-height / 2} x2={width / 2} y2={height / 2} stroke={strokeColor} strokeWidth={0.5} opacity={0.5} />
            <line x1={width / 2} y1={-height / 2} x2={-width / 2} y2={height / 2} stroke={strokeColor} strokeWidth={0.5} opacity={0.5} />
          </g>
        );
    }
  };

  return (
    <div
      className="w-full h-full relative select-none overflow-hidden outline-none bg-[#0a0a0b]"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: spacePressed || tool === 'pan' ? 'grab' : 'default' }}
    >
      <svg
        ref={canvasRef}
        className="w-full h-full absolute top-0 left-0"
        id="scene-designer-svg-canvas"
      >
        {/* Background Grid Pattern */}
        {gridVisible && (
          <defs>
            {/* 100cm major grid, 10cm minor grid */}
            <pattern
              id="minor-grid"
              width={10 * canvasScale}
              height={10 * canvasScale}
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx={5 * canvasScale}
                cy={5 * canvasScale}
                r={0.8}
                fill="#ffffff"
                fillOpacity={0.08}
              />
            </pattern>
            <pattern
              id="major-grid"
              width={100 * canvasScale}
              height={100 * canvasScale}
              patternUnits="userSpaceOnUse"
              x={canvasTranslateX}
              y={canvasTranslateY}
            >
              {/* Minor grid nested */}
              <rect width={100 * canvasScale} height={100 * canvasScale} fill="url(#minor-grid)" />
              {/* Major cross hair or subtle lines */}
              <line x1={0} y1={0} x2={100 * canvasScale} y2={0} stroke="#27272a" strokeOpacity={0.6} strokeWidth={1} />
              <line x1={0} y1={0} x2={0} y2={100 * canvasScale} stroke="#27272a" strokeOpacity={0.6} strokeWidth={1} />
            </pattern>
          </defs>
        )}

        {/* Grid Background Fill */}
        <rect
          id="grid-bg"
          width="100%"
          height="100%"
          fill={gridVisible ? 'url(#major-grid)' : '#0a0a0b'}
        />

        {/* Origin Axes (0,0 center helper) */}
        <g opacity={0.15}>
          <line
            x1={canvasTranslateX}
            y1={0}
            x2={canvasTranslateX}
            y2="100%"
            stroke="#a855f7"
            strokeWidth={1.5}
            strokeDasharray="4,4"
          />
          <line
            x1={0}
            y1={canvasTranslateY}
            x2="100%"
            y2={canvasTranslateY}
            stroke="#a855f7"
            strokeWidth={1.5}
            strokeDasharray="4,4"
          />
          {/* Central cross marker */}
          <circle cx={canvasTranslateX} cy={canvasTranslateY} r={8} fill="none" stroke="#a855f7" strokeWidth={1.5} />
        </g>

        {/* Core Canvas Group with Translation and Scale */}
        <g transform={`translate(${canvasTranslateX}, ${canvasTranslateY}) scale(${canvasScale})`}>
          
          {/* Elements Group */}
          {elements
            .filter((el) => !el.hidden)
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((el) => {
              const isSelected = selectedElementId === el.id;

              return (
                <g
                  key={el.id}
                  transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation})`}
                  onMouseDown={(e) => handleElementMouseDown(el, e)}
                  className="group"
                  style={{ cursor: el.locked ? 'not-allowed' : 'move' }}
                >
                  {/* --- CAMERA SPECIFIC CONE --- */}
                  {el.type === 'camera' && (
                    <g transform="rotate(0)" style={{ pointerEvents: 'none' }}>
                      {/* FOV Sector wedge */}
                      <path
                        d={(() => {
                          const camera = el as CameraElement;
                          const r = camera.targetDistance;
                          const fovRad = (camera.fov * Math.PI) / 180;
                          const halfFov = fovRad / 2;
                          // Standard 0 rotation is pointing along the Y-axis negative (up) in custom camera layout.
                          // Let's draw the wedge pointing straight ahead (up, which is Y=-r in standard vector, or let's orient based on current rotation)
                          // In standard coordinate frame, camera nose points UP (theta = -90 / 270)
                          // Point 1: (0,0)
                          // Point 2: (r * sin(-halfFov), -r * cos(-halfFov)) -> x = r * sin(-halfFov), y = -r * cos(halfFov)
                          // But we want it relative to the node local rotation: let's draw it straight ahead (nose points along negative Y)
                          const x1 = r * Math.sin(-halfFov);
                          const y1 = -r * Math.cos(halfFov);
                          const x2 = r * Math.sin(halfFov);
                          const y2 = -r * Math.cos(halfFov);
                          return `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
                        })()}
                        fill="rgba(16, 185, 129, 0.12)"
                        stroke="#10b981"
                        strokeOpacity={0.3}
                        strokeWidth={1}
                      />
                      {/* Dashed line to optical subject center */}
                      <line
                        x1={0}
                        y1={0}
                        x2={0}
                        y2={-(el as CameraElement).targetDistance}
                        stroke="#10b981"
                        strokeOpacity={0.6}
                        strokeWidth={1}
                        strokeDasharray="5,5"
                      />
                      {/* Subject focus target dot */}
                      <circle
                        cx={0}
                        cy={-(el as CameraElement).targetDistance}
                        r={4}
                        fill="#10b981"
                      />
                    </g>
                  )}

                  {/* --- LIGHT SPECIFIC CONE --- */}
                  {el.type === 'light' && (
                    <g style={{ pointerEvents: 'none' }}>
                      {/* Light cone wedge pointing up (towards Y negative) */}
                      <path
                        d={(() => {
                          const light = el as LightElement;
                          const r = light.falloff || 300;
                          const beamRad = (light.beamAngle * Math.PI) / 180;
                          const halfBeam = beamRad / 2;
                          const x1 = r * Math.sin(-halfBeam);
                          const y1 = -r * Math.cos(halfBeam);
                          const x2 = r * Math.sin(halfBeam);
                          const y2 = -r * Math.cos(halfBeam);
                          return `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
                        })()}
                        fill={(() => {
                          const light = el as LightElement;
                          // Convert Kelvin temperature to beautiful gradient hex
                          const col = kelvinToColor(light.colorTemperature);
                          return `${col}1F`; // ~12% opacity
                        })()}
                        stroke={kelvinToColor((el as LightElement).colorTemperature)}
                        strokeOpacity={0.4}
                        strokeWidth={1.5}
                      />
                    </g>
                  )}

                  {/* --- RENDER PRIMARY SHAPE --- */}
                  {el.type === 'camera' && (
                    <g opacity={el.opacity}>
                      {/* Sleek Camera Symbol */}
                      {/* Lens outline */}
                      <rect x={-8} y={-35} width={16} height={15} rx={2} fill="#18181b" stroke={isSelected ? '#ffffff' : '#10b981'} strokeWidth={2} />
                      {/* Camera body */}
                      <rect x={-18} y={-22} width={36} height={24} rx={4} fill="#18181b" stroke={isSelected ? '#ffffff' : '#10b981'} strokeWidth={3} />
                      {/* Left dial */}
                      <circle cx={-10} cy={-22} r={3} fill="#10b981" />
                      {/* Active green light */}
                      <circle cx={10} cy={-12} r={2} fill="#22c55e" />
                      {/* Camera letter overlay */}
                      <text
                        x={0}
                        y={-4}
                        fill="#ffffff"
                        fontSize={10}
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {(el as CameraElement).cameraNumber || 'A'}
                      </text>
                    </g>
                  )}

                  {/* --- LIGHT ICON --- */}
                  {el.type === 'light' && (
                    <g opacity={el.opacity}>
                      {/* Softbox / Panel shape */}
                      {(() => {
                        const light = el as LightElement;
                        const col = kelvinToColor(light.colorTemperature);
                        const bulbStroke = isSelected ? '#ffffff' : '#fbbf24';

                        if (light.lightType === 'softbox' || light.lightType === 'stripbox') {
                          return (
                            <g>
                              {/* Support arm */}
                              <line x1={0} y1={0} x2={0} y2={20} stroke="#52525b" strokeWidth={2} />
                              {/* Diffusion rectangle */}
                              <rect x={-30} y={-10} width={60} height={20} rx={3} fill="#18181b" stroke={col} strokeWidth={2.5} />
                              {/* Glowing center indicator */}
                              <ellipse cx={0} cy={0} rx={15} ry={4} fill={col} opacity={0.6} />
                            </g>
                          );
                        } else if (light.lightType === 'tube_light') {
                          return (
                            <g>
                              <line x1={-40} y1={0} x2={40} y2={0} stroke={col} strokeWidth={8} strokeLinecap="round" />
                              <line x1={-40} y1={0} x2={40} y2={0} stroke="#18181b" strokeWidth={2} strokeLinecap="round" />
                            </g>
                          );
                        } else {
                          // Classic spot, fresnel, parabolic lamp dome
                          return (
                            <g>
                              {/* U-Yoke mount */}
                              <path d="M -18 -8 A 18 18 0 0 0 18 -8" fill="none" stroke="#52525b" strokeWidth={2} />
                              {/* Lamp cylindrical enclosure */}
                              <rect x={-12} y={-18} width={24} height={22} rx={2} fill="#18181b" stroke={bulbStroke} strokeWidth={2} />
                              {/* Barn doors */}
                              <line x1={-12} y1={-18} x2={-22} y2={-28} stroke="#52525b" strokeWidth={2.5} />
                              <line x1={12} y1={-18} x2={22} y2={-28} stroke="#52525b" strokeWidth={2.5} />
                            </g>
                          );
                        }
                      })()}
                    </g>
                  )}

                  {/* --- PERSON ICON --- */}
                  {el.type === 'person' && (
                    <g opacity={el.opacity}>
                      {/* Actor head & shoulders */}
                      {/* Shoulders path */}
                      <path
                        d="M -24 5 C -24 -15, 24 -15, 24 5 Z"
                        fill="#18181b"
                        stroke={isSelected ? '#ffffff' : el.color}
                        strokeWidth={2.5}
                      />
                      {/* Head circle */}
                      <circle
                        cx={0}
                        cy={-4}
                        r={11}
                        fill="#18181b"
                        stroke={isSelected ? '#ffffff' : el.color}
                        strokeWidth={2.5}
                      />
                      {/* Nose vector / Gaze indicator */}
                      <polygon
                        points="-3,-15 0,-25 3,-15"
                        fill={el.color}
                        transform={`rotate(${(el as PersonElement).lookAngle - 90}, 0, -4)`}
                      />
                    </g>
                  )}

                  {/* --- PROP ICON --- */}
                  {el.type === 'prop' && renderPropShape(el as PropElement)}
                  {el.type === 'environment' && renderPropShape(el as PropElement)}
                  {el.type === 'furniture' && renderPropShape(el as PropElement)}
                  {el.type === 'nature' && renderPropShape(el as PropElement)}
                  {el.type === 'vehicle' && renderPropShape(el as PropElement)}

                  {/* --- LABEL AND DETAILS --- */}
                  <g transform={`rotate(${-el.rotation})`} style={{ pointerEvents: 'none' }}>
                    <rect
                      x={-50}
                      y={el.type === 'camera' ? 22 : 28}
                      width={100}
                      height={16}
                      rx={3}
                      fill="#09090b"
                      fillOpacity={0.85}
                      stroke="#27272a"
                      strokeWidth={0.5}
                    />
                    <text
                      x={0}
                      y={el.type === 'camera' ? 34 : 40}
                      fill={isSelected ? '#ffffff' : '#d4d4d8'}
                      fontSize={8}
                      fontFamily="sans-serif"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {el.label || el.name}
                    </text>
                  </g>

                  {/* --- SELECTION OUTLINE AND ROTATE HANDLE --- */}
                  {isSelected && !el.locked && (
                    <g style={{ pointerEvents: 'auto' }}>
                      {/* Thin circular outline */}
                      <circle
                        cx={0}
                        cy={0}
                        r={el.type === 'camera' ? 28 : 34}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth={1}
                        strokeDasharray="4,2"
                      />
                      
                      {/* Rotation Handle stem */}
                      <line
                        x1={0}
                        y1={el.type === 'camera' ? -28 : -34}
                        x2={0}
                        y2={el.type === 'camera' ? -50 : -56}
                        stroke="#a855f7"
                        strokeWidth={1.5}
                      />
                      {/* Rotation Handle Circle button */}
                      <circle
                        cx={0}
                        cy={el.type === 'camera' ? -50 : -56}
                        r={6}
                        fill="#a855f7"
                        stroke="#ffffff"
                        strokeWidth={1.5}
                        className="cursor-alias hover:scale-125 transition-transform"
                        onMouseDown={(e) => handleElementMouseDown(el, e, true)}
                        title="Trascina per ruotare"
                      />
                    </g>
                  )}
                </g>
              );
            })}
        </g>
      </svg>

      {/* Rulers / Coordinate overlays in Centimeters */}
      {rulersVisible && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {/* Horizontal top ruler */}
          <div className="absolute top-0 left-0 w-full h-6 bg-[#0f0f11]/95 border-b border-[#27272a] text-[10px] font-mono text-zinc-500 flex items-center overflow-hidden">
            <div className="w-6 border-r border-[#27272a] h-full flex items-center justify-center bg-[#0a0a0b] font-bold text-zinc-400">cm</div>
            <div className="relative w-full h-full">
              {Array.from({ length: 40 }).map((_, i) => {
                // Compute ruler division marks in cm
                const step = 100; // mark every meter
                const offset = canvasTranslateX + (i - 20) * step * canvasScale;
                if (offset < 0 || offset > window.innerWidth) return null;
                return (
                  <div
                    key={i}
                    className="absolute bottom-0 h-full flex flex-col justify-end border-l border-[#27272a] pb-0.5"
                    style={{ left: `${offset}px` }}
                  >
                    <span className="pl-1 leading-none">{(i - 20)}m</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vertical left ruler */}
          <div className="absolute top-6 left-0 w-6 h-[calc(100%-24px)] bg-[#0f0f11]/95 border-r border-[#27272a] text-[10px] font-mono text-zinc-500 flex flex-col overflow-hidden">
            <div className="relative w-full h-full">
              {Array.from({ length: 30 }).map((_, i) => {
                const step = 100; // mark every meter
                const offset = canvasTranslateY + (i - 15) * step * canvasScale - 24; // offset 24px top bar
                if (offset < 0 || offset > window.innerHeight) return null;
                return (
                  <div
                    key={i}
                    className="absolute left-0 w-full border-t border-[#27272a] pt-0.5 pl-0.5"
                    style={{ top: `${offset}px` }}
                  >
                    <span className="block transform rotate-270 origin-left pl-1">{(i - 15)}m</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Canvas Scale overlay & Reset Zoom */}
      <div className="absolute bottom-4 left-10 bg-[#0f0f11]/90 border border-[#27272a] px-3 py-1.5 rounded-none text-xs text-zinc-400 flex items-center gap-3 backdrop-blur shadow-md font-mono z-10">
        <span>Zoom: {Math.round(canvasScale * 100)}%</span>
        <button
          onClick={() => setCanvasTransform(1, 300, 250)}
          className="px-1.5 py-0.5 bg-[#0a0a0b] hover:bg-[#121214] text-zinc-200 border border-[#27272a] rounded-none transition cursor-pointer"
        >
          Reset
        </button>
        <span className="text-zinc-600">|</span>
        <span>1 unità = 1cm</span>
      </div>
    </div>
  );
}
