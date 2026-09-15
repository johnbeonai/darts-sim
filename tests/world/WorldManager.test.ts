import { describe, it, expect } from 'vitest';
import { WorldManager } from '../../src/core/world/WorldManager';

describe('WorldManager (AI World Population)', () => {
  it('generates a full world population of 200+ AI players across all tiers', () => {
    const wm = new WorldManager();
    expect(wm.totalPopulation).toBeGreaterThanOrEqual(208);

    const elite = wm.getPlayersByTier('elite');
    const pro = wm.getPlayersByTier('pro');
    const semiPro = wm.getPlayersByTier('semi_pro');
    const amateur = wm.getPlayersByTier('amateur');

    expect(elite.length).toBe(16);
    expect(pro.length).toBe(48);
    expect(semiPro.length).toBe(64);
    expect(amateur.length).toBe(80);
  });

  it('elite players have world-class ratings and realistic prize money', () => {
    const wm = new WorldManager();
    const elite = wm.getPlayersByTier('elite');

    for (const p of elite) {
      expect(p.attributes.scoring).toBeGreaterThanOrEqual(88);
      expect(p.attributes.doubling).toBeGreaterThanOrEqual(85);
      expect(p.prizeMoneyTotal).toBeGreaterThanOrEqual(300000);
      expect(p.rankingPoints).toBeGreaterThanOrEqual(400);
    }
  });

  it('getOpponentsForTier returns distinct persistent opponents from the specified tier', () => {
    const wm = new WorldManager();
    const opponents = wm.getOpponentsForTier('pro', 7, ['exclude-id']);
    expect(opponents.length).toBe(7);

    const uniqueIds = new Set(opponents.map(p => p.id));
    expect(uniqueIds.size).toBe(7);

    for (const p of opponents) {
      expect(p.tier).toBe('pro');
    }
  });

  it('serializes and deserializes the entire persistent AI population', () => {
    const wm1 = new WorldManager();
    const elite1 = wm1.getPlayersByTier('elite')[0];
    elite1.prizeMoneyTotal = 2500000;

    const serialized = wm1.serialize();
    expect(serialized.length).toBe(wm1.totalPopulation);

    const wm2 = new WorldManager();
    wm2.deserialize(serialized);

    const elite2 = wm2.getPlayerById(elite1.id);
    expect(elite2).toBeDefined();
    expect(elite2!.prizeMoneyTotal).toBe(2500000);
    expect(elite2!.name).toBe(elite1.name);
  });
});
