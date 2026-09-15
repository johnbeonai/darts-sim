export type PerkId = 'clutch_finisher' | 'crowd_favorite' | 'fast_starter' | 'consistent_rhythm' | 'major_player';

export interface PerkDef {
  id: PerkId;
  name: string;
  description: string;
  xpCost: number;
}

export const PERK_DEFINITIONS: Record<PerkId, PerkDef> = {
  clutch_finisher: {
    id: 'clutch_finisher',
    name: 'Clutch Finisher',
    description: 'Gain a doubling accuracy bonus when throwing for a match dart.',
    xpCost: 1500
  },
  crowd_favorite: {
    id: 'crowd_favorite',
    name: 'Crowd Favorite',
    description: 'Crowd hostility from playing rivals or away games is halved.',
    xpCost: 1200
  },
  fast_starter: {
    id: 'fast_starter',
    name: 'Fast Starter',
    description: 'Begin every match with a temporary +5 Form bonus for the first 3 legs.',
    xpCost: 1000
  },
  consistent_rhythm: {
    id: 'consistent_rhythm',
    name: 'Consistent Rhythm',
    description: 'Reduces the chance of extreme low scores (sub-45 visits) during bad form.',
    xpCost: 1800
  },
  major_player: {
    id: 'major_player',
    name: 'Major Player',
    description: 'Gain +10 Confidence and +5 Pressure resistance in TV Major tournaments.',
    xpCost: 2500
  }
};
