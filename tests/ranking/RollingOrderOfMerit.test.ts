import { describe, it, expect, beforeEach } from 'vitest';
import { RollingPrizeMoneyLedger } from '../../src/core/ranking/RollingPrizeMoneyLedger';
import { RankingManager } from '../../src/core/ranking/RankingManager';
import { PlayerFactory } from '../../src/core/player/PlayerFactory';

describe('RollingPrizeMoneyLedger & 2-Year PDC Order of Merit', () => {
  let ledger: RollingPrizeMoneyLedger;
  const factory = new PlayerFactory();

  beforeEach(() => {
    ledger = new RollingPrizeMoneyLedger();
  });

  it('should sum prize money earned within the 104-week rolling window', () => {
    const playerId = 'player-1';

    // Year 2026, Week 10: won £50,000
    ledger.addPrize(playerId, 'uk-open-2026', 'UK Open', 2026, 10, 50000, true);
    // Year 2026, Week 30: won £25,000
    ledger.addPrize(playerId, 'matchplay-2026', 'World Matchplay', 2026, 30, 25000, true);

    // Check at Year 2026, Week 35: Both should be active (total £75,000)
    const rolling = ledger.getRollingPrizeMoney(playerId, 2026, 35);
    expect(rolling).toBe(75000);
  });

  it('should drop prize money won more than 104 weeks ago (2-year drop-off)', () => {
    const playerId = 'player-1';

    // Won £100,000 in Year 2026, Week 10
    ledger.addPrize(playerId, 'event-2026', 'Major Title 2026', 2026, 10, 100000, true);

    // 1 year later (2027, Week 10): age = 52 weeks -> still active
    expect(ledger.getRollingPrizeMoney(playerId, 2027, 10)).toBe(100000);

    // 2 years later (2028, Week 9): age = 103 weeks -> still active
    expect(ledger.getRollingPrizeMoney(playerId, 2028, 9)).toBe(100000);

    // 2 years and 1 week later (2028, Week 11): age = 105 weeks -> DROPPED OFF
    expect(ledger.getRollingPrizeMoney(playerId, 2028, 11)).toBe(0);
  });

  it('should calculate upcoming defending prize money due to expire within next 12 weeks', () => {
    const playerId = 'player-1';

    // Won £80,000 in Year 2026, Week 20
    ledger.addPrize(playerId, 'event-defending', 'World Matchplay', 2026, 20, 80000, true);

    // Current date: Year 2028, Week 12 (8 weeks before the 2-year drop-off at Week 20)
    const defending = ledger.getDefendingPrizeMoney(playerId, 2028, 12, 12);
    expect(defending).toBe(80000);

    // If current date is Year 2028, Week 5 (15 weeks before drop-off), defending window of 12w won't include it yet
    const notYetDefending = ledger.getDefendingPrizeMoney(playerId, 2028, 5, 12);
    expect(notYetDefending).toBe(0);
  });

  it('should seed baseline historical earnings across 8 quarters', () => {
    const playerId = 'pro-veteran';
    ledger.seedBaselineEarnings(playerId, 80000, 2026, 1);

    const rolling = ledger.getRollingPrizeMoney(playerId, 2026, 1);
    expect(rolling).toBe(80000);
  });

  it('should serialize and deserialize prize ledger data faithfully', () => {
    const playerId = 'player-persist';
    ledger.addPrize(playerId, 'tourney-1', 'Championship', 2026, 15, 45000, true);

    const serialized = ledger.serialize();
    const newLedger = new RollingPrizeMoneyLedger();
    newLedger.deserialize(serialized);

    expect(newLedger.getRollingPrizeMoney(playerId, 2026, 15)).toBe(45000);
  });
});

describe('RankingManager: Cutoffs, Seedings & Relegation Zone', () => {
  it('should properly segment Top 16, Top 32, Top 64, and Relegation Zone', () => {
    const factory = new PlayerFactory();
    const players = [];

    // Create 100 players with graduated prize money
    for (let i = 1; i <= 100; i++) {
      const p = factory.createPlayer({
        name: `Pro Player ${i}`,
        gender: 'male',
        nationality: 'England'
      });
      p.tier = i <= 64 ? 'pro' : 'semi_pro';
      p.prizeMoneyTotal = (101 - i) * 5000; // #1 has £500,000, #100 has £5,000
      players.push(p);
    }

    const ranking = new RankingManager();
    ranking.initialize(players, 2026, 1);

    const top16 = ranking.getTop16();
    expect(top16).toHaveLength(16);
    expect(top16[0].currentRank).toBe(1);
    expect(top16[15].currentRank).toBe(16);

    const top32 = ranking.getTop32();
    expect(top32).toHaveLength(32);

    const top64 = ranking.getTop64();
    expect(top64).toHaveLength(64);
    expect(top64[63].currentRank).toBe(64);

    const relegationZone = ranking.getRelegationZone();
    expect(relegationZone).toHaveLength(36); // Ranks 65 to 100 (total 100 players)
    expect(relegationZone[0].currentRank).toBe(65);

    const cutoffs = ranking.getCutoffBoundaries();
    expect(cutoffs.top16CutoffMoney).toBe(top16[15].prizeMoney);
    expect(cutoffs.top64CutoffMoney).toBe(top64[63].prizeMoney);
  });
});
