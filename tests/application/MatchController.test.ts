import { describe, it, expect } from 'vitest';
import { Player } from '../../src/core/player/Player';
import { ManualInputProvider } from '../../src/input/ManualInputProvider';
import { StatisticalInputProvider } from '../../src/input/StatisticalInputProvider';
import { MatchController } from '../../src/application/MatchController';
import { Visit } from '../../src/core/match/Visit';
import { SeededRandomProvider } from '../../src/core/random/RandomProvider';

describe('MatchController & Turn Orchestration', () => {
  it('alternates turns between Player and CPU during a match', async () => {
    const player = new Player('p1', 'Alice', 'female', 'England', 25);
    const opponent = new Player('p2', 'Bob', 'male', 'Scotland', 30);

    const manual = new ManualInputProvider();
    const cpu = new StatisticalInputProvider(opponent, new SeededRandomProvider(42));

    const controller = new MatchController(
      player,
      opponent,
      manual,
      cpu,
      { type: 'legs', bestOfLegs: 3, startingScore: 501 }, 0
    );

    let lastStatus = '';
    controller.subscribe(evt => {
      lastStatus = evt.status;
    });

    await controller.startMatch();
    expect(lastStatus).toBe('awaiting_player_input');

    // Player throws 140
    await controller.processPlayerVisit(Visit.fromTotal('p1', 501, 140));

    // After player's visit, CPU finishes its turn automatically and turn returns to player
    expect(controller.match.currentLeg.getRemainingScore('p1')).toBe(361);
    expect(controller.match.currentLeg.getRemainingScore('p2')).toBeLessThan(501);
  });
});
