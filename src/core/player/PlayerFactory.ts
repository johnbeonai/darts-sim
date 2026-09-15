import { Player, Gender, PlayerAttributes } from './Player';
import { IRandomProvider, DefaultRandomProvider } from '../random/RandomProvider';

export type PlayerArchetype = 'heavy_scorer' | 'clinical_finisher' | 'steady_grinder' | 'balanced' | 'raw_talent';

export interface PlayerCreationOptions {
  name: string;
  gender: Gender;
  nationality: string;
  homeBaseId?: string;
  age?: number;
  archetype?: PlayerArchetype;
}

let playerCounter = 0;

export function generateUniquePlayerId(prefix: string = 'player'): string {
  playerCounter++;
  const salt = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${Date.now()}-${playerCounter}-${salt}`;
}

export class PlayerFactory {
  constructor(private rng: IRandomProvider = new DefaultRandomProvider()) {}

  /**
   * Creates a player with controlled randomization based on archetype (Section 14 & 15).
   * Starting attributes are calibrated for an entry-level amateur/pub player (35-55 baseline).
   */
  public createPlayer(options: PlayerCreationOptions, id?: string): Player {
    const playerId = id || generateUniquePlayerId('player');
    const age = options.age ?? this.rng.nextInt(18, 30);
    const archetype = options.archetype ?? 'balanced';

    let baseScoring = 45;
    let baseDoubling = 45;
    let baseConsistency = 45;
    let basePressure = 45;
    let baseStamina = 50;

    switch (archetype) {
      case 'heavy_scorer':
        baseScoring = 56;
        baseDoubling = 38;
        baseConsistency = 42;
        break;
      case 'clinical_finisher':
        baseScoring = 40;
        baseDoubling = 56;
        baseConsistency = 46;
        break;
      case 'steady_grinder':
        baseScoring = 44;
        baseDoubling = 46;
        baseConsistency = 58;
        baseStamina = 60;
        break;
      case 'raw_talent':
        baseScoring = 52;
        baseDoubling = 48;
        baseConsistency = 32;
        break;
      case 'balanced':
      default:
        baseScoring = 46;
        baseDoubling = 46;
        baseConsistency = 46;
        break;
    }

    // Apply controlled random variance (+/- 4)
    const attributes: PlayerAttributes = {
      scoring: Math.min(100, Math.max(20, baseScoring + this.rng.nextInt(-4, 4))),
      doubling: Math.min(100, Math.max(20, baseDoubling + this.rng.nextInt(-4, 4))),
      consistency: Math.min(100, Math.max(20, baseConsistency + this.rng.nextInt(-4, 4))),
      pressure: Math.min(100, Math.max(20, basePressure + this.rng.nextInt(-4, 4))),
      stamina: Math.min(100, Math.max(20, baseStamina + this.rng.nextInt(-4, 4))),
      potential: this.rng.nextInt(65, 88),
      workEthic: this.rng.nextInt(40, 85),
      professionalism: this.rng.nextInt(40, 85)
    };

    const player = new Player(
      playerId,
      options.name,
      options.gender,
      options.nationality,
      age,
      attributes
    );

    if (options.homeBaseId) {
      player.homeBaseId = options.homeBaseId;
    }

    return player;
  }

  /**
   * Generates a realistic AI opponent for tournaments or exhibition
   */
  public createAIOpponent(tier: 'pub' | 'amateur' | 'semi_pro' | 'pro' | 'elite', customName?: string): Player {
    const firstNames = ['Dave', 'Gary', 'Mick', 'Phil', 'Steve', 'Robbie', 'John', 'Liam', 'Simon', 'Dennis', 'Wayne', 'Colin', 'Terry'];
    const lastNames = ['Smith', 'Taylor', 'Wright', 'Anderson', 'Cross', 'Lewis', 'Wade', 'Cullen', 'Chisnall', 'Bunting', 'Clayton', 'Noppert'];
    const name = customName ?? `${this.rng.pickOne(firstNames)} "${this.generateNickname()}" ${this.rng.pickOne(lastNames)}`;

    let targetRating = 45;
    let potential = 60;

    if (tier === 'pub') targetRating = this.rng.nextInt(35, 48);
    else if (tier === 'amateur') targetRating = this.rng.nextInt(45, 58);
    else if (tier === 'semi_pro') targetRating = this.rng.nextInt(58, 72);
    else if (tier === 'pro') targetRating = this.rng.nextInt(72, 85);
    else if (tier === 'elite') targetRating = this.rng.nextInt(86, 96);

    const attributes: PlayerAttributes = {
      scoring: Math.min(100, Math.max(20, targetRating + this.rng.nextInt(-3, 3))),
      doubling: Math.min(100, Math.max(20, targetRating + this.rng.nextInt(-3, 3))),
      consistency: Math.min(100, Math.max(20, targetRating + this.rng.nextInt(-3, 3))),
      pressure: Math.min(100, Math.max(20, targetRating + this.rng.nextInt(-3, 3))),
      stamina: Math.min(100, Math.max(20, targetRating + this.rng.nextInt(-3, 3))),
      potential: Math.min(100, targetRating + this.rng.nextInt(5, 15)),
      workEthic: this.rng.nextInt(50, 90),
      professionalism: this.rng.nextInt(50, 90)
    };

    const player = new Player(
      `ai-${Date.now()}-${this.rng.nextInt(1000, 9999)}`,
      name,
      'male',
      this.rng.pickOne(['England', 'Scotland', 'Wales', 'Netherlands', 'Germany', 'Australia', 'Ireland', 'Belgium']),
      this.rng.nextInt(20, 52),
      attributes
    );

    if (tier === 'pub') player.tier = 'casual';
    else if (tier === 'amateur') player.tier = 'amateur';
    else if (tier === 'semi_pro') player.tier = 'semi_pro';
    else if (tier === 'pro') player.tier = 'pro';
    else if (tier === 'elite') player.tier = 'elite';

    return player;
  }

  private generateNickname(): string {
    const nicks = ['The Hammer', 'Lightning', 'The Bull', 'The Viper', 'Dynamite', 'The Wizard', 'The Sniper', 'The Viking', 'The Machine', 'Ice Man'];
    return this.rng.pickOne(nicks);
  }
}
