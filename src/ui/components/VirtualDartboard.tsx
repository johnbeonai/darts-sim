import React, { useMemo } from 'react';
import { DartboardGeometry, DartboardHitResult } from '../../core/throwing/DartboardGeometry';
import { AimingSwayState } from '../../core/throwing/ThrowPhysicsEngine';

export interface StuckDart {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly segment: number;
  readonly multiplier: 1 | 2 | 3;
  readonly label: string;
  readonly dartNumber: number; // 1, 2, 3
  readonly landingAngleDeg?: number;
  readonly landingPitchDeg?: number;
}

interface VirtualDartboardProps {
  stuckDarts: StuckDart[];
  aimPoint: { x: number; y: number };
  sway: AimingSwayState;
  onBoardClick?: (x: number, y: number) => void;
  isThrowing?: boolean;
  flyingDartCoord?: { x: number; y: number; progress: number } | null;
  zoomTarget?: { x: number; y: number } | null;
  highlightSegment?: number | null;
  highlightMultiplier?: 1 | 2 | 3 | null;
}

export const VirtualDartboard: React.FC<VirtualDartboardProps> = ({
  stuckDarts,
  aimPoint,
  sway,
  onBoardClick,
  isThrowing = false,
  flyingDartCoord = null,
  zoomTarget = null,
  highlightSegment = null,
  highlightMultiplier = null,
}) => {
  // SVG ViewBox dimensions: centered at (0, 0)
  const viewBox = zoomTarget
    ? `${zoomTarget.x - 70} ${zoomTarget.y - 70} 140 140`
    : '-225 -225 450 450';

  // Board Radii
  const rDoubleOuter = DartboardGeometry.DOUBLE_OUTER_RADIUS; // 170
  const rDoubleInner = DartboardGeometry.DOUBLE_INNER_RADIUS; // 160
  const rTrebleOuter = DartboardGeometry.TREBLE_OUTER_RADIUS; // 107
  const rTrebleInner = DartboardGeometry.TREBLE_INNER_RADIUS; // 97
  const rOuterBull = DartboardGeometry.OUTER_BULL_RADIUS;     // 15.9
  const rBullseye = DartboardGeometry.DOUBLE_BULL_RADIUS;      // 6.35

  // Precompute sector SVG arc paths
  const sectorElements = useMemo(() => {
    const elements: React.ReactNode[] = [];
    const degPerSector = DartboardGeometry.SECTOR_DEGREES; // 18 deg

    DartboardGeometry.SECTOR_ORDER.forEach((num, index) => {
      const isEven = index % 2 === 0;
      const startDeg = index * degPerSector - degPerSector / 2;
      const endDeg = startDeg + degPerSector;

      // Convert angles clockwise from top (-90 deg) to radians
      const startRad = ((startDeg - 90) * Math.PI) / 180;
      const endRad = ((endDeg - 90) * Math.PI) / 180;

      // Helper to generate SVG donut segment slice path
      const createDonutSlice = (rIn: number, rOut: number): string => {
        const x1 = rOut * Math.cos(startRad);
        const y1 = rOut * Math.sin(startRad);
        const x2 = rOut * Math.cos(endRad);
        const y2 = rOut * Math.sin(endRad);
        const x3 = rIn * Math.cos(endRad);
        const y3 = rIn * Math.sin(endRad);
        const x4 = rIn * Math.cos(startRad);
        const y4 = rIn * Math.sin(startRad);

        return `M ${x1} ${y1} A ${rOut} ${rOut} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 0 0 ${x4} ${y4} Z`;
      };

      const isSegHighlighted = highlightSegment === num;

      // 1. Double Ring Slice (Red / Green)
      const doubleColor = isEven ? '#dc2626' : '#16a34a';
      const isDoubleHigh = isSegHighlighted && (highlightMultiplier === 2 || highlightMultiplier === null);
      elements.push(
        <path
          key={`d-${num}`}
          d={createDonutSlice(rDoubleInner, rDoubleOuter)}
          fill={isDoubleHigh ? '#fbbf24' : doubleColor}
          stroke="#404040"
          strokeWidth="0.8"
          className="transition-colors duration-150"
        />
      );

      // 2. Outer Single Bed (Black / Cream)
      const outerSingleColor = isEven ? '#18181b' : '#f5f5f4';
      const isSingleHigh = isSegHighlighted && (highlightMultiplier === 1 || highlightMultiplier === null);
      elements.push(
        <path
          key={`os-${num}`}
          d={createDonutSlice(rTrebleOuter, rDoubleInner)}
          fill={isSingleHigh ? (isEven ? '#78350f' : '#fde68a') : outerSingleColor}
          stroke="#404040"
          strokeWidth="0.8"
        />
      );

      // 3. Treble Ring Slice (Red / Green)
      const trebleColor = isEven ? '#dc2626' : '#16a34a';
      const isTrebleHigh = isSegHighlighted && (highlightMultiplier === 3 || highlightMultiplier === null);
      elements.push(
        <path
          key={`t-${num}`}
          d={createDonutSlice(rTrebleInner, rTrebleOuter)}
          fill={isTrebleHigh ? '#fbbf24' : trebleColor}
          stroke="#404040"
          strokeWidth="0.8"
          className="transition-colors duration-150"
        />
      );

      // 4. Inner Single Bed (Black / Cream)
      const innerSingleColor = isEven ? '#18181b' : '#f5f5f4';
      elements.push(
        <path
          key={`is-${num}`}
          d={createDonutSlice(rOuterBull, rTrebleInner)}
          fill={isSingleHigh ? (isEven ? '#78350f' : '#fde68a') : innerSingleColor}
          stroke="#404040"
          strokeWidth="0.8"
        />
      );

      // 5. Wire separator line
      const wireX = rDoubleOuter * Math.cos(startRad);
      const wireY = rDoubleOuter * Math.sin(startRad);
      const wireInnerX = rOuterBull * Math.cos(startRad);
      const wireInnerY = rOuterBull * Math.sin(startRad);
      elements.push(
        <line
          key={`w-${num}`}
          x1={wireInnerX}
          y1={wireInnerY}
          x2={wireX}
          y2={wireY}
          stroke="#e5e5e5"
          strokeWidth="1.0"
          opacity="0.75"
        />
      );

      // 6. Number ring label around outer perimeter
      const textRadius = 195;
      const textAngleRad = ((index * degPerSector - 90) * Math.PI) / 180;
      const tx = textRadius * Math.cos(textAngleRad);
      const ty = textRadius * Math.sin(textAngleRad) + 5; // vertical centering adjust

      elements.push(
        <text
          key={`num-${num}`}
          x={tx}
          y={ty}
          textAnchor="middle"
          fontSize="16"
          fontWeight="900"
          fontFamily="monospace"
          fill={isSegHighlighted ? '#fbbf24' : '#e5e5e5'}
          className="select-none pointer-events-none"
        >
          {num}
        </text>
      );
    });

    return elements;
  }, [highlightSegment, highlightMultiplier]);

  // Handle Board Click to calculate (x, y) relative to board center
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onBoardClick) return;
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    onBoardClick(Math.round(svgPt.x * 10) / 10, Math.round(svgPt.y * 10) / 10);
  };

  // Reticle coordinates with breathing sway
  const reticleX = aimPoint.x + sway.offsetX;
  const reticleY = aimPoint.y + sway.offsetY;

  return (
    <div className="relative w-full aspect-square max-w-[340px] sm:max-w-[370px] mx-auto select-none touch-none">
      <svg
        viewBox={viewBox}
        onClick={handleClick}
        className="w-full h-full rounded-full shadow-2xl cursor-crosshair transition-all duration-300 drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
      >
        {/* Outer Surround Ring */}
        <circle cx="0" cy="0" r="225" fill="#09090b" stroke="#27272a" strokeWidth="4" />
        {/* Scoring Catch Ring */}
        <circle cx="0" cy="0" r={rDoubleOuter} fill="#000000" stroke="#71717a" strokeWidth="1.5" />

        {/* 20 Clockwise Segments */}
        {sectorElements}

        {/* Outer Bull (Green, 25 points) */}
        <circle
          cx="0"
          cy="0"
          r={rOuterBull}
          fill={highlightSegment === 25 ? '#fbbf24' : '#16a34a'}
          stroke="#e5e5e5"
          strokeWidth="1.2"
        />

        {/* Bullseye (Red, 50 points) */}
        <circle
          cx="0"
          cy="0"
          r={rBullseye}
          fill={highlightSegment === 25 ? '#fbbf24' : '#dc2626'}
          stroke="#ffffff"
          strokeWidth="1.2"
        />

        {/* Concentric Spider Wires */}
        <circle cx="0" cy="0" r={rDoubleOuter} fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
        <circle cx="0" cy="0" r={rDoubleInner} fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
        <circle cx="0" cy="0" r={rTrebleOuter} fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
        <circle cx="0" cy="0" r={rTrebleInner} fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />

        {/* Render Stuck Darts in Board */}
        {stuckDarts.map(dart => {
          // Calculate realistic 3D orientation based on landing angle and pitch
          const yawDeg = dart.landingAngleDeg !== undefined ? dart.landingAngleDeg : -18;
          const pitchDeg = dart.landingPitchDeg !== undefined ? dart.landingPitchDeg : 22;
          const yawRad = ((yawDeg + 110) * Math.PI) / 180;
          const stemLength = 18 * (pitchDeg / 22);
          const tailX = dart.x + Math.cos(yawRad) * stemLength;
          const tailY = dart.y + Math.sin(yawRad) * stemLength;

          // Perpendicular vector for flight fins
          const finLength = 8;
          const perpRad = yawRad + Math.PI / 2;
          const fin1X = tailX + Math.cos(perpRad) * finLength - Math.cos(yawRad) * 4;
          const fin1Y = tailY + Math.sin(perpRad) * finLength - Math.sin(yawRad) * 4;
          const fin2X = tailX - Math.cos(perpRad) * finLength - Math.cos(yawRad) * 4;
          const fin2Y = tailY - Math.sin(perpRad) * finLength - Math.sin(yawRad) * 4;
          const tailEnd = `${tailX - Math.cos(yawRad) * 5},${tailY - Math.sin(yawRad) * 5}`;

          return (
            <g key={dart.id} className="transition-all">
              {/* Dart Shadow */}
              <ellipse
                cx={dart.x + 3}
                cy={dart.y + 7}
                rx="4"
                ry="2.5"
                fill="rgba(0,0,0,0.6)"
              />
              {/* Dart Point entry hole */}
              <circle cx={dart.x} cy={dart.y} r="1.5" fill="#ffffff" />
              {/* Dart Stem & Barrel */}
              <line
                x1={dart.x}
                y1={dart.y}
                x2={tailX}
                y2={tailY}
                stroke="#d4d4d8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Dart Flights (3D Angled Fins) */}
              <polygon
                points={`${tailX},${tailY} ${fin1X},${fin1Y} ${tailEnd}`}
                fill="#f59e0b"
              />
              <polygon
                points={`${tailX},${tailY} ${fin2X},${fin2Y} ${tailEnd}`}
                fill="#d97706"
              />
            {/* Dart Number & Score Badge */}
            <rect
              x={dart.x - 14}
              y={dart.y - 20}
              width="28"
              height="14"
              rx="4"
              fill="#000000"
              stroke="#f59e0b"
              strokeWidth="1.2"
            />
            <text
              x={dart.x}
              y={dart.y - 9}
              textAnchor="middle"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
              fill="#fef08a"
            >
              {dart.label}
            </text>
          </g>
        );
      })}

        {/* Flying Dart Animation */}
        {flyingDartCoord && (
          <g className="pointer-events-none">
            <line
              x1={flyingDartCoord.x}
              y1={flyingDartCoord.y}
              x2={flyingDartCoord.x - 12}
              y2={flyingDartCoord.y + 35}
              stroke="#fbbf24"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <polygon
              points={`${flyingDartCoord.x - 12},${flyingDartCoord.y + 35} ${flyingDartCoord.x - 22},${flyingDartCoord.y + 45} ${flyingDartCoord.x - 8},${flyingDartCoord.y + 48}`}
              fill="#ef4444"
            />
          </g>
        )}

        {/* Aiming Reticle with Breathing Sway & Cardiac Tremor */}
        {!isThrowing && (
          <g className="pointer-events-none transition-transform duration-75">
            {/* Cardiac Heartbeat Pulse Ring under Pressure */}
            {sway.isHighPressure && (
              <circle
                cx={reticleX}
                cy={reticleY}
                r={Math.max(8, sway.amplitude + (sway.heartbeatPulse || 0) * 8)}
                fill="none"
                stroke="#ef4444"
                strokeWidth={1.5 + (sway.heartbeatPulse || 0) * 1.5}
                opacity={0.3 + (sway.heartbeatPulse || 0) * 0.7}
              />
            )}
            {/* Sway Circle Area */}
            <circle
              cx={reticleX}
              cy={reticleY}
              r={Math.max(6, sway.amplitude)}
              fill={sway.isHighPressure ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.08)'}
              stroke={sway.isHighPressure ? '#ef4444' : '#f59e0b'}
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            {/* Precision Crosshair */}
            <circle
              cx={reticleX}
              cy={reticleY}
              r="4"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
            />
            <line
              x1={reticleX - 8}
              y1={reticleY}
              x2={reticleX + 8}
              y2={reticleY}
              stroke="#f59e0b"
              strokeWidth="1.5"
            />
            <line
              x1={reticleX}
              y1={reticleY - 8}
              x2={reticleX}
              y2={reticleY + 8}
              stroke="#f59e0b"
              strokeWidth="1.5"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
