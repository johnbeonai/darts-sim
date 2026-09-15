import { describe, it, expect } from 'vitest';
import { RankingManager } from '../../src/core/ranking/RankingManager';
import { Player } from '../../src/core/player/Player';

describe('RankingManager (Order of Merit)', () => {
  it('correctly ranks players by prize money and tracks rank movement', () => {
    const p1 = new Player('p1', 'Player One', 'male', 'England', 25);
    p1.prizeMoneyTotal = 50000;

    const p2 = new Player('p2', 'Player Two', 'male', 'Scotland', 30);
    p2.prizeMoneyTotal = 100000;

    const p3 = new Player('p3', 'Player Three', 'male', 'Wales', 28);
    p3.prizeMoneyTotal = 25000;

    const rm = new RankingManager([p1, p2, p3]);

    const rank2 = rm.getPlayerRank('p2');
    const rank1 = rm.getPlayerRank('p1');
    const rank3 = rm.getPlayerRank('p3');

    expect(rank2?.currentRank).toBe(1);
    expect(rank1?.currentRank).toBe(2);
    expect(rank3?.currentRank).toBe(3);

    // Player 3 wins huge prize money and leaps to #1
    p3.prizeMoneyTotal = 150000;
    rm.recalculateRankings([p1, p2, p3]);

    const updated3 = rm.getPlayerRank('p3');
    const updated2 = rm.getPlayerRank('p2');

    expect(updated3?.currentRank).toBe(1);
    expect(updated3?.rankChange).toBe(2); // Jumped from 3 to 1 (+2)
    expect(updated2?.currentRank).toBe(2);
    expect(updated2?.rankChange).toBe(-1); // Dropped from 1 to 2 (-1)
  });

  it('marks human players and filters by search and tier', () => {
    const p1 = new Player('p1', 'John Human', 'male', 'England', 25);
    p1.tier = 'amateur';
    p1.prizeMoneyTotal = 500;

    const p2 = new Player('p2', 'Maikel AI', 'male', 'Netherlands', 32);
    p2.tier = 'elite';
    p2.prizeMoneyTotal = 500000;

    const rm = new RankingManager([p1, p2]);
    rm.markHumanPlayers(['p1']);

    expect(rm.getPlayerRank('p1')?.isHuman).toBe(true);
    expect(rm.getPlayerRank('p2')?.isHuman).toBe(false);

    const eliteRankings = rm.getRankings({ tier: 'elite' });
    expect(eliteRankings.length).toBe(1);
    expect(eliteRankings[0].playerName).toBe('Maikel AI');

    const searchResults = rm.getRankings({ search: 'john' });
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].playerName).toBe('John Human');
  });
});
