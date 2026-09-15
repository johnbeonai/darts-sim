export interface FlickShotRecord {
  points: { x: number; y: number }[];
  quality: 'green' | 'amber' | 'red';
  badgeText: string;
  subText: string;
  deflectionDeg: number;
  speed: number;
}

export const evaluateShotQuality = (
  dx: number,
  dy: number,
  durationMs: number,
  points: { x: number; y: number }[]
): FlickShotRecord => {
  // Upward flicking in screen space: endY < startY, so upward displacement is -dy
  const upwardDy = -dy;
  const deflectionDeg = Math.atan2(dx, upwardDy) * (180 / Math.PI);
  const absDef = Math.abs(deflectionDeg);
  const speed = Math.hypot(dx, dy) / Math.max(1, durationMs);

  let quality: 'green' | 'amber' | 'red';
  let badgeText: string;
  let subText: string;

  if (absDef <= 2.0 && speed >= 0.65 && speed <= 2.8) {
    quality = 'green';
    badgeText = '🟢 EXCELLENT SHOT';
    subText = `True vertical (${absDef.toFixed(1)}°) • Tempo ${speed.toFixed(2)} px/ms`;
  } else if (absDef <= 4.5 && speed >= 0.4 && speed <= 3.8) {
    quality = 'amber';
    badgeText = '🟡 GOOD SHOT';
    subText = `${deflectionDeg > 0 ? 'Veered Right' : 'Veered Left'} (+${absDef.toFixed(1)}°) • Tempo ${speed.toFixed(2)} px/ms`;
  } else {
    quality = 'red';
    badgeText = '🔴 BAD SHOT';
    subText = absDef > 4.5
      ? `Severe Veer (${deflectionDeg > 0 ? '+' : ''}${deflectionDeg.toFixed(1)}°) • Drift Penalty!`
      : `Speed Fault (${speed.toFixed(2)} px/ms) • Loss of Control`;
  }

  return {
    points,
    quality,
    badgeText,
    subText,
    deflectionDeg,
    speed,
  };
};
