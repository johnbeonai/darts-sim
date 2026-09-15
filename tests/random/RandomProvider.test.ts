import { describe, it, expect } from 'vitest';
import { SeededRandomProvider } from '../../src/core/random/RandomProvider';

describe('SeededRandomProvider', () => {
  it('produces repeatable sequences from identical seed', () => {
    const rng1 = new SeededRandomProvider(42);
    const rng2 = new SeededRandomProvider(42);

    const seq1 = [rng1.next(), rng1.next(), rng1.nextInt(1, 100), rng1.nextGaussian()];
    const seq2 = [rng2.next(), rng2.next(), rng2.nextInt(1, 100), rng2.nextGaussian()];

    expect(seq1).toEqual(seq2);
  });

  it('generates integers within specified bounds', () => {
    const rng = new SeededRandomProvider(999);
    for (let i = 0; i < 100; i++) {
      const val = rng.nextInt(1, 20);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(20);
    }
  });

  it('respects weighted pick distribution', () => {
    const rng = new SeededRandomProvider(100);
    const items = ['A', 'B'];
    const weights = [9, 1]; // A has 90% chance
    let countA = 0;
    for (let i = 0; i < 1000; i++) {
      if (rng.weightedPick(items, weights) === 'A') countA++;
    }
    expect(countA).toBeGreaterThan(800);
  });
});
