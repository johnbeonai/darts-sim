import { DartResult } from './DartResult';

export interface DartCoordinate {
  x: number; // 0 to 100, where 50 is center
  y: number; // 0 to 100, where 50 is center
}

export class DartCoordinates {
  // Clockwise from top (20)
  public static readonly SEGMENT_ORDER = [
    20, 1, 18, 4, 13, 6, 10, 15, 2, 17,
    3, 19, 7, 16, 8, 11, 14, 9, 12, 5
  ];

  // SVG Coordinate System: 0 to 120, center at 60,60
  public static readonly CENTER_X = 60;
  public static readonly CENTER_Y = 60;

  // Radii scaled for 0-50 radius
  public static readonly R_INNER_BULL = 2.2;
  public static readonly R_OUTER_BULL = 5.3;
  public static readonly R_TREBLE_INNER = 26.5;
  public static readonly R_TREBLE_OUTER = 30.0;
  public static readonly R_DOUBLE_INNER = 46.5;
  public static readonly R_DOUBLE_OUTER = 50.0;

  /**
   * Generates a realistic landing coordinate for a thrown dart based on the result.
   */
  public static getCoordinateForDart(dart: DartResult): DartCoordinate {
    if (dart.segment === 0) {
      // Missed board completely (outside double ring)
      return this.getRandomCoordinate(this.R_DOUBLE_OUTER + 2, this.R_DOUBLE_OUTER + 10, 0, 360);
    }

    if (dart.segment === 25) {
      if (dart.multiplier === 2) {
        // Inner Bull
        return this.getRandomCoordinate(0, this.R_INNER_BULL * 0.9, 0, 360);
      } else {
        // Outer Bull
        return this.getRandomCoordinate(this.R_INNER_BULL * 1.1, this.R_OUTER_BULL * 0.9, 0, 360);
      }
    }

    const angleDeg = this.getSegmentCenterAngle(dart.segment);
    // Segment width is 18 degrees, so -8 to +8 degrees of variance safely inside
    const minAngle = angleDeg - 8;
    const maxAngle = angleDeg + 8;

    let minR = 0;
    let maxR = 0;

    switch (dart.multiplier) {
      case 3:
        minR = this.R_TREBLE_INNER + 0.3;
        maxR = this.R_TREBLE_OUTER - 0.3;
        break;
      case 2:
        minR = this.R_DOUBLE_INNER + 0.3;
        maxR = this.R_DOUBLE_OUTER - 0.3;
        break;
      case 1:
      default:
        // Could be large single (between outer bull and treble) or small single (between treble and double)
        // 50% chance for each, unless we know it's a specific aimed dart, but we just randomize for visual flair
        const isOuterSingle = Math.random() > 0.5;
        if (isOuterSingle) {
          minR = this.R_TREBLE_OUTER + 1;
          maxR = this.R_DOUBLE_INNER - 1;
        } else {
          minR = this.R_OUTER_BULL + 1;
          maxR = this.R_TREBLE_INNER - 1;
        }
        break;
    }

    return this.getRandomCoordinate(minR, maxR, minAngle, maxAngle);
  }

  /**
   * Returns the center angle of a segment in standard math degrees (0 = right, 90 = up)
   */
  public static getSegmentCenterAngle(segment: number): number {
    const idx = this.SEGMENT_ORDER.indexOf(segment);
    if (idx === -1) return 90; // Default to 20 if invalid
    
    // Top is 90 degrees
    // Each segment is 18 degrees
    // Clockwise means subtracting angle
    let angle = 90 - (idx * 18);
    if (angle < 0) angle += 360;
    return angle;
  }

  public static getDartFromCoordinate(x: number, y: number): DartResult {
    // Reverse math: 
    // SVG origin is top-left. Center is CENTER_X, CENTER_Y (60, 60).
    const dx = x - this.CENTER_X;
    const dy = this.CENTER_Y - y; // Math positive Y is up

    const r = Math.sqrt(dx * dx + dy * dy);
    
    // Check if off board
    if (r > this.R_DOUBLE_OUTER) return new DartResult('player', 0, 1);

    // Check Bulls
    if (r <= this.R_INNER_BULL) return new DartResult('player', 25, 2);
    if (r <= this.R_OUTER_BULL) return new DartResult('player', 25, 1);

    // Calculate angle in degrees (math standard: 0 is right, 90 is up)
    let angleRad = Math.atan2(dy, dx);
    if (angleRad < 0) angleRad += 2 * Math.PI;
    const angleDeg = angleRad * (180 / Math.PI);

    // Find segment
    // Segment 20 center is 90 deg. It spans 81 to 99.
    let segment = 20;
    for (let i = 0; i < 20; i++) {
      const segVal = this.SEGMENT_ORDER[i];
      const center = this.getSegmentCenterAngle(segVal);
      // Normalize to 0-360
      const diff = Math.abs((angleDeg - center + 180 + 360) % 360 - 180);
      if (diff <= 9) {
        segment = segVal;
        break;
      }
    }

    // Find multiplier
    let multiplier = 1;
    if (r >= this.R_TREBLE_INNER && r <= this.R_TREBLE_OUTER) {
      multiplier = 3;
    } else if (r >= this.R_DOUBLE_INNER && r <= this.R_DOUBLE_OUTER) {
      multiplier = 2;
    }

    return new DartResult('player', segment, multiplier as 1 | 2 | 3);
  }

  private static getRandomCoordinate(minR: number, maxR: number, minAngleDeg: number, maxAngleDeg: number): DartCoordinate {
    const r = minR + Math.random() * (maxR - minR);
    const angleDeg = minAngleDeg + Math.random() * (maxAngleDeg - minAngleDeg);
    
    // Convert to radians
    const angleRad = angleDeg * (Math.PI / 180);

    // Calculate x and y relative to center (0,0)
    const x = r * Math.cos(angleRad);
    const y = r * Math.sin(angleRad); // In standard math, +y is up

    // Map to SVG coordinates: +y is down in SVG, so we subtract y from CENTER_Y
    return {
      x: this.CENTER_X + x,
      y: this.CENTER_Y - y
    };
  }
}
