import { describe, it, expect } from 'vitest';
import { Visit } from '../../src/core/match/Visit';
import { Leg } from '../../src/core/match/Leg';
import { Match, MatchFormat } from '../../src/core/match/Match';
import { CareerManager } from '../../src/core/career/CareerManager';
import { SaveManager } from '../../src/storage/SaveManager';
import { Player } from '../../src/core/player/Player';

describe('Darts 501 Checkout Rules', () => {
  it('prevents 180 from winning a leg and marks it as bust (no double)', () => {
    // Score before: 180, total scored: 180 -> remaining would be 0, but 180 is not a double finish
    const visit = Visit.fromTotal('player1', 180, 180, 3, true);
    expect(visit.isBust).toBe(true);
    expect(visit.bustReason).toBe('no_double');
    expect(visit.isLegWinning).toBe(false);
    expect(visit.scoreAfter).toBe(180); // Score remains 180 after bust
  });

  it('prevents bogey numbers (e.g. 169, 168, 166, 165, 163, 162, 159) from checking out', () => {
    const bogeyNumbers = [169, 168, 166, 165, 163, 162, 159];
    for (const bogey of bogeyNumbers) {
      const visit = Visit.fromTotal('player1', bogey, bogey, 3, true);
      expect(visit.isBust).toBe(true);
      expect(visit.bustReason).toBe('no_double');
      expect(visit.isLegWinning).toBe(false);
      expect(visit.scoreAfter).toBe(bogey);
    }
  });

  it('allows valid checkout (e.g. 170 The Big Fish, 160, 40)', () => {
    const validCheckouts = [170, 160, 100, 40, 32, 2];
    for (const co of validCheckouts) {
      const visit = Visit.fromTotal('player1', co, co, 3, true);
      expect(visit.isBust).toBe(false);
      expect(visit.isLegWinning).toBe(true);
      expect(visit.scoreAfter).toBe(0);
    }
  });

  it('correctly tracks highestVisit as 180 while highestCheckout is 0 or actual finish <= 170', () => {
    const leg = new Leg('leg-1', ['p1', 'p2'], 'p1', 501, true);
    
    // p1 throws 180: score goes 501 -> 321
    const v1 = Visit.fromTotal('p1', 501, 180, 3, true);
    leg.addVisit(v1);

    // p2 throws 60
    const v2 = Visit.fromTotal('p2', 501, 60, 3, true);
    leg.addVisit(v2);

    // p1 throws 180: score goes 321 -> 141
    const v3 = Visit.fromTotal('p1', 321, 180, 3, true);
    leg.addVisit(v3);

    // p2 throws 60
    const v4 = Visit.fromTotal('p2', 441, 60, 3, true);
    leg.addVisit(v4);

    // p1 checks out 141: score goes 141 -> 0
    const v5 = Visit.fromTotal('p1', 141, 141, 3, true);
    leg.addVisit(v5);

    const p1Stats = leg.getPlayerStats('p1');
    expect(p1Stats.highestVisit).toBe(180);
    expect(p1Stats.highestCheckout).toBe(141);
  });

  it('CareerManager.recordMatchStats records highestCheckout up to 170 and never 180', () => {
    const p1 = new Player('p1', 'Test Player', 'male', 'England', 25);
    const cm = new CareerManager(p1);
    expect(cm.player.stats.highestCheckout).toBe(0);

    const format: MatchFormat = { type: 'legs', bestOfLegs: 1, startingScore: 501, doubleOutRequired: true };
    const match = new Match('match-1', [p1.id, 'cpu'], format);

    // Simulate match with a 180 visit and a 100 checkout
    const leg = match.currentLeg;
    leg.addVisit(Visit.fromTotal(p1.id, 501, 180, 3, true));
    leg.addVisit(Visit.fromTotal('cpu', 501, 60, 3, true));
    leg.addVisit(Visit.fromTotal(p1.id, 321, 180, 3, true));
    leg.addVisit(Visit.fromTotal('cpu', 441, 60, 3, true));
    leg.addVisit(Visit.fromTotal(p1.id, 141, 41, 3, true));
    leg.addVisit(Visit.fromTotal('cpu', 381, 60, 3, true));
    leg.addVisit(Visit.fromTotal(p1.id, 100, 100, 3, true)); // Leg winning checkout 100

    cm.recordMatchStats(match, p1.id);

    expect(p1.stats.highestCheckout).toBe(100);
    expect(p1.stats.highestCheckout).toBeLessThanOrEqual(170);
  });

  it('SaveManager automatically sanitizes corrupted legacy saves where highestCheckout > 170', () => {
    const p1 = new Player('p1', 'Corrupted Player', 'male', 'England', 25);
    const cm = new CareerManager(p1);
    // Force a corrupted value
    (p1.stats as any).highestCheckout = 180;

    SaveManager.saveGame(1, cm);
    const restored = SaveManager.loadGame(1);
    expect(restored).not.toBeNull();
    expect(restored!.player.stats.highestCheckout).toBe(0); // Cleaned during serialization / deserialization
  });
});
