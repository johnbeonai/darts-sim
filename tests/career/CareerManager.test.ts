import { describe, it, expect } from 'vitest';
import { Player } from '../../src/core/player/Player';
import { CareerManager } from '../../src/core/career/CareerManager';
import { SeededRandomProvider } from '../../src/core/random/RandomProvider';

describe('CareerManager', () => {
  it('manages entry fee deduction, bracket creation, and week progression', () => {
    const rng = new SeededRandomProvider(42);
    const player = new Player('p1', 'Prodigy', 'male', 'England', 19);
    const career = new CareerManager(player, rng);

    expect(player.bankBalance).toBe(250);
    expect(career.availableTournaments.length).toBeGreaterThan(0);

    const tourneyConfig = career.availableTournaments[0];
    const tournament = career.enterTournament(tourneyConfig);

    expect(player.bankBalance).toBe(250 - tourneyConfig.entryFee);
    expect(tournament.participants.length).toBe(8);

    career.advanceWeek();
    expect(career.calendar.currentWeek).toBe(2);
  });
});
