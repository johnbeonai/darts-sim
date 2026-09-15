/**
 * Aging, Skill Evolution & Retirement Engine
 * Implements Section 60 & Phase 2.4, 6.6, 6.8 of the Master Technical Blueprint.
 */

import { Player } from './Player';
import { IRandomProvider, DefaultRandomProvider } from '../random/RandomProvider';
import { PlayerFactory } from './PlayerFactory';

export interface AgingResult {
  playerId: string;
  playerName: string;
  oldAge: number;
  newAge: number;
  statDeltas: Partial<Record<keyof Player['attributes'], number>>;
  summaryMessage: string;
  retired: boolean;
}

export class AgingManager {
  /**
   * Evaluates annual aging, physical development curve, and skill evolution
   */
  public static processAnnualAging(
    player: Player,
    rng: IRandomProvider = new DefaultRandomProvider()
  ): AgingResult {
    const oldAge = player.age;
    player.age += 1;
    const newAge = player.age;

    const deltas: Partial<Record<keyof Player['attributes'], number>> = {};
    const messages: string[] = [];

    // 1. YOUNG PRODIGY BRACKET (Age 16 - 25)
    if (newAge <= 25) {
      // Rapid physical & scoring skill development if below potential
      if (player.attributes.potential > player.attributes.scoring) {
        const growth = 1 + Math.floor(rng.next() * 3); // +1 to +3
        player.attributes.scoring = Math.min(100, player.attributes.scoring + growth);
        deltas.scoring = growth;
        messages.push(`+${growth} Scoring`);
      }

      if (player.attributes.potential > player.attributes.doubling) {
        const dGrowth = 1 + Math.floor(rng.next() * 2);
        player.attributes.doubling = Math.min(100, player.attributes.doubling + dGrowth);
        deltas.doubling = dGrowth;
        messages.push(`+${dGrowth} Doubling`);
      }

      // Stamina naturally increases during youth
      if (player.attributes.stamina < 85 && rng.next() < 0.6) {
        player.attributes.stamina = Math.min(100, player.attributes.stamina + 2);
        deltas.stamina = 2;
        messages.push(`+2 Stamina`);
      }

      // Composure grows slowly through match hardening
      if (rng.next() < 0.35) {
        player.attributes.pressure = Math.min(100, player.attributes.pressure + 1);
        deltas.pressure = 1;
        messages.push(`+1 Pressure Composure`);
      }
    }
    // 2. PRIME ATHLETIC WINDOW (Age 26 - 38)
    else if (newAge <= 38) {
      // Peak consistency and balance
      if (player.attributes.potential > player.attributes.consistency && rng.next() < 0.5) {
        player.attributes.consistency = Math.min(100, player.attributes.consistency + 1);
        deltas.consistency = 1;
        messages.push(`+1 Consistency`);
      }

      // Composure matures
      if (player.attributes.pressure < 85 && rng.next() < 0.4) {
        player.attributes.pressure = Math.min(100, player.attributes.pressure + 1);
        deltas.pressure = 1;
        messages.push(`+1 Pressure Composure`);
      }
    }
    // 3. VETERAN MASTER (Age 39 - 48)
    else if (newAge <= 48) {
      // Tactical board navigation and clutch composure peak
      if (player.attributes.pressure < 95) {
        const pBoost = 1 + (rng.next() < 0.3 ? 1 : 0);
        player.attributes.pressure = Math.min(100, player.attributes.pressure + pBoost);
        deltas.pressure = pBoost;
        messages.push(`+${pBoost} Clutch Composure`);
      }

      // Slight stamina softening if work ethic is moderate
      if (player.attributes.workEthic < 70 && rng.next() < 0.4) {
        player.attributes.stamina = Math.max(45, player.attributes.stamina - 1);
        deltas.stamina = -1;
        messages.push(`-1 Stamina`);
      }
    }
    // 4. SENIOR LEGEND BRACKET (Age 49+)
    else {
      // Stamina naturally wanes
      const stamLoss = 1 + (rng.next() < 0.4 ? 1 : 0);
      player.attributes.stamina = Math.max(40, player.attributes.stamina - stamLoss);
      deltas.stamina = -stamLoss;
      messages.push(`-${stamLoss} Stamina`);

      // Treble grouping spread slightly widens without elite work ethic
      if (player.attributes.workEthic < 75 && rng.next() < 0.45) {
        player.attributes.scoring = Math.max(45, player.attributes.scoring - 1);
        deltas.scoring = -1;
        messages.push(`-1 Scoring`);
      }

      // Veteran doubles and ice-cold finishing remain sharp
      if (rng.next() < 0.25 && player.attributes.doubling < 90) {
        player.attributes.doubling = Math.min(100, player.attributes.doubling + 1);
        deltas.doubling = 1;
        messages.push(`+1 Crafty Doubling`);
      }
    }

    const summaryMessage = messages.length > 0
      ? `${player.name} (${newAge}): ${messages.join(', ')}.`
      : `${player.name} (${newAge}): Attributes held steady this year.`;

    return {
      playerId: player.id,
      playerName: player.name,
      oldAge,
      newAge,
      statDeltas: deltas,
      summaryMessage,
      retired: false
    };
  }

  /**
   * Checks whether an AI player decides to retire at year end
   */
  public static shouldAIRetire(
    player: Player,
    rng: IRandomProvider = new DefaultRandomProvider()
  ): boolean {
    if (player.age < 50) return false;

    // Likelihood increases with age and declining rank
    let retireChance = 0.05; // Base at age 50
    if (player.age >= 55) retireChance = 0.25;
    if (player.age >= 60) retireChance = 0.60;
    if (player.age >= 65) retireChance = 0.95;

    // If unranked or outside top 96, retirement is more appealing
    if (player.ranking > 96 || player.ranking === 0) {
      retireChance += 0.20;
    }

    // Low confidence increases retirement impulse
    if (player.state.confidence < 35) {
      retireChance += 0.15;
    }

    return rng.next() < retireChance;
  }

  /**
   * Replaces a retired AI player with a promising new young rookie
   */
  public static spawnYoungRookie(
    retiredPlayer: Player,
    factory: PlayerFactory = new PlayerFactory()
  ): Player {
    const firstNames = ['Jack', 'Liam', 'Finley', 'Callum', 'Oliver', 'Harry', 'George', 'Noah', 'Leo', 'Oscar', 'Sam', 'Tyler'];
    const lastNames = ['Hughes', 'Evans', 'Carter', 'Taylor', 'Wilson', 'Bennett', 'Morrison', 'Davies', 'Walker', 'Harrison'];
    const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const archetypes = ['heavy_scorer', 'clinical_finisher', 'steady_grinder', 'balanced', 'raw_talent'] as const;
    const chosenArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];

    return factory.createPlayer({
      name: randomName,
      nationality: retiredPlayer.nationality,
      gender: retiredPlayer.gender,
      archetype: chosenArchetype,
      age: 18 + Math.floor(Math.random() * 4) // 18-21
    });
  }
}
