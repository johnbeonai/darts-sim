import { describe, it, expect } from 'vitest';
import { Visit } from '../../src/core/match/Visit';
import { DartResult } from '../../src/core/match/DartResult';

describe('Visit & Bust Rules', () => {
  it('calculates standard 3-dart scoring correctly (180)', () => {
    const visit = new Visit('p1', 501);
    visit.addDart(DartResult.fromLabel('T20'));
    visit.addDart(DartResult.fromLabel('T20'));
    visit.addDart(DartResult.fromLabel('T20'));

    expect(visit.visitScore).toBe(180);
    expect(visit.scoreAfter).toBe(321);
    expect(visit.isBust).toBe(false);
    expect(visit.isCompleted).toBe(true);
  });

  it('detects bust when remaining score is exceeded', () => {
    const visit = new Visit('p1', 40);
    visit.addDart(DartResult.fromLabel('T20')); // 60 > 40 => BUST

    expect(visit.isBust).toBe(true);
    expect(visit.bustReason).toBe('exceeded');
    expect(visit.scoreAfter).toBe(40); // resets
    expect(visit.visitScore).toBe(0);
    expect(visit.isCompleted).toBe(true);
  });

  it('detects bust when 1 is left on double-out', () => {
    const visit = new Visit('p1', 21);
    visit.addDart(DartResult.fromLabel('20')); // Leaves 1 => BUST

    expect(visit.isBust).toBe(true);
    expect(visit.bustReason).toBe('left_one');
    expect(visit.scoreAfter).toBe(21);
    expect(visit.visitScore).toBe(0);
  });

  it('detects bust when 0 is reached on a single (no double)', () => {
    const visit = new Visit('p1', 20);
    visit.addDart(DartResult.fromLabel('20')); // Hit S20 to reach 0 => BUST

    expect(visit.isBust).toBe(true);
    expect(visit.bustReason).toBe('no_double');
    expect(visit.scoreAfter).toBe(20);
  });

  it('recognizes valid double checkout', () => {
    const visit = new Visit('p1', 40);
    visit.addDart(DartResult.fromLabel('D20'));

    expect(visit.isBust).toBe(false);
    expect(visit.isLegWinning).toBe(true);
    expect(visit.scoreAfter).toBe(0);
    expect(visit.visitScore).toBe(40);
  });

  it('recognizes valid Bullseye checkout (50)', () => {
    const visit = new Visit('p1', 50);
    visit.addDart(DartResult.fromLabel('D-Bull'));

    expect(visit.isLegWinning).toBe(true);
    expect(visit.scoreAfter).toBe(0);
  });
});
