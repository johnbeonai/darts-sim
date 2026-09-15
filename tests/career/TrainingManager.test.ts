import { describe, it, expect } from 'vitest';
import { Player } from '../../src/core/player/Player';
import { TrainingManager } from '../../src/core/career/TrainingManager';

describe('TrainingManager', () => {
  it('improves scoring attribute and adds fatigue', () => {
    const player = new Player('p1', 'Trainee', 'male', 'England', 20, {
      scoring: 40,
      potential: 80,
      workEthic: 80
    });

    const res = TrainingManager.executeTraining(player, 'scoring');
    expect(res.gain).toBeGreaterThan(0);
    expect(player.attributes.scoring).toBeGreaterThan(40);
    expect(player.state.fatigue).toBeGreaterThan(0);
  });

  it('rest reduces fatigue and restores condition', () => {
    const player = new Player('p1', 'Tired', 'male', 'England', 20);
    player.addFatigue(50);
    expect(player.state.fatigue).toBeGreaterThan(0);

    const res = TrainingManager.executeTraining(player, 'rest');
    expect(res.fatigueChange).toBeLessThan(0);
    expect(player.state.fatigue).toBeLessThan(50);
  });
});
