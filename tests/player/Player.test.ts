import { describe, it, expect } from 'vitest';
import { Player } from '../../src/core/player/Player';
import { PlayerFactory } from '../../src/core/player/PlayerFactory';
import { SeededRandomProvider } from '../../src/core/random/RandomProvider';

describe('Player Model & Factory', () => {
  it('creates player with constrained attributes within 0-100', () => {
    const player = new Player('p1', 'John O', 'male', 'England', 25, {
      scoring: 60,
      doubling: 55
    });

    expect(player.attributes.scoring).toBe(60);
    expect(player.attributes.doubling).toBe(55);
    expect(player.attributes.consistency).toBe(45); // default
    expect(player.state.confidence).toBe(50);
    expect(player.state.fatigue).toBe(0);
    expect(player.bankBalance).toBe(250);
  });

  it('PlayerFactory produces distinct archetypes', () => {
    const rng = new SeededRandomProvider(42);
    const factory = new PlayerFactory(rng);

    const scorer = factory.createPlayer({
      name: 'Scorer Bob',
      gender: 'male',
      nationality: 'England',
      archetype: 'heavy_scorer'
    });

    const finisher = factory.createPlayer({
      name: 'Finisher Alice',
      gender: 'female',
      nationality: 'Scotland',
      archetype: 'clinical_finisher'
    });

    expect(scorer.attributes.scoring).toBeGreaterThan(finisher.attributes.scoring);
    expect(finisher.attributes.doubling).toBeGreaterThan(scorer.attributes.doubling);
  });

  it('adjusts confidence and accumulates fatigue properly', () => {
    const player = new Player('p1', 'Phil', 'male', 'England', 30, { stamina: 50 });

    player.adjustConfidence(10);
    expect(player.state.confidence).toBe(60);

    player.addFatigue(20);
    expect(player.state.fatigue).toBeGreaterThan(0);

    player.rest(50);
    expect(player.state.fatigue).toBe(0);
  });
});
