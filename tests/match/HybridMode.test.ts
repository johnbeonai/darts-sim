import { describe, it, expect } from 'vitest';
import { Player } from '../../src/core/player/Player';
import { MatchController } from '../../src/application/MatchController';
import { ManualInputProvider } from '../../src/input/ManualInputProvider';
import { StatisticalInputProvider } from '../../src/input/StatisticalInputProvider';
import { Visit } from '../../src/core/match/Visit';
import { DartResult } from '../../src/core/match/DartResult';

describe('Hybrid Companion Mode Match Controller Integration', () => {
  const createPlayer = (id: string, name: string): Player => {
    return new Player(id, name, 'male', 'ENG', 25);
  };

  it('Processes manual visit submission and automatically triggers CPU response', async () => {
    const p1 = createPlayer('p1', 'Human Player');
    const p2 = createPlayer('p2', 'CPU Opponent');

    const p1Provider = new ManualInputProvider();
    const p2Provider = new StatisticalInputProvider(p2); // Will auto-generate visits

    const controller = new MatchController(p1, p2, p1Provider, p2Provider, {
      type: 'legs',
      bestOfLegs: 1,
      startingScore: 501,
      doubleOutRequired: true
    });

    let eventFired = false;
    controller.subscribe((event) => {
      eventFired = true;
    });

    await controller.startMatch();
    expect(controller.match.currentLeg.currentTurnPlayerId).toBe('p1');
    expect(controller.status).toBe('awaiting_player_input');

    // 1. Human submits a quick preset visit of 180
    const visit1 = Visit.fromTotal('p1', 501, 180);
    await controller.processPlayerVisit(visit1);

    // 2. State should immediately shift to CPU, execute CPU turn, and shift back to Player 1
    // (StatisticalInputProvider resolves almost instantly because we don't await delays in test without config overrides,
    // but let's check the score)
    
    // Check Human Score
    expect(controller.match.currentLeg.getRemainingScore('p1')).toBe(321);

    // Check CPU Score (CPU should have thrown its 3 darts)
    const p2Score = controller.match.currentLeg.getRemainingScore('p2');
    expect(p2Score).toBeLessThan(501);

    // Turn should be back to p1
    expect(controller.status).toBe('awaiting_player_input');
    expect(controller.match.currentLeg.currentTurnPlayerId).toBe('p1');
  });

  it('Handles human checkout correctly via processPlayerVisit', async () => {
    const p1 = createPlayer('p1', 'Human Player');
    const p2 = createPlayer('p2', 'CPU Opponent');

    const p1Provider = new ManualInputProvider();
    const p2Provider = new StatisticalInputProvider(p2);

    const controller = new MatchController(p1, p2, p1Provider, p2Provider, {
      type: 'legs',
      bestOfLegs: 1,
      startingScore: 100, // Start close to checkout
      doubleOutRequired: true
    });

    await controller.startMatch();
    
    // Human submits checkout (e.g. T20, D20 = 100)
    // To cleanly win, we just need a total that reaches 0 with a double.
    // For processPlayerVisit with fromTotal, it assumes 0 means checkout but we need to ensure the checkout double flag isn't lost.
    // In our simplified HybridMode, Visit.fromTotal sets up the darts to reach that score.
    const visit = Visit.fromTotal('p1', 100, 100);
    // Force the last dart to be a double to satisfy doubleOutRequired
    if (visit.darts.length > 0) {
      const last = visit.darts[visit.darts.length - 1];
      visit.darts[visit.darts.length - 1] = new DartResult(last.playerId, last.segment, 2);
    }

    await controller.processPlayerVisit(visit);

    // Leg should be won
    expect(controller.match.legsWon.get('p1')).toBe(1);
    expect(controller.status).toBe('match_completed');
    expect(controller.match.winnerId).toBe('p1');
  });
});
