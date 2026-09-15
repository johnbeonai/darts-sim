import { describe, it, expect } from 'vitest';
import { Match } from '../../src/core/match/Match';
import { Player } from '../../src/core/player/Player';
import { Visit } from '../../src/core/match/Visit';
import { DartResult } from '../../src/core/match/DartResult';
import { MatchController } from '../../src/application/MatchController';
import { ManualInputProvider } from '../../src/input/ManualInputProvider';

describe('9-Darter Perfection Detection & Hall of Fame Milestone', () => {
  it('correctly detects a 9-dart finish (180, 180, 141) on 501', () => {
    const match = new Match('test-match', ['p1', 'p2'], {
      type: 'legs',
      bestOfLegs: 3,
      startingScore: 501,
      doubleOutRequired: true
    });

    const leg = match.currentLeg;

    // Visit 1: 180 (T20, T20, T20) -> 321 remaining
    leg.addVisit(new Visit('p1', 501, [
      new DartResult('p1', 20, 3),
      new DartResult('p1', 20, 3),
      new DartResult('p1', 20, 3)
    ]));

    // Opponent Visit
    leg.addVisit(new Visit('p2', 501, [
      new DartResult('p2', 20, 1),
      new DartResult('p2', 20, 1),
      new DartResult('p2', 20, 1)
    ]));

    // Visit 2: 180 (T20, T20, T20) -> 141 remaining
    leg.addVisit(new Visit('p1', 321, [
      new DartResult('p1', 20, 3),
      new DartResult('p1', 20, 3),
      new DartResult('p1', 20, 3)
    ]));

    // Opponent Visit
    leg.addVisit(new Visit('p2', 441, [
      new DartResult('p2', 20, 1),
      new DartResult('p2', 20, 1),
      new DartResult('p2', 20, 1)
    ]));

    // Visit 3: 141 Checkout (T20, T19, D12) -> 0 remaining in exactly 9 darts!
    const finishRes = leg.addVisit(new Visit('p1', 141, [
      new DartResult('p1', 20, 3),
      new DartResult('p1', 19, 3),
      new DartResult('p1', 12, 2)
    ]));

    expect(finishRes.legWon).toBe(true);

    const legRes = match.onLegCompleted('p1');
    expect(legRes.isNineDarter).toBe(true);
    expect(legRes.legWinnerId).toBe('p1');
  });

  it('correctly flags normal 10+ dart legs as non-9-darters', () => {
    const match = new Match('test-match-2', ['p1', 'p2'], {
      type: 'legs',
      bestOfLegs: 3,
      startingScore: 501,
      doubleOutRequired: true
    });

    const leg = match.currentLeg;

    // Turn 1: p1 (180) -> 321
    leg.addVisit(new Visit('p1', 501, [new DartResult('p1', 20, 3), new DartResult('p1', 20, 3), new DartResult('p1', 20, 3)]));
    // Turn 1: p2 (60) -> 441
    leg.addVisit(new Visit('p2', 501, [new DartResult('p2', 20, 1), new DartResult('p2', 20, 1), new DartResult('p2', 20, 1)]));

    // Turn 2: p1 (180) -> 141
    leg.addVisit(new Visit('p1', 321, [new DartResult('p1', 20, 3), new DartResult('p1', 20, 3), new DartResult('p1', 20, 3)]));
    // Turn 2: p2 (60) -> 381
    leg.addVisit(new Visit('p2', 441, [new DartResult('p2', 20, 1), new DartResult('p2', 20, 1), new DartResult('p2', 20, 1)]));

    // Turn 3: p1 (100) -> 41 (Leaves 41, didn't finish in 9 darts)
    leg.addVisit(new Visit('p1', 141, [new DartResult('p1', 20, 3), new DartResult('p1', 20, 1), new DartResult('p1', 20, 1)]));
    // Turn 3: p2 (60) -> 321
    leg.addVisit(new Visit('p2', 381, [new DartResult('p2', 20, 1), new DartResult('p2', 20, 1), new DartResult('p2', 20, 1)]));

    // Turn 4: p1 finishes in 11 darts (1 + D20)
    const res = leg.addVisit(new Visit('p1', 41, [new DartResult('p1', 1, 1), new DartResult('p1', 20, 2)]));

    expect(res.legWon).toBe(true);
    const legRes = match.onLegCompleted('p1');
    expect(legRes.isNineDarter).toBe(false);
  });

  it('increments player nineDarters career stat through MatchController', async () => {
    const p1 = new Player('p1', 'Luke The Nuke', 'male', 'England', 17);
    const p2 = new Player('p2', 'Opponent', 'male', 'England', 30);
    const p1Prov = new ManualInputProvider();
    const p2Prov = new ManualInputProvider();

    const controller = new MatchController(p1, p2, p1Prov, p2Prov, {
      type: 'legs',
      bestOfLegs: 3,
      startingScore: 501
    });

    let detectedNineDarter = false;
    controller.subscribe(ev => {
      if (ev.isNineDarter) {
        detectedNineDarter = true;
      }
    });

    const leg = controller.match.currentLeg;
    // Turn 1
    leg.addVisit(new Visit('p1', 501, [new DartResult('p1', 20, 3), new DartResult('p1', 20, 3), new DartResult('p1', 20, 3)]));
    leg.addVisit(new Visit('p2', 501, [new DartResult('p2', 20, 1), new DartResult('p2', 20, 1), new DartResult('p2', 20, 1)]));

    // Turn 2
    leg.addVisit(new Visit('p1', 321, [new DartResult('p1', 20, 3), new DartResult('p1', 20, 3), new DartResult('p1', 20, 3)]));
    leg.addVisit(new Visit('p2', 441, [new DartResult('p2', 20, 1), new DartResult('p2', 20, 1), new DartResult('p2', 20, 1)]));

    // Turn 3: 9-dart checkout visit
    const winVisit = new Visit('p1', 141, [new DartResult('p1', 20, 3), new DartResult('p1', 19, 3), new DartResult('p1', 12, 2)]);
    await controller.processPlayerVisit(winVisit);

    expect(detectedNineDarter).toBe(true);
    expect(p1.stats.nineDarters).toBe(1);
  });
});
