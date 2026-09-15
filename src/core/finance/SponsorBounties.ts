import { Player } from '../player/Player';

export type BountyType = 'hit_180s' | 'high_checkout' | 'win_major' | 'average_95';

export interface SponsorBounty {
  id: string;
  sponsorName: string;
  type: BountyType;
  title: string;
  description: string;
  targetValue: number;
  rewardMoney: number;
  completed: boolean;
}

export const BOUNTIES: Record<string, SponsorBounty> = {
  bounty_180s: {
    id: 'bounty_180s',
    sponsorName: 'ArrowCraft Precision',
    type: 'hit_180s',
    title: 'Maximum Overdrive',
    description: 'Hit five 180s in a single match.',
    targetValue: 5,
    rewardMoney: 1500,
    completed: false
  },
  bounty_high_checkout: {
    id: 'bounty_high_checkout',
    sponsorName: 'The Red Lion Tavern',
    type: 'high_checkout',
    title: 'The Big Fish',
    description: 'Hit a 170 checkout in any official match.',
    targetValue: 170,
    rewardMoney: 2000,
    completed: false
  },
  bounty_average: {
    id: 'bounty_average',
    sponsorName: 'Target Pro',
    type: 'average_95',
    title: 'Elite Consistency',
    description: 'Win a match with an average above 95.00.',
    targetValue: 95,
    rewardMoney: 2500,
    completed: false
  }
};
