import { Player } from '../player/Player';
import { AudioManager } from '../audio/AudioManager';

export type MindGameStanceType = 'ice_cold' | 'psychological_needle' | 'fiery_staredown' | 'gracious_respect';

export interface MindGameStance {
  id: MindGameStanceType;
  title: string;
  subtitle: string;
  description: string;
  iconName: 'Shield' | 'Flame' | 'Zap' | 'Heart';
  playerEffectsSummary: string;
  opponentEffectsSummary: string;
  crowdAtmosphere: string;
  playerConfidenceDelta: number;
  playerFormDelta: number;
  playerComposureDelta: number;
  opponentConfidenceDelta: number;
  crowdHostilityDelta: number;
}

export interface MindGameResult {
  stance: MindGameStance;
  playerConfidenceDelta: number;
  playerFormDelta: number;
  playerComposureDelta: number;
  opponentConfidenceDelta: number;
  crowdHostilityDelta: number;
  dialogueNarrative: string;
}

export const MIND_GAME_STANCES: Record<MindGameStanceType, MindGameStance> = {
  ice_cold: {
    id: 'ice_cold',
    title: 'Ice-Cold Professional',
    subtitle: 'Robotic Poise & Methodical Rhythm',
    description: 'Ignore all theatrics, lock gaze firmly on the target, and refuse to engage in psychological warfare.',
    iconName: 'Shield',
    playerEffectsSummary: '+8 Starting Confidence, +5 Composure',
    opponentEffectsSummary: 'Neutral (Undaunted)',
    crowdAtmosphere: 'Intense hushed arena anticipation',
    playerConfidenceDelta: 8,
    playerFormDelta: 2,
    playerComposureDelta: 5,
    opponentConfidenceDelta: 0,
    crowdHostilityDelta: -5
  },
  psychological_needle: {
    id: 'psychological_needle',
    title: 'Psychological Needle',
    subtitle: 'Verbal Jabs & Mind Games',
    description: 'Throw subtle verbal barbs in the tunnel, pointing out past high-pressure checkout blunders.',
    iconName: 'Zap',
    playerEffectsSummary: '+5 Confidence',
    opponentEffectsSummary: '-12 Opponent Confidence, -5 Opponent Composure',
    crowdAtmosphere: 'Sparks partisan crowd whistling and jeers',
    playerConfidenceDelta: 5,
    playerFormDelta: 0,
    playerComposureDelta: 0,
    opponentConfidenceDelta: -12,
    crowdHostilityDelta: 20
  },
  fiery_staredown: {
    id: 'fiery_staredown',
    title: 'Fiery Stage Staredown',
    subtitle: 'Raw Adrenaline & Unflinching Intimidation',
    description: 'Lock eyes with your opponent at the stage curtains, roaring with veins bulging to fire up the crowd.',
    iconName: 'Flame',
    playerEffectsSummary: '+10 Form, +6 Confidence (Heightened Heartbeat)',
    opponentEffectsSummary: '-6 Opponent Confidence',
    crowdAtmosphere: 'Arena erupts into a chanting deafening frenzy',
    playerConfidenceDelta: 6,
    playerFormDelta: 10,
    playerComposureDelta: -3,
    opponentConfidenceDelta: -6,
    crowdHostilityDelta: 10
  },
  gracious_respect: {
    id: 'gracious_respect',
    title: 'Gracious Sportsmanship',
    subtitle: 'Gentleman of the Oche',
    description: 'Offer a genuine handshake, acknowledge their class, and win the hearts of the neutral supporters.',
    iconName: 'Heart',
    playerEffectsSummary: '+5 Confidence, +8 Pressure Resistance',
    opponentEffectsSummary: '+3 Opponent Confidence',
    crowdAtmosphere: 'Universal backing and thunderous ovation',
    playerConfidenceDelta: 5,
    playerFormDelta: 3,
    playerComposureDelta: 8,
    opponentConfidenceDelta: 3,
    crowdHostilityDelta: -15
  }
};

export class MindGamesManager {
  /**
   * Evaluates and applies psychological stance to player and opponent
   */
  public static applyStance(
    stanceType: MindGameStanceType,
    player: Player,
    opponent: Player
  ): MindGameResult {
    const stance = MIND_GAME_STANCES[stanceType];

    // Apply player state changes
    player.adjustConfidence(stance.playerConfidenceDelta);
    player.state.form = Math.min(100, Math.max(0, player.state.form + stance.playerFormDelta));
    player.attributes.pressure = Math.min(100, Math.max(0, player.attributes.pressure + stance.playerComposureDelta));

    // Apply opponent state changes
    opponent.adjustConfidence(stance.opponentConfidenceDelta);

    // Dynamic narration
    let narrative = '';
    switch (stanceType) {
      case 'ice_cold':
        narrative = `${player.name} maintains an icy poker face. ${opponent.name} finds nothing to latch onto as the match kicks off in clinical fashion.`;
        AudioManager.playCrowdCheer(2.0);
        break;
      case 'psychological_needle':
        narrative = `${player.name} plants a sharp verbal barb backstage. ${opponent.name} looks visibly agitated and steps to the oche under pressure!`;
        AudioManager.playCrowdWhistle();
        break;
      case 'fiery_staredown':
        narrative = `${player.name} roars into the arena spotlight! The crowd goes wild as ${opponent.name} takes a backward step before the first leg!`;
        AudioManager.playCrowdCheer(3.5);
        break;
      case 'gracious_respect':
        narrative = `${player.name} extends a heartfelt fist bump to ${opponent.name}. The arena applauds true darting sportsmanship.`;
        AudioManager.playCrowdCheer(2.5);
        break;
    }

    return {
      stance,
      playerConfidenceDelta: stance.playerConfidenceDelta,
      playerFormDelta: stance.playerFormDelta,
      playerComposureDelta: stance.playerComposureDelta,
      opponentConfidenceDelta: stance.opponentConfidenceDelta,
      crowdHostilityDelta: stance.crowdHostilityDelta,
      dialogueNarrative: narrative
    };
  }

  public static getStance(stanceType: MindGameStanceType): MindGameStance {
    return MIND_GAME_STANCES[stanceType];
  }

  public static getAllStances(): MindGameStance[] {
    return Object.values(MIND_GAME_STANCES);
  }
}
