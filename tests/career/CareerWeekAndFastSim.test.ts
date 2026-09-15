import { describe, it, expect } from 'vitest';
import { Player } from '../../src/core/player/Player';
import { CareerManager } from '../../src/core/career/CareerManager';
import { SeededRandomProvider } from '../../src/core/random/RandomProvider';
import { PerformancePipeline } from '../../src/core/simulation/PerformancePipeline';
import { Match } from '../../src/core/match/Match';

describe('Career Progression & Match Simulation', () => {
  it('advances week and date on training / rest', () => {
    const rng = new SeededRandomProvider(101);
    const player = new Player('p1', 'Test Prodigy', 'male', 'England', 20);
    const career = new CareerManager(player, rng);

    const initialWeek = career.calendar.currentWeek;
    const initialDate = career.calendar.dateString;

    // Train scoring
    const trainResult = career.train('scoring');
    expect(trainResult.gain).toBeGreaterThanOrEqual(0);
    expect(trainResult.message).toBeDefined();

    // Advancing week
    career.advanceWeek();
    expect(career.calendar.currentWeek).toBe(initialWeek + 1);
    expect(career.calendar.dateString).not.toBe(initialDate);

    // Rest session
    player.state.fatigue = 50;
    const restResult = career.train('rest');
    expect(restResult.fatigueChange).toBeLessThan(0);
    expect(player.state.fatigue).toBe(15);

    career.advanceWeek();
    expect(career.calendar.currentWeek).toBe(initialWeek + 2);
  });

  it('correctly simulates matches to completion without errors', () => {
    const p1 = new Player('p1', 'Player One', 'male', 'England', 25);
    const p2 = new Player('p2', 'Player Two', 'male', 'Scotland', 27);
    const match = new Match('sim-match-1', [p1.id, p2.id], { type: 'legs', bestOfLegs: 3 });
    const pipeline = new PerformancePipeline(new SeededRandomProvider(777));

    let maxSteps = 1000;
    while (match.status !== 'finished' && maxSteps > 0) {
      maxSteps--;
      const leg = match.currentLeg;
      const turnPid = leg.currentTurnPlayerId;
      const activePlayer = turnPid === p1.id ? p1 : p2;
      const oppPlayer = turnPid === p1.id ? p2 : p1;

      const visit = pipeline.simulateVisit(activePlayer, {
        remainingScore: leg.getRemainingScore(activePlayer.id),
        opponentRemaining: leg.getRemainingScore(oppPlayer.id)
      });

      const res = leg.addVisit(visit);
      if (res.legWon) {
        match.onLegCompleted(activePlayer.id);
      }
    }

    expect(match.status).toBe('finished');
    expect(match.winnerId).toBeDefined();
    expect([p1.id, p2.id]).toContain(match.winnerId);
  });
});
