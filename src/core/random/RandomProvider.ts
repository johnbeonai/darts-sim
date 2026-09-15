/**
 * Deterministic Randomness System
 * In accordance with Technical Blueprint Section 72.
 * Supports seeded pseudo-random generation for testing, and standard runtime randomness.
 */

export interface IRandomProvider {
  next(): number; // [0, 1)
  nextInt(min: number, max: number): number; // [min, max] inclusive
  nextFloat(min: number, max: number): number;
  chance(probability: number): boolean; // probability in [0, 1]
  pickOne<T>(items: T[]): T;
  weightedPick<T>(items: T[], weights: number[]): T;
  nextGaussian(mean?: number, stdDev?: number): number;
}

export class DefaultRandomProvider implements IRandomProvider {
  public next(): number {
    return Math.random();
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public nextFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  public chance(probability: number): boolean {
    return Math.random() < probability;
  }

  public pickOne<T>(items: T[]): T {
    if (items.length === 0) throw new Error('Cannot pick from empty array');
    return items[Math.floor(Math.random() * items.length)];
  }

  public weightedPick<T>(items: T[], weights: number[]): T {
    if (items.length !== weights.length || items.length === 0) {
      throw new Error('Items and weights must have matching non-zero lengths');
    }
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  public nextGaussian(mean: number = 0, stdDev: number = 1): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdDev + mean;
  }
}

/**
 * Seeded PRNG using Mulberry32 algorithm.
 * Deterministic and reproducible for automated tests and replayability.
 */
export class SeededRandomProvider implements IRandomProvider {
  private s: number;

  constructor(seed: number = 123456789) {
    this.s = seed >>> 0;
  }

  public next(): number {
    this.s = (this.s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  public nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  public chance(probability: number): boolean {
    return this.next() < probability;
  }

  public pickOne<T>(items: T[]): T {
    if (items.length === 0) throw new Error('Cannot pick from empty array');
    return items[Math.floor(this.next() * items.length)];
  }

  public weightedPick<T>(items: T[], weights: number[]): T {
    if (items.length !== weights.length || items.length === 0) {
      throw new Error('Items and weights must have matching non-zero lengths');
    }
    const total = weights.reduce((a, b) => a + b, 0);
    let r = this.next() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  public nextGaussian(mean: number = 0, stdDev: number = 1): number {
    let u = 0, v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdDev + mean;
  }
}
