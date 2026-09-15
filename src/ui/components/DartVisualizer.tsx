import React from 'react';
import {
  EquipmentItem,
  EquippedLoadout,
  getEquipmentItemById
} from '../../core/equipment/EquipmentItem';
import {
  RotateCcw, Check, Sparkles, Eye
} from 'lucide-react';

interface DartVisualizerProps {
  loadout: EquippedLoadout;
  previewItem?: EquipmentItem | null;
  onResetPreview?: () => void;
  onEquipPreview?: (item: EquipmentItem) => void;
  onSelectCategory?: (category: 'barrel' | 'shaft' | 'flight' | 'all') => void;
}

export const DartVisualizer: React.FC<DartVisualizerProps> = ({
  loadout,
  previewItem,
  onResetPreview,
  onEquipPreview,
  onSelectCategory
}) => {
  // Determine active components (applying preview overlay if provided)
  let equippedBarrel = getEquipmentItemById(loadout.barrelId);
  let equippedShaft = getEquipmentItemById(loadout.shaftId);
  let equippedFlight = getEquipmentItemById(loadout.flightId);
  const completeSet = loadout.completeSetId ? getEquipmentItemById(loadout.completeSetId) : undefined;

  if (completeSet) {
    // Complete set provides unified specs
    equippedBarrel = equippedBarrel || completeSet;
    equippedShaft = equippedShaft || completeSet;
    equippedFlight = equippedFlight || completeSet;
  }

  // Active preview overrides
  const isPreviewing = !!previewItem;
  let activeBarrel = equippedBarrel;
  let activeShaft = equippedShaft;
  let activeFlight = equippedFlight;

  if (previewItem) {
    if (previewItem.category === 'complete_set') {
      activeBarrel = previewItem;
      activeShaft = previewItem;
      activeFlight = previewItem;
    } else if (previewItem.category === 'barrel') {
      activeBarrel = previewItem;
    } else if (previewItem.category === 'shaft') {
      activeShaft = previewItem;
    } else if (previewItem.category === 'flight') {
      activeFlight = previewItem;
    }
  }

  // Fallback defaults
  const barrel = activeBarrel || {
    id: 'default-barrel',
    name: 'Standard Brass 22g',
    barrelMaterial: 'brass' as const,
    barrelProfile: 'straight' as const,
    gripType: 'ringed' as const,
    weightGrams: 22,
    visualFinish: 'Natural Brass',
    visualColor: '#d4af37',
    pointStyle: 'silver_steel' as const,
    modifiers: { scoringModifier: 1.0, doublingModifier: 1.0, consistencyModifier: 1.0, fatigueModifier: 1.0 }
  };

  const shaft = activeShaft || {
    id: 'default-shaft',
    name: 'Nylon Medium',
    shaftLength: 'medium' as const,
    shaftMaterial: 'nylon' as const,
    visualFinish: 'Jet Black Nylon',
    visualColor: '#18181b',
    weightGrams: 1.2,
    modifiers: { scoringModifier: 1.0, doublingModifier: 1.0, consistencyModifier: 1.0, fatigueModifier: 1.0 }
  };

  const flight = activeFlight || {
    id: 'default-flight',
    name: 'Standard 100 Micron',
    flightShape: 'standard' as const,
    flightType: 'foldable_100' as const,
    flightDesign: 'classic_solid',
    visualFinish: 'Royal Blue',
    visualColor: '#3b82f6',
    weightGrams: 0.6,
    modifiers: { scoringModifier: 1.0, doublingModifier: 1.0, consistencyModifier: 1.0, fatigueModifier: 1.0 }
  };

  // Dart Dimensions Calculation
  const totalWeight = Number((
    (barrel.weightGrams || 22) +
    (shaft.weightGrams || 1.1) +
    (flight.weightGrams || 0.7)
  ).toFixed(1));

  // Barrel Length in SVG units
  const barrelStartX = 115;
  const barrelLength = 195;
  const barrelEndX = barrelStartX + barrelLength; // 310

  // Shaft Length in SVG units
  const shaftLengthPx = shaft.shaftLength === 'short' ? 100 : shaft.shaftLength === 'in_between' ? 140 : 180;
  const shaftStartX = barrelEndX;
  const shaftEndX = shaftStartX + shaftLengthPx;

  // Flight positioning
  const flightSlotDepth = 25;
  const flightStartX = shaftEndX - flightSlotDepth;
  const flightLengthPx = 110;
  const flightEndX = flightStartX + flightLengthPx;

  // Total mm length estimate
  const totalLengthMm = Math.round(30 + (barrelLength / 4.5) + (shaftLengthPx / 3.5) + 35);

  // Center of Gravity / Balance Point X coordinate
  let cogX = 210; // baseline center
  if (barrel.barrelProfile === 'bomb') cogX = 185; // front heavy
  else if (barrel.barrelProfile === 'torpedo') cogX = 195;
  else if (barrel.barrelProfile === 'scallop') cogX = 205;
  else if (shaft.shaftLength === 'short') cogX = 200;
  else if (shaft.shaftLength === 'medium') cogX = 220;

  const getBalanceDescription = () => {
    if (barrel.barrelProfile === 'bomb' || barrel.barrelProfile === 'torpedo') {
      return 'Front-Weighted (High Treble Momentum)';
    }
    if (shaft.shaftLength === 'short') {
      return 'Nose-Biased (Aggressive Entry Angle)';
    }
    if (shaft.shaftLength === 'medium') {
      return 'Center-Balanced (Smooth Arc Cadence)';
    }
    return 'Balanced Aerodynamic Trajectory';
  };

  // Point Style colors
  const pointStyle = barrel.pointStyle || (barrel.barrelMaterial === 'brass' ? 'silver_steel' : 'black_laser');
  
  // Barrel Material styling
  const barrelMaterial = barrel.barrelMaterial || 'tungsten_90';
  const barrelColor = barrel.visualColor || (
    barrelMaterial === 'brass' ? '#d4af37' :
    barrelMaterial === 'tungsten_80' ? '#94a3b8' :
    barrelMaterial === 'tungsten_95' ? '#18181b' : '#e2e8f0'
  );

  const gripType = barrel.gripType || 'ringed';
  const barrelProfile = barrel.barrelProfile || 'straight';

  // SVG dynamic paths
  const renderBarrelBody = () => {
    if (barrelProfile === 'bomb') {
      return (
        <path
          d={`M ${barrelStartX} 80
              C ${barrelStartX + 30} 66, ${barrelStartX + 70} 66, ${barrelStartX + 100} 74
              L ${barrelEndX} 78
              L ${barrelEndX} 102
              L ${barrelStartX + 100} 106
              C ${barrelStartX + 70} 114, ${barrelStartX + 30} 114, ${barrelStartX} 100
              Z`}
          fill="url(#barrelGrad)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
        />
      );
    } else if (barrelProfile === 'torpedo') {
      return (
        <path
          d={`M ${barrelStartX} 83
              C ${barrelStartX + 40} 70, ${barrelStartX + 90} 72, ${barrelStartX + 130} 76
              L ${barrelEndX} 78
              L ${barrelEndX} 102
              L ${barrelStartX + 130} 104
              C ${barrelStartX + 90} 108, ${barrelStartX + 40} 110, ${barrelStartX} 97
              Z`}
          fill="url(#barrelGrad)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
        />
      );
    } else if (barrelProfile === 'scallop') {
      return (
        <path
          d={`M ${barrelStartX} 75
              L ${barrelStartX + 50} 75
              C ${barrelStartX + 75} 81, ${barrelStartX + 105} 81, ${barrelStartX + 130} 76
              L ${barrelEndX} 76
              L ${barrelEndX} 104
              L ${barrelStartX + 130} 104
              C ${barrelStartX + 105} 99, ${barrelStartX + 75} 99, ${barrelStartX + 50} 105
              L ${barrelStartX} 105
              Z`}
          fill="url(#barrelGrad)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
        />
      );
    }

    // Straight cylinder (standard parallel)
    return (
      <rect
        x={barrelStartX}
        y="74"
        width={barrelLength}
        height="32"
        rx="3"
        fill="url(#barrelGrad)"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1"
      />
    );
  };

  // Render grip rings / texture lines across the barrel
  const renderGripTexture = () => {
    const rings = [];
    const step = gripType === 'micro_grip' ? 4 : gripType === 'shark_fin' ? 10 : 8;
    const startOffset = barrelStartX + 20;
    const endOffset = barrelEndX - 15;

    for (let x = startOffset; x < endOffset; x += step) {
      if (gripType === 'shark_fin') {
        rings.push(
          <path
            key={`grip-${x}`}
            d={`M ${x} 74 L ${x + 4} 74 L ${x + 6} 78 L ${x + 6} 102 L ${x + 4} 106 L ${x} 106 Z`}
            fill="rgba(0,0,0,0.45)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.8"
          />
        );
      } else if (gripType === 'micro_grip') {
        rings.push(
          <line
            key={`grip-${x}`}
            x1={x}
            y1="75"
            x2={x}
            y2="105"
            stroke="rgba(0,0,0,0.5)"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
        );
      } else if (gripType === 'scalloped') {
        rings.push(
          <line
            key={`grip-${x}`}
            x1={x}
            y1="76"
            x2={x}
            y2="104"
            stroke="rgba(255,215,0,0.6)"
            strokeWidth="1.5"
          />
        );
      } else {
        // Standard Ringed
        rings.push(
          <g key={`grip-${x}`}>
            <line x1={x} y1="75" x2={x} y2="105" stroke="rgba(0,0,0,0.6)" strokeWidth="1.8" />
            <line x1={x + 1} y1="75" x2={x + 1} y2="105" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          </g>
        );
      }
    }
    return rings;
  };

  // Render Shaft / Stem
  const renderShaft = () => {
    const shaftMat = shaft.shaftMaterial || 'nylon';
    const isCarbon = shaftMat === 'carbon_composite';
    const isTitanium = shaftMat === 'titanium';
    const isAlu = shaftMat === 'aluminium';

    const stemColor = shaft.visualColor || (
      isCarbon ? '#27272a' :
      isTitanium ? '#a1a1aa' :
      isAlu ? '#2563eb' : '#18181b'
    );

    return (
      <g id="shaft-group" className="cursor-pointer" onClick={() => onSelectCategory?.('shaft')}>
        {/* Shaft Base Thread Collar */}
        <rect
          x={shaftStartX}
          y="80"
          width="12"
          height="20"
          rx="1"
          fill="#52525b"
          stroke="#71717a"
          strokeWidth="0.8"
        />
        {/* Shaft Main Rod */}
        <rect
          x={shaftStartX + 12}
          y="82"
          width={shaftLengthPx - 12}
          height="16"
          rx="2"
          fill={isCarbon ? 'url(#carbonPattern)' : stemColor}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
        {/* Top Highlight Sheen */}
        <line
          x1={shaftStartX + 12}
          y1="84"
          x2={shaftEndX}
          y2="84"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
        />
        {/* Titanium Spinning Collar or O-Ring */}
        {isTitanium ? (
          <g>
            <rect
              x={shaftEndX - 26}
              y="79"
              width="14"
              height="22"
              rx="2"
              fill="#d97706"
              stroke="#fef08a"
              strokeWidth="0.8"
            />
            <circle cx={shaftEndX - 19} cy="90" r="2" fill="#fff" />
          </g>
        ) : (
          /* Flight Retention Ring / Spring */
          <rect
            x={shaftEndX - 18}
            y="80"
            width="5"
            height="20"
            rx="1"
            fill="#e4e4e7"
            stroke="#71717a"
            strokeWidth="0.6"
          />
        )}
      </g>
    );
  };

  // Render Flight Wings
  const renderFlight = () => {
    const shape = flight.flightShape || 'standard';
    const design = flight.flightDesign || 'classic_solid';
    const flightCol = flight.visualColor || '#3b82f6';

    const yMid = 90;
    let wingTopY = 32;
    let wingBottomY = 148;
    const backX = flightEndX;

    if (shape === 'slim') {
      wingTopY = 62;
      wingBottomY = 118;
    } else if (shape === 'pear') {
      wingTopY = 40;
      wingBottomY = 140;
    } else if (shape === 'kite') {
      wingTopY = 36;
      wingBottomY = 144;
    }

    let wingPath = '';
    if (shape === 'kite') {
      wingPath = `
        M ${flightStartX} 87
        L ${flightStartX + 50} ${wingTopY}
        L ${backX} 82
        L ${backX} 98
        L ${flightStartX + 50} ${wingBottomY}
        L ${flightStartX} 93
        Z
      `;
    } else if (shape === 'pear') {
      wingPath = `
        M ${flightStartX} 87
        C ${flightStartX + 35} ${wingTopY}, ${backX - 25} ${wingTopY}, ${backX} 76
        L ${backX} 104
        C ${backX - 25} ${wingBottomY}, ${flightStartX + 35} ${wingBottomY}, ${flightStartX} 93
        Z
      `;
    } else {
      // Standard / Molded
      wingPath = `
        M ${flightStartX} 86
        C ${flightStartX + 20} ${wingTopY + 15}, ${flightStartX + 35} ${wingTopY}, ${backX - 10} ${wingTopY}
        L ${backX} ${wingTopY + 8}
        L ${backX} ${wingBottomY - 8}
        L ${backX - 10} ${wingBottomY}
        C ${flightStartX + 35} ${wingBottomY}, ${flightStartX + 20} ${wingBottomY - 15}, ${flightStartX} 94
        Z
      `;
    }

    return (
      <g id="flight-group" className="cursor-pointer" onClick={() => onSelectCategory?.('flight')}>
        {/* Shadow wing behind for 3D depth */}
        <path
          d={wingPath}
          transform="translate(4, -3) scale(0.98)"
          fill="rgba(0,0,0,0.4)"
        />

        {/* Main Aerodynamic Wing */}
        <path
          d={wingPath}
          fill={flightCol}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.2"
          filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
        />

        {/* Graphic Design Overlays */}
        {design === 'union_jack' && (
          <g opacity="0.85">
            <line x1={flightStartX + 10} y1={wingTopY + 5} x2={backX - 5} y2={wingBottomY - 5} stroke="#fff" strokeWidth="8" />
            <line x1={flightStartX + 10} y1={wingTopY + 5} x2={backX - 5} y2={wingBottomY - 5} stroke="#dc2626" strokeWidth="4" />
            <line x1={flightStartX + 10} y1={wingBottomY - 5} x2={backX - 5} y2={wingTopY + 5} stroke="#fff" strokeWidth="8" />
            <line x1={flightStartX + 10} y1={wingBottomY - 5} x2={backX - 5} y2={wingTopY + 5} stroke="#dc2626" strokeWidth="4" />
            <line x1={(flightStartX + backX) / 2} y1={wingTopY} x2={(flightStartX + backX) / 2} y2={wingBottomY} stroke="#fff" strokeWidth="12" />
            <line x1={(flightStartX + backX) / 2} y1={wingTopY} x2={(flightStartX + backX) / 2} y2={wingBottomY} stroke="#dc2626" strokeWidth="6" />
            <line x1={flightStartX} y1={yMid} x2={backX} y2={yMid} stroke="#fff" strokeWidth="10" />
            <line x1={flightStartX} y1={yMid} x2={backX} y2={yMid} stroke="#dc2626" strokeWidth="5" />
          </g>
        )}

        {design === 'stealth_carbon' && (
          <g>
            <path d={wingPath} fill="url(#carbonPattern)" opacity="0.55" />
            <path d={wingPath} stroke="#10b981" strokeWidth="2" fill="none" opacity="0.8" />
          </g>
        )}

        {design === 'neon_lightning' && (
          <path
            d={`M ${flightStartX + 20} 85 L ${flightStartX + 45} 55 L ${flightStartX + 52} 70 L ${backX - 15} 45`}
            stroke="#facc15"
            strokeWidth="3"
            fill="none"
            filter="drop-shadow(0 0 6px #06b6d4)"
          />
        )}

        {design === 'golden_wings' && (
          <g stroke="#fef08a" strokeWidth="1.5" fill="none" opacity="0.9">
            <path d={`M ${flightStartX + 25} 90 Q ${flightStartX + 55} 55, ${backX - 15} 50`} />
            <path d={`M ${flightStartX + 35} 90 Q ${flightStartX + 65} 65, ${backX - 15} 65`} />
            <path d={`M ${flightStartX + 25} 90 Q ${flightStartX + 55} 125, ${backX - 15} 130`} />
            <path d={`M ${flightStartX + 35} 90 Q ${flightStartX + 65} 115, ${backX - 15} 115`} />
          </g>
        )}

        {design === 'flame_burst' && (
          <g fill="#f59e0b" opacity="0.85">
            <circle cx={flightStartX + 45} cy={yMid} r="20" fill="#ef4444" opacity="0.5" />
            <polygon points={`${flightStartX + 20},90 ${flightStartX + 65},55 ${flightStartX + 55},85 ${backX - 10},90 ${flightStartX + 55},95 ${flightStartX + 65},125`} />
          </g>
        )}

        {design === 'target_crosshair' && (
          <g stroke="#ffffff" strokeWidth="1.5" opacity="0.85" fill="none">
            <circle cx={(flightStartX + backX) / 2} cy={yMid} r="24" />
            <circle cx={(flightStartX + backX) / 2} cy={yMid} r="14" stroke="#f97316" strokeWidth="2" />
            <circle cx={(flightStartX + backX) / 2} cy={yMid} r="4" fill="#f97316" />
            <line x1={(flightStartX + backX) / 2 - 32} y1={yMid} x2={(flightStartX + backX) / 2 + 32} y2={yMid} />
            <line x1={(flightStartX + backX) / 2} y1={yMid - 32} x2={(flightStartX + backX) / 2} y2={yMid + 32} />
          </g>
        )}

        {/* 90-degree Molded Wing Cross Rib */}
        <line
          x1={flightStartX}
          y1={yMid}
          x2={backX}
          y2={yMid}
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="2"
        />
      </g>
    );
  };

  return (
    <div className="bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden">
      {/* Background Decorative Tech Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

      {/* Top Header & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                Virtual Oche Workbench
              </span>
              {isPreviewing ? (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase flex items-center gap-1 animate-pulse">
                  <Eye className="w-3 h-3" /> Live Store Preview
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase flex items-center gap-1">
                  <Check className="w-3 h-3" /> Currently Equipped
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mt-0.5">
              {isPreviewing ? previewItem?.name : (completeSet ? completeSet.name : barrel.name)}
            </h3>
          </div>
        </div>

        {/* Action Controls when previewing */}
        {isPreviewing && previewItem && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetPreview}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-neutral-700 shadow"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Setup</span>
            </button>

            {onEquipPreview && (
              <button
                type="button"
                onClick={() => onEquipPreview(previewItem)}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Equip Previewed Part</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Assembled Dart Canvas (SVG) */}
      <div className="relative w-full bg-neutral-950/90 border border-neutral-800 rounded-2xl p-2 sm:p-4 shadow-inner flex flex-col items-center justify-center overflow-x-auto select-none">
        <svg
          viewBox="0 0 740 180"
          className="w-full max-w-4xl h-44 sm:h-52 drop-shadow-2xl overflow-visible"
        >
          <defs>
            {/* Metallic Linear Gradients */}
            <linearGradient id="silverSteelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="40%" stopColor="#f8fafc" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            <linearGradient id="goldSteelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="40%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            <linearGradient id="blackSteelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="45%" stopColor="#475569" />
              <stop offset="75%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <linearGradient id="barrelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.5)" />
              <stop offset="20%" stopColor={barrelColor} />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="75%" stopColor={barrelColor} />
              <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
            </linearGradient>

            {/* Carbon Fiber Texture Pattern */}
            <pattern id="carbonPattern" width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="#18181b" />
              <polygon points="0,0 3,0 0,3" fill="#27272a" />
              <polygon points="3,3 6,3 3,6" fill="#27272a" />
              <polygon points="3,0 6,3 6,0" fill="#3f3f46" />
              <polygon points="0,3 3,6 0,6" fill="#3f3f46" />
            </pattern>
          </defs>

          {/* Background Technical Ruler / Axis */}
          <g opacity="0.2" stroke="#94a3b8" strokeWidth="0.8">
            <line x1="20" y1="90" x2="720" y2="90" strokeDasharray="4 4" />
            {Array.from({ length: 36 }).map((_, i) => (
              <line key={i} x1={30 + i * 19} y1="165" x2={30 + i * 19} y2={i % 5 === 0 ? "155" : "160"} />
            ))}
          </g>

          {/* ============================================================== */}
          {/* 1. STEEL TIP POINT (Leftmost)                                  */}
          {/* ============================================================== */}
          <g id="steel-point" className="cursor-pointer">
            {/* Point Needle Body */}
            <polygon
              points={`35,90 ${barrelStartX},86 ${barrelStartX},94`}
              fill={
                pointStyle === 'gold_ringed' ? 'url(#goldSteelGrad)' :
                pointStyle === 'black_laser' ? 'url(#blackSteelGrad)' : 'url(#silverSteelGrad)'
              }
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.8"
            />
            {/* Specular Glint */}
            <line x1="42" y1="89" x2={barrelStartX - 5} y2="88" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />

            {/* Laser rings on point */}
            {pointStyle === 'black_laser' && (
              <g stroke="rgba(255,255,255,0.5)" strokeWidth="1">
                <line x1={barrelStartX - 45} y1="88" x2={barrelStartX - 45} y2="92" />
                <line x1={barrelStartX - 35} y1="87" x2={barrelStartX - 35} y2="93" />
                <line x1={barrelStartX - 25} y1="87" x2={barrelStartX - 25} y2="93" />
              </g>
            )}

            {pointStyle === 'gold_ringed' && (
              <g stroke="#fef08a" strokeWidth="1.5">
                <line x1={barrelStartX - 40} y1="88" x2={barrelStartX - 40} y2="92" />
                <line x1={barrelStartX - 30} y1="87" x2={barrelStartX - 30} y2="93" />
                <line x1={barrelStartX - 20} y1="87" x2={barrelStartX - 20} y2="93" />
              </g>
            )}

            {/* Nose Cone Transition Collar */}
            <path
              d={`M ${barrelStartX - 8} 86 L ${barrelStartX} 83 L ${barrelStartX} 97 L ${barrelStartX - 8} 94 Z`}
              fill="#475569"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.8"
            />
          </g>

          {/* ============================================================== */}
          {/* 2. DART BARREL (Centerpiece)                                    */}
          {/* ============================================================== */}
          <g id="barrel-group" className="cursor-pointer" onClick={() => onSelectCategory?.('barrel')}>
            {renderBarrelBody()}
            {renderGripTexture()}

            {/* Laser etched weight watermark on rear barrel */}
            <text
              x={barrelEndX - 38}
              y="92.5"
              fill="rgba(255,255,255,0.65)"
              fontSize="6.5"
              fontWeight="900"
              fontFamily="monospace"
              letterSpacing="0.5"
            >
              {barrel.weightGrams || 22}g {barrelMaterial.toUpperCase().replace('_', ' ')}
            </text>
          </g>

          {/* ============================================================== */}
          {/* 3. SHAFT / STEM                                                */}
          {/* ============================================================== */}
          {renderShaft()}

          {/* ============================================================== */}
          {/* 4. FLIGHT WINGS                                                */}
          {/* ============================================================== */}
          {renderFlight()}

          {/* ============================================================== */}
          {/* CENTER OF GRAVITY (C.O.G.) MARKER                              */}
          {/* ============================================================== */}
          <g id="cog-marker" className="transition-all duration-300">
            <line x1={cogX} y1="55" x2={cogX} y2="125" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3 3" />
            <circle cx={cogX} cy="90" r="5" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
            <circle cx={cogX} cy="90" r="2" fill="#000" />
            {/* COG Label */}
            <rect x={cogX - 28} y="36" width="56" height="16" rx="4" fill="#18181b" stroke="#f59e0b" strokeWidth="1" />
            <text x={cogX} y="47" textAnchor="middle" fill="#f59e0b" fontSize="7.5" fontWeight="bold">
              BALANCE PT
            </text>
          </g>
        </svg>

        {/* Interactive Clickable Hotspot Pins */}
        <div className="grid grid-cols-2 sm:grid-cols-4 w-full pt-3 border-t border-neutral-800/80 text-center text-xs gap-2">
          <button
            type="button"
            onClick={() => onSelectCategory?.('barrel')}
            className="p-2 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/60 hover:bg-neutral-800 transition-all text-left flex items-center justify-between group"
          >
            <div>
              <span className="text-[9px] uppercase font-bold text-neutral-400 block group-hover:text-amber-400">
                1. Steel Point & Barrel
              </span>
              <span className="font-bold text-white text-xs truncate block">
                {barrel.name}
              </span>
              <span className="text-[10px] text-neutral-400 block">
                {barrel.visualFinish || 'Precision Engineered'}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">{barrel.weightGrams}g</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectCategory?.('shaft')}
            className="p-2 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/60 hover:bg-neutral-800 transition-all text-left flex items-center justify-between group"
          >
            <div>
              <span className="text-[9px] uppercase font-bold text-neutral-400 block group-hover:text-amber-400">
                2. Shaft / Stem
              </span>
              <span className="font-bold text-white text-xs truncate block">
                {shaft.name}
              </span>
              <span className="text-[10px] text-neutral-400 block capitalize">
                {shaft.shaftLength?.replace('_', ' ')} • {shaft.shaftMaterial}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-300">{shaft.weightGrams}g</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectCategory?.('flight')}
            className="p-2 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/60 hover:bg-neutral-800 transition-all text-left flex items-center justify-between group"
          >
            <div>
              <span className="text-[9px] uppercase font-bold text-neutral-400 block group-hover:text-amber-400">
                3. Aerodynamic Flight
              </span>
              <span className="font-bold text-white text-xs truncate block">
                {flight.name}
              </span>
              <span className="text-[10px] text-neutral-400 block capitalize">
                {flight.flightShape} Wing • {flight.flightDesign?.replace('_', ' ')}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-300">{flight.weightGrams}g</span>
          </button>

          <div className="p-2 rounded-xl bg-neutral-900/90 border border-neutral-800 text-left flex flex-col justify-center">
            <span className="text-[9px] uppercase font-bold text-amber-400 block">
              Total Assembled Darts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-mono font-black text-white">{totalWeight}g</span>
              <span className="text-[11px] font-mono text-neutral-400">~{totalLengthMm}mm</span>
            </div>
            <span className="text-[10px] text-emerald-400 truncate block font-medium">
              {getBalanceDescription()}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Dynamic Multiplier Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center text-xs">
        <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
          <span className="text-[9px] uppercase font-bold text-neutral-400 block">Treble Scoring</span>
          <span className="font-mono font-black text-white text-sm">
            x{(barrel.modifiers?.scoringModifier || 1.0).toFixed(2)}
          </span>
        </div>
        <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
          <span className="text-[9px] uppercase font-bold text-neutral-400 block">Outer Ring Checkout</span>
          <span className="font-mono font-black text-white text-sm">
            x{(barrel.modifiers?.doublingModifier || 1.0).toFixed(2)}
          </span>
        </div>
        <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
          <span className="text-[9px] uppercase font-bold text-neutral-400 block">Grouping Consistency</span>
          <span className="font-mono font-black text-white text-sm">
            x{(barrel.modifiers?.consistencyModifier || 1.0).toFixed(2)}
          </span>
        </div>
        <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
          <span className="text-[9px] uppercase font-bold text-neutral-400 block">Arm Fatigue Accrual</span>
          <span className="font-mono font-black text-emerald-400 text-sm">
            x{(barrel.modifiers?.fatigueModifier || 1.0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
