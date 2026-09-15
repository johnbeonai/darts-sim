/**
 * Core Dart Model
 * Represents a single thrown dart in accordance with Technical Blueprint Section 17.
 */

export type DartSource = 'statistical' | 'manual' | 'camera';

export interface IDartResult {
  readonly playerId: string;
  readonly segment: number; // 0 (miss), 1-20, 25 (outer bull/bull)
  readonly multiplier: 1 | 2 | 3; // 1: single, 2: double, 3: treble
  readonly score: number; // segment * multiplier (e.g., 20 * 3 = 60, 25 * 2 = 50)
  readonly isMiss: boolean;
  readonly isDouble: boolean;
  readonly isTreble: boolean;
  readonly isBull: boolean; // 25 or 50
  readonly isInnerBull: boolean; // 50 (double bull)
  readonly source: DartSource;
  readonly confirmed: boolean;
  readonly label: string; // e.g. "T20", "D16", "S20", "Bull", "Miss"
}

export class DartResult implements IDartResult {
  public readonly score: number;
  public readonly isMiss: boolean;
  public readonly isDouble: boolean;
  public readonly isTreble: boolean;
  public readonly isBull: boolean;
  public readonly isInnerBull: boolean;
  public readonly label: string;

  constructor(
    public readonly playerId: string,
    public readonly segment: number,
    public readonly multiplier: 1 | 2 | 3 = 1,
    public readonly source: DartSource = 'manual',
    public readonly confirmed: boolean = true
  ) {
    if (segment < 0 || segment > 25 || (segment > 20 && segment !== 25)) {
      throw new Error(`Invalid dart segment: ${segment}. Must be 0-20 or 25.`);
    }

    if (segment === 0) {
      this.score = 0;
      this.isMiss = true;
      this.isDouble = false;
      this.isTreble = false;
      this.isBull = false;
      this.isInnerBull = false;
      this.label = 'Miss';
    } else if (segment === 25) {
      if (multiplier === 3) {
        throw new Error('Bull cannot have a treble multiplier.');
      }
      this.isMiss = false;
      this.isDouble = multiplier === 2;
      this.isTreble = false;
      this.isBull = true;
      this.isInnerBull = multiplier === 2;
      this.score = segment * multiplier; // 25 or 50
      this.label = multiplier === 2 ? 'D-Bull' : 'Bull';
    } else {
      this.score = segment * multiplier;
      this.isMiss = false;
      this.isDouble = multiplier === 2;
      this.isTreble = multiplier === 3;
      this.isBull = false;
      this.isInnerBull = false;

      const prefix = multiplier === 3 ? 'T' : multiplier === 2 ? 'D' : 'S';
      this.label = `${prefix}${segment}`;
    }
  }

  /**
   * Helper to parse string representation (e.g. "T20", "D16", "20", "Bull", "0", "Miss")
   */
  public static fromLabel(
    label: string,
    playerId: string = 'player',
    source: DartSource = 'manual',
    confirmed: boolean = true
  ): DartResult {
    const clean = label.trim().toUpperCase();

    if (clean === 'MISS' || clean === '0' || clean === 'M') {
      return new DartResult(playerId, 0, 1, source, confirmed);
    }

    if (clean === 'BULL' || clean === '25' || clean === 'SBULL' || clean === 'S25') {
      return new DartResult(playerId, 25, 1, source, confirmed);
    }

    if (clean === 'DBULL' || clean === 'D-BULL' || clean === '50' || clean === 'D25' || clean === 'BULLSEYE') {
      return new DartResult(playerId, 25, 2, source, confirmed);
    }

    let multiplier: 1 | 2 | 3 = 1;
    let segStr = clean;

    if (clean.startsWith('T')) {
      multiplier = 3;
      segStr = clean.substring(1);
    } else if (clean.startsWith('D')) {
      multiplier = 2;
      segStr = clean.substring(1);
    } else if (clean.startsWith('S')) {
      multiplier = 1;
      segStr = clean.substring(1);
    }

    const seg = parseInt(segStr, 10);
    if (isNaN(seg) || seg < 1 || seg > 20) {
      throw new Error(`Cannot parse dart label: "${label}"`);
    }

    return new DartResult(playerId, seg, multiplier, source, confirmed);
  }

  public static miss(playerId: string = 'player', source: DartSource = 'manual'): DartResult {
    return new DartResult(playerId, 0, 1, source, true);
  }
}
