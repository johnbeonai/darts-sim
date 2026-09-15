import { describe, it, expect } from 'vitest';
import { WorldManager } from '../../src/core/world/WorldManager';
import { RankingManager } from '../../src/core/ranking/RankingManager';
import { WorldSimulation } from '../../src/core/world/WorldSimulation';
import { Player } from '../../src/core/player/Player';

describe('WorldSimulation (Weekly Background World Evolution)', () => {
  it('simulates background events and updates rankings and logs', () => {
    const world = new WorldManager();
    const human = new Player('human-1', 'John Oche', 'male', 'England', 25);
    const ranking = new RankingManager([...world.getAllAIPlayers(), human]);
    const sim = new WorldSimulation(world, ranking);

    const initialTotalPrize = world.getAllAIPlayers().reduce((acc, p) => acc + p.prizeMoneyTotal, 0);

    // Simulate 3 weeks of background activity
    sim.simulateWeeklyActivity(1, 2026, [human], false);
    sim.simulateWeeklyActivity(2, 2026, [human], false);
    sim.simulateWeeklyActivity(3, 2026, [human], false);

    const updatedTotalPrize = world.getAllAIPlayers().reduce((acc, p) => acc + p.prizeMoneyTotal, 0);
    expect(updatedTotalPrize).toBeGreaterThan(initialTotalPrize);
    expect(sim.logs.length).toBe(3);

    // Check that rankings updated
    const rankings = ranking.getRankings();
    expect(rankings.length).toBe(world.totalPopulation + 1);
  });
});
