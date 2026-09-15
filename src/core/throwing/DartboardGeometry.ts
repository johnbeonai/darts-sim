import { DartResult } from '../match/DartResult';

export interface DartboardHitResult {
  readonly dart: DartResult;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly angleDeg: number;
  readonly segment: number;
  readonly multiplier: 1 | 2 | 3;
  readonly isWire: boolean;
  readonly wireProximityMm: number;
  readonly landingAngleDeg?: number; // Entry yaw angle in degrees (-30° to +30°)
  readonly landingPitchDeg?: number; // Entry pitch angle in degrees (10° to 35°)
}

export interface TargetCoordinate {
  readonly segment: number;
  readonly multiplier: 1 | 2 | 3;
  readonly x: number;
  readonly y: number;
  readonly label: string;
}

export class DartboardGeometry {
  // Authentic World Darts Federation / PDC regulation board dimensions in millimeters
  public static readonly DOUBLE_BULL_RADIUS = 6.35; // 12.7mm diameter
  public static readonly OUTER_BULL_RADIUS = 15.9; // 31.8mm diameter
  public static readonly INNER_SINGLE_MIN = 15.9;
  public static readonly TREBLE_INNER_RADIUS = 97.0;
  public static readonly TREBLE_OUTER_RADIUS = 107.0; // 10mm treble band
  public static readonly OUTER_SINGLE_MIN = 107.0;
  public static readonly DOUBLE_INNER_RADIUS = 160.0;
  public static readonly DOUBLE_OUTER_RADIUS = 170.0; // 10mm double band
  public static readonly SCORING_RADIUS = 170.0;
  public static readonly NUMBER_RING_RADIUS = 200.0;
  public static readonly BOARD_OUTER_RADIUS = 225.0;

  // 20 Clockwise Segments starting at Top (20)
  public static readonly SECTOR_ORDER: number[] = [
    20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
  ];

  public static readonly SECTOR_DEGREES = 360 / 20; // 18 degrees per sector

  /**
   * Resolves SVG board coordinate (x, y) with center at (0, 0) to a DartResult
   * In standard SVG, +x is Right and +y is Down.
   */
  public static resolveCoordinate(
    x: number,
    y: number,
    playerId: string = 'player',
    landingAngleDeg?: number,
    landingPitchDeg?: number
  ): DartboardHitResult {
    const radius = Math.sqrt(x * x + y * y);

    // Calculate angle clockwise from top (0 deg at x=0, y=-radius)
    // atan2(y, x) returns -180..+180 where y=-1, x=0 is -90 deg.
    const rad = Math.atan2(y, x);
    const deg = (rad * 180) / Math.PI; // -180..180
    const clockwiseFromTop = (deg + 90 + 360) % 360; // 0..360 where 0 is top

    // Sector calculation: sector 20 is centered at 0 deg (-9 deg to +9 deg)
    const shifted = (clockwiseFromTop + DartboardGeometry.SECTOR_DEGREES / 2) % 360;
    const sectorIndex = Math.floor(shifted / DartboardGeometry.SECTOR_DEGREES);
    const segment = DartboardGeometry.SECTOR_ORDER[sectorIndex % 20];

    let multiplier: 1 | 2 | 3 = 1;
    let finalSegment = segment;
    let isWire = false;
    let minWireDist = 999;

    // Radius band checks
    if (radius <= DartboardGeometry.DOUBLE_BULL_RADIUS) {
      // Bullseye (Double Bull, 50 pts)
      finalSegment = 25;
      multiplier = 2;
      minWireDist = Math.abs(radius - DartboardGeometry.DOUBLE_BULL_RADIUS);
    } else if (radius <= DartboardGeometry.OUTER_BULL_RADIUS) {
      // Outer Bull (25 pts)
      finalSegment = 25;
      multiplier = 1;
      minWireDist = Math.min(
        Math.abs(radius - DartboardGeometry.DOUBLE_BULL_RADIUS),
        Math.abs(radius - DartboardGeometry.OUTER_BULL_RADIUS)
      );
    } else if (radius > DartboardGeometry.DOUBLE_OUTER_RADIUS) {
      // Miss outside the double ring
      finalSegment = 0;
      multiplier = 1;
      minWireDist = radius - DartboardGeometry.DOUBLE_OUTER_RADIUS;
    } else {
      // In 1..20 sectors
      if (
        radius >= DartboardGeometry.TREBLE_INNER_RADIUS &&
        radius <= DartboardGeometry.TREBLE_OUTER_RADIUS
      ) {
        multiplier = 3;
        minWireDist = Math.min(
          Math.abs(radius - DartboardGeometry.TREBLE_INNER_RADIUS),
          Math.abs(radius - DartboardGeometry.TREBLE_OUTER_RADIUS)
        );
      } else if (
        radius >= DartboardGeometry.DOUBLE_INNER_RADIUS &&
        radius <= DartboardGeometry.DOUBLE_OUTER_RADIUS
      ) {
        multiplier = 2;
        minWireDist = Math.min(
          Math.abs(radius - DartboardGeometry.DOUBLE_INNER_RADIUS),
          Math.abs(radius - DartboardGeometry.DOUBLE_OUTER_RADIUS)
        );
      } else {
        multiplier = 1;
        minWireDist = Math.min(
          Math.abs(radius - DartboardGeometry.OUTER_BULL_RADIUS),
          Math.abs(radius - DartboardGeometry.TREBLE_INNER_RADIUS),
          Math.abs(radius - DartboardGeometry.TREBLE_OUTER_RADIUS),
          Math.abs(radius - DartboardGeometry.DOUBLE_INNER_RADIUS),
          Math.abs(radius - DartboardGeometry.DOUBLE_OUTER_RADIUS)
        );
      }
    }

    // Check angular wire proximity (distance to radial boundary)
    const angleInsideSector = shifted % DartboardGeometry.SECTOR_DEGREES;
    const distToRadialBoundaryDeg = Math.min(
      angleInsideSector,
      DartboardGeometry.SECTOR_DEGREES - angleInsideSector
    );
    // Convert angle delta to arc distance in mm: s = r * theta_rad
    const radialWireDistMm = radius * ((distToRadialBoundaryDeg * Math.PI) / 180);
    const overallWireProximity = Math.min(minWireDist, radialWireDistMm);

    // If within 1.2mm of a wire, flag as wire proximity
    if (overallWireProximity < 1.2 && finalSegment > 0) {
      isWire = true;
    }

    const dart =
      finalSegment === 0
        ? DartResult.miss(playerId, 'manual')
        : new DartResult(playerId, finalSegment, multiplier, 'manual', true);

    return {
      dart,
      x,
      y,
      radius,
      angleDeg: clockwiseFromTop,
      segment: finalSegment,
      multiplier,
      isWire,
      wireProximityMm: Math.round(overallWireProximity * 10) / 10,
      landingAngleDeg: landingAngleDeg !== undefined ? Math.round(landingAngleDeg * 10) / 10 : undefined,
      landingPitchDeg: landingPitchDeg !== undefined ? Math.round(landingPitchDeg * 10) / 10 : undefined,
    };
  }

  /**
   * Retrieves ideal center coordinate (x, y) for aiming at any segment & multiplier
   */
  public static getTargetCoordinates(
    segment: number,
    multiplier: 1 | 2 | 3 = 1
  ): TargetCoordinate {
    if (segment === 25) {
      if (multiplier === 2) {
        return { segment: 25, multiplier: 2, x: 0, y: 0, label: 'D-BULL' };
      }
      return { segment: 25, multiplier: 1, x: 0, y: -11.0, label: 'BULL' };
    }

    if (segment === 0) {
      return { segment: 0, multiplier: 1, x: 0, y: 190, label: 'MISS' };
    }

    const sectorIdx = DartboardGeometry.SECTOR_ORDER.indexOf(segment);
    if (sectorIdx === -1) {
      throw new Error(`Invalid segment: ${segment}`);
    }

    // Angle clockwise from top
    const angleClockwise = sectorIdx * DartboardGeometry.SECTOR_DEGREES;
    // Standard trig angle: top is -90 deg (-PI/2)
    const rad = ((angleClockwise - 90) * Math.PI) / 180;

    let r = 133.5; // Outer single center
    let label = `S${segment}`;

    if (multiplier === 3) {
      r = (DartboardGeometry.TREBLE_INNER_RADIUS + DartboardGeometry.TREBLE_OUTER_RADIUS) / 2; // 102mm
      label = `T${segment}`;
    } else if (multiplier === 2) {
      r = (DartboardGeometry.DOUBLE_INNER_RADIUS + DartboardGeometry.DOUBLE_OUTER_RADIUS) / 2; // 165mm
      label = `D${segment}`;
    } else {
      r = 133.5;
    }

    const x = Math.round(r * Math.cos(rad) * 10) / 10;
    const y = Math.round(r * Math.sin(rad) * 10) / 10;

    return { segment, multiplier, x, y, label };
  }
}
