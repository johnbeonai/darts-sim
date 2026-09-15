import { describe, it, expect } from 'vitest';
import { DartResult } from '../../src/core/match/DartResult';

describe('DartResult', () => {
  it('creates valid single darts', () => {
    const dart = new DartResult('p1', 20, 1);
    expect(dart.score).toBe(20);
    expect(dart.isDouble).toBe(false);
    expect(dart.isTreble).toBe(false);
    expect(dart.isMiss).toBe(false);
    expect(dart.label).toBe('S20');
  });

  it('creates valid treble and double darts', () => {
    const t20 = new DartResult('p1', 20, 3);
    expect(t20.score).toBe(60);
    expect(t20.isTreble).toBe(true);
    expect(t20.label).toBe('T20');

    const d16 = new DartResult('p1', 16, 2);
    expect(d16.score).toBe(32);
    expect(d16.isDouble).toBe(true);
    expect(d16.label).toBe('D16');
  });

  it('handles outer bull (25) and inner double bull (50)', () => {
    const outer = new DartResult('p1', 25, 1);
    expect(outer.score).toBe(25);
    expect(outer.isBull).toBe(true);
    expect(outer.isDouble).toBe(false);
    expect(outer.label).toBe('Bull');

    const inner = new DartResult('p1', 25, 2);
    expect(inner.score).toBe(50);
    expect(inner.isBull).toBe(true);
    expect(inner.isDouble).toBe(true);
    expect(inner.isInnerBull).toBe(true);
    expect(inner.label).toBe('D-Bull');
  });

  it('handles misses', () => {
    const miss = new DartResult('p1', 0, 1);
    expect(miss.score).toBe(0);
    expect(miss.isMiss).toBe(true);
    expect(miss.label).toBe('Miss');
  });

  it('parses labels correctly', () => {
    expect(DartResult.fromLabel('T20').score).toBe(60);
    expect(DartResult.fromLabel('D20').score).toBe(40);
    expect(DartResult.fromLabel('20').score).toBe(20);
    expect(DartResult.fromLabel('Bull').score).toBe(25);
    expect(DartResult.fromLabel('D-Bull').score).toBe(50);
    expect(DartResult.fromLabel('Miss').score).toBe(0);
  });
});
