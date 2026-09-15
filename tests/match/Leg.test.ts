import { describe, it, expect } from 'vitest';
import { Leg } from '../../src/core/match/Leg';
import { DartResult } from '../../src/core/match/DartResult';
import { Visit } from '../../src/core/match/Visit';

describe('Leg Engine', () => {
  it('initializes with 501 and alternates turns', () => {
    const leg = new Leg('leg-1', ['alice', 'bob'], 'alice', 501);
    expect(leg.getRemainingScore('alice')).toBe(501);
    expect(leg.getRemainingScore('bob')).toBe(501);
    expect(leg.currentTurnPlayerId).toBe('alice');

    // Alice throws 180
    leg.addVisit(Visit.fromTotal('alice', 501, 180));
    expect(leg.getRemainingScore('alice')).toBe(321);
    expect(leg.currentTurnPlayerId).toBe('bob');

    // Bob throws 100
    leg.addVisit(Visit.fromTotal('bob', 501, 100));
    expect(leg.getRemainingScore('bob')).toBe(401);
    expect(leg.currentTurnPlayerId).toBe('alice');
  });

  it('calculates 3-dart averages correctly', () => {
    const leg = new Leg('leg-1', ['alice', 'bob'], 'alice', 501);
    leg.addVisit(Visit.fromTotal('alice', 501, 140)); // 3 darts, 140 avg
    leg.addVisit(Visit.fromTotal('bob', 501, 60));    // 3 darts, 60 avg
    leg.addVisit(Visit.fromTotal('alice', 361, 100)); // 6 darts, 240 scored => 120 avg

    const aliceStats = leg.getPlayerStats('alice');
    expect(aliceStats.dartsThrown).toBe(6);
    expect(aliceStats.totalScored).toBe(240);
    expect(aliceStats.average).toBe(120);

    const bobStats = leg.getPlayerStats('bob');
    expect(bobStats.dartsThrown).toBe(3);
    expect(bobStats.totalScored).toBe(60);
    expect(bobStats.average).toBe(60);
  });

  it('executes a 9-dart finish scenario', () => {
    const leg = new Leg('leg-9', ['mvp', 'cpu'], 'mvp', 501);

    // Darts 1-3: 180
    leg.applyDart(DartResult.fromLabel('T20', 'mvp'));
    leg.applyDart(DartResult.fromLabel('T20', 'mvp'));
    leg.applyDart(DartResult.fromLabel('T20', 'mvp'));

    // CPU turn: 60
    leg.addVisit(Visit.fromTotal('cpu', 501, 60));

    // Darts 4-6: 180
    leg.applyDart(DartResult.fromLabel('T20', 'mvp'));
    leg.applyDart(DartResult.fromLabel('T20', 'mvp'));
    leg.applyDart(DartResult.fromLabel('T20', 'mvp'));

    // CPU turn: 60
    leg.addVisit(Visit.fromTotal('cpu', 441, 60));

    // Darts 7-9: T20, T19, D12 (141 finish)
    leg.applyDart(DartResult.fromLabel('T20', 'mvp'));
    leg.applyDart(DartResult.fromLabel('T19', 'mvp'));
    const winResult = leg.applyDart(DartResult.fromLabel('D12', 'mvp'));

    expect(winResult.legWon).toBe(true);
    expect(leg.status).toBe('finished');
    expect(leg.winnerId).toBe('mvp');
    expect(leg.getRemainingScore('mvp')).toBe(0);

    const stats = leg.getPlayerStats('mvp');
    expect(stats.dartsThrown).toBe(9);
    expect(stats.average).toBe(167); // 501 / 9 * 3 = 167
  });
});
