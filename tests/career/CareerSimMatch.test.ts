import { describe, it, expect } from 'vitest';
import { Player } from '../../src/core/player/Player';
import { CareerManager } from '../../src/core/career/CareerManager';
import { SeededRandomProvider } from '../../src/core/random/RandomProvider';

describe('Career Simulated Match (Bed Mode)', () => {
  it('statistically simulates player match to completion and updates stats', () => {
    const rng = new SeededRandomProvider(999);
    const player = new Player('human', 'Bed Player', 'male', 'England', 24, {
      scoring: 60,
      doubling: 55
    });

    const career = new CareerManager(player, rng);
    const tourney = career.enterTournament(career.availableTournaments[0]);

    const playerMatch = tourney.getPlayerMatch(player.id);
    expect(playerMatch).not.toBeNull();

    const winner = career.simulateHumanMatch(playerMatch!);
    expect(playerMatch!.isCompleted).toBe(true);
    expect(winner).not.toBeNull();
    expect(player.stats.matchesPlayed).toBe(1);
    expect(player.stats.dartsThrown).toBeGreaterThan(0);
  });
});
