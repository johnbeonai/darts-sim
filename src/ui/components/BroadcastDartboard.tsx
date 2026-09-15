import React, { useMemo } from 'react';
import { DartCoordinates, DartCoordinate } from '../../core/match/DartCoordinates';

export interface BroadcastDartboardProps {
  darts: DartCoordinate[];
  className?: string;
  onBoardClick?: (x: number, y: number) => void;
}

export const BroadcastDartboard: React.FC<BroadcastDartboardProps> = ({ darts, className = '', onBoardClick }) => {
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onBoardClick) return;
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursorPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    onBoardClick(cursorPt.x, cursorPt.y);
  };

  const segments = useMemo(() => {
    const s = [];
    // Generate the 20 pie slices
    for (let i = 0; i < 20; i++) {
      const segmentValue = DartCoordinates.SEGMENT_ORDER[i];
      const centerAngle = DartCoordinates.getSegmentCenterAngle(segmentValue);
      // SVG angles start with 0 at 3 o'clock and go clockwise (positive Y is down)
      // Standard math: 0 is right, 90 is up. 
      // Our DartCoordinates return 90 for top. 
      // In SVG: 90 math degrees = -90 SVG degrees.
      const startAngle = (360 - (centerAngle + 9)) % 360; 
      const endAngle = (360 - (centerAngle - 9)) % 360;

      const isEven = i % 2 === 0;
      const singleColor = isEven ? '#1a1a1a' : '#f0e6d2';
      const multiplierColor = isEven ? '#e53935' : '#43a047';

      s.push({
        segmentValue,
        startAngle,
        endAngle,
        singleColor,
        multiplierColor
      });
    }
    return s;
  }, []);

  const createWedge = (rInner: number, rOuter: number, startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = 60 + rInner * Math.cos(startRad);
    const y1 = 60 + rInner * Math.sin(startRad);
    const x2 = 60 + rOuter * Math.cos(startRad);
    const y2 = 60 + rOuter * Math.sin(startRad);
    const x3 = 60 + rOuter * Math.cos(endRad);
    const y3 = 60 + rOuter * Math.sin(endRad);
    const x4 = 60 + rInner * Math.cos(endRad);
    const y4 = 60 + rInner * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} L ${x2} ${y2} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x1} ${y1} Z`;
  };

  return (
    <div className={`relative w-full max-w-[400px] aspect-square ${className}`}>
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-2xl"
        onClick={handleSvgClick}
        style={{ cursor: onBoardClick ? 'crosshair' : 'default' }}
      >
        {/* Background / Outer Ring */}
        <circle cx="60" cy="60" r="60" fill="#0a0a0a" stroke="#222" strokeWidth="0.5" />
        
        {/* Wires container (drawn implicitly by paths having stroke) */}
        <g stroke="#cfcfcf" strokeWidth="0.2" strokeLinejoin="round">
          {segments.map((seg, i) => (
            <g key={`seg-${i}`}>
              {/* Outer Single */}
              <path
                d={createWedge(DartCoordinates.R_TREBLE_OUTER, DartCoordinates.R_DOUBLE_INNER, seg.startAngle, seg.endAngle)}
                fill={seg.singleColor}
              />
              {/* Inner Single */}
              <path
                d={createWedge(DartCoordinates.R_OUTER_BULL, DartCoordinates.R_TREBLE_INNER, seg.startAngle, seg.endAngle)}
                fill={seg.singleColor}
              />
              {/* Double Ring */}
              <path
                d={createWedge(DartCoordinates.R_DOUBLE_INNER, DartCoordinates.R_DOUBLE_OUTER, seg.startAngle, seg.endAngle)}
                fill={seg.multiplierColor}
              />
              {/* Treble Ring */}
              <path
                d={createWedge(DartCoordinates.R_TREBLE_INNER, DartCoordinates.R_TREBLE_OUTER, seg.startAngle, seg.endAngle)}
                fill={seg.multiplierColor}
              />
            </g>
          ))}
          
          {/* Outer Bull */}
          <circle cx="60" cy="60" r={DartCoordinates.R_OUTER_BULL} fill="#43a047" />
          {/* Inner Bull */}
          <circle cx="60" cy="60" r={DartCoordinates.R_INNER_BULL} fill="#e53935" />
        </g>

        {/* Number Ring Texts */}
        <g fill="#fff" fontSize="6" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" dominantBaseline="central">
          {segments.map((seg, i) => {
            const angleRad = ((seg.startAngle + 9) * Math.PI) / 180;
            const r = 55; // Place text between R=50 and R=60
            const x = 60 + r * Math.cos(angleRad);
            const y = 60 + r * Math.sin(angleRad);
            
            // To make text upright, we just draw it at the coordinate
            return (
              <text key={`text-${i}`} x={x} y={y}>
                {seg.segmentValue}
              </text>
            );
          })}
        </g>
      </svg>
      
      {/* Absolute positioning for darts to allow CSS transitions */}
      {darts.map((dart, i) => (
        <div
          key={`dart-${i}`}
          className="absolute z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
          style={{
            // Convert coordinate out of 120 down to % out of 100
            left: `${(dart.x / 120) * 100}%`,
            top: `${(dart.y / 120) * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: '14px',
            height: '14px',
            animation: `bounce-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both ${i * 0.15}s`
          }}
        >
          {/* Simple Dart Marker */}
          <div className="w-full h-full relative">
            <div className="absolute inset-0 rounded-full border-[1.5px] border-white/60 shadow-inner bg-gradient-to-br from-amber-400 to-amber-700" />
            <div className="absolute left-[3px] top-[3px] w-[2px] h-[2px] rounded-full bg-white/90" />
          </div>
        </div>
      ))}
    </div>
  );
};
