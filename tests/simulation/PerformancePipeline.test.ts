import { describe, it, expect } from 'vitest';
import { PerformancePipeline } from '../../src/core/simulation/PerformancePipeline';
import { Player } from '../../src/core/player/Player';
import { TargetingEngine } from '../../src/core/simulation/TargetingEngine';
import { SeededRandomProvider } from '../../src/core/random/RandomProvider';

describe('Performance Pipeline', () => {
  it('generates targets logically based on score', () => {
    expect(TargetingEngine.getTarget(501).label).toBe('T20');
    expect(TargetingEngine.getTarget(170).label).toBe('T20');
    expect(TargetingEngine.getTarget(40).label).toBe('D20');
    expect(TargetingEngine.getTarget(32).label).toBe('D16');
    expect(TargetingEngine.getTarget(50).label).toBe('D-Bull');
  });

  it('simulates visits within legal 501 bounds', () => {
    const rng = new SeededRandomProvider(777);
    const pipeline = new PerformancePipeline(rng);
    const player = new Player('p1', 'Test Player', 'male', 'England', 25, {
      scoring: 75,
      doubling: 70,
      consistency: 70
    });

    const visit = pipeline.simulateVisit(player, {
      remainingScore: 501,
      opponentRemaining: 501
    });

    expect(visit.darts.length).toBe(3);
    expect(visit.visitScore).toBeGreaterThanOrEqual(0);
    expect(visit.visitScore).toBeLessThanOrEqual(180);
    expect(visit.scoreAfter).toBe(501 - visit.visitScore);
  });

  it('elite player statistically outperforms amateur over 50 visits', () => {
    const rng = new SeededRandomProvider(999);
    const pipeline = new PerformancePipeline(rng);

    const elite = new Player('elite', 'Elite Pro', 'male', 'England', 28, {
      scoring: 90,
      doubling: 85,
      consistency: 85
    });

    const amateur = new Player('amateur', 'Amateur', 'male', 'England', 28, {
      scoring: 35,
      doubling: 30,
      consistency: 30
    });

    let eliteTotal = 0;
    let amateurTotal = 0;

    for (let i = 0; i < 50; i++) {
      eliteTotal += pipeline.simulateVisit(elite, { remainingScore: 501, opponentRemaining: 501 }).visitScore;
      amateurTotal += pipeline.simulateVisit(amateur, { remainingScore: 501, opponentRemaining: 501 }).visitScore;
    }

    const eliteAvg = (eliteTotal / (50 * 3)) * 3;
    const amateurAvg = (amateurTotal / (50 * 3)) * 3;

    expect(eliteAvg).toBeGreaterThan(amateurAvg);
  });
});
