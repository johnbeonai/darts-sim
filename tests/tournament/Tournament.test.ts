import { describe, it, expect } from 'vitest';
import { Tournament } from '../../src/core/tournament/Tournament';
import { PlayerFactory } from '../../src/core/player/PlayerFactory';
import { SeededRandomProvider } from '../../src/core/random/RandomProvider';

describe('Tournament Bracket Engine', () => {
  it('generates 8-player bracket and completes all rounds statistically', () => {
    const rng = new SeededRandomProvider(12345);
    const factory = new PlayerFactory(rng);
    const participants = Array.from({ length: 8 }, (_, i) => factory.createAIOpponent('pub', `Player ${i + 1}`));

    const tournament = new Tournament({
      id: 'tourney-test',
      name: 'Test Cup',
      location: 'Coventry',
      tier: 'pub',
      entryFee: 10,
      prizePool: { winner: 100, runnerUp: 50, semiFinalist: 20, quarterFinalist: 0 },
      rankingPoints: { winner: 20, runnerUp: 10, semiFinalist: 5, quarterFinalist: 0 },
      format: { type: 'legs', bestOfLegs: 1, startingScore: 501 }
    }, participants, rng);

    // Round 1: Quarter-Finals
    expect(tournament.getCurrentRoundMatches().length).toBe(4);
    tournament.simulateAIMatches('non-existent-human');
    expect(tournament.getCurrentRoundMatches().every(m => m.isCompleted)).toBe(true);

    // Advance to Semi-Finals
    expect(tournament.advanceRound()).toBe(true);
    expect(tournament.getCurrentRoundMatches().length).toBe(2);
    tournament.simulateAIMatches('non-existent-human');

    // Advance to Final
    expect(tournament.advanceRound()).toBe(true);
    expect(tournament.getCurrentRoundMatches().length).toBe(1);
    tournament.simulateAIMatches('non-existent-human');

    // Finish tournament
    tournament.advanceRound();
    expect(tournament.isCompleted).toBe(true);
    expect(tournament.winner).not.toBeNull();
    expect(tournament.runnerUp).not.toBeNull();
  });
});
