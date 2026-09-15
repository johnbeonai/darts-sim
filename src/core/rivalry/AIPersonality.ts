import { Player } from '../player/Player';

export type AIPersonalityTrait = 'aggressive' | 'choker' | 'frontrunner' | 'methodical' | 'crowd_pleaser';

export interface AIPersonality {
  primaryTrait: AIPersonalityTrait;
  tiltFactor: number; // 0-100, how likely they are to collapse under pressure
  comebackFactor: number; // 0-100, how likely they are to rally when down
}

export class AIPersonalityManager {
  public static generatePersonality(): AIPersonality {
    const traits: AIPersonalityTrait[] = ['aggressive', 'choker', 'frontrunner', 'methodical', 'crowd_pleaser'];
    return {
      primaryTrait: traits[Math.floor(Math.random() * traits.length)],
      tiltFactor: Math.floor(Math.random() * 50) + 20,
      comebackFactor: Math.floor(Math.random() * 50) + 20,
    };
  }

  public static applyPersonalityModifiers(player: Player, legsWon: number, legsLost: number) {
    if (!player.state) return;
    
    // Stub for evolving AI form during a match based on their personality
    const diff = legsWon - legsLost;
    if (diff < -2) {
      // Losing badly
      player.state.confidence = Math.max(0, player.state.confidence - 5);
    } else if (diff > 2) {
      // Winning comfortably
      player.state.confidence = Math.min(100, player.state.confidence + 5);
    }
  }
}
