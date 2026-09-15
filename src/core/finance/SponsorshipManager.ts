/**
 * Sponsorship & Commercial Contracts Model
 * Implements Section 59, 62 & Phase 10 of the Master Technical Blueprint.
 */

import { Player, CareerTier } from '../player/Player';

export type SponsorshipTier = 'pub' | 'regional' | 'premier';
export type SponsorshipType = 'primary' | 'apparel' | 'equipment';

export interface SponsorshipContract {
  id: string;
  sponsorName: string;
  tagline: string;
  tier: SponsorshipTier;
  type: SponsorshipType;
  weeklyStipend: number;        // Guaranteed weekly payout (£)
  tournamentWinBonus: number;   // Bonus paid upon winning any tournament (£)
  shopDiscountPercent: number;  // Equipment shop discount (0 - 30%)
  durationWeeks: number;
  weeksRemaining: number;
  totalPaidToDate: number;
  isActive: boolean;
  requirements: {
    minTier: CareerTier;
    minRank?: number;
    minConfidence?: number;
  };
}

export const SPONSORSHIP_CATALOG: Omit<SponsorshipContract, 'weeksRemaining' | 'totalPaidToDate' | 'isActive'>[] = [
    // ==================== MORE PUB / LOCAL SPONSORS ====================
  {
    id: 'sponsor-smith-roofing',
    sponsorName: 'Smith & Sons Roofing',
    tagline: 'Covering Coventry from the elements.',
    tier: 'pub',
    type: 'apparel',
    weeklyStipend: 25,
    tournamentWinBonus: 40,
    shopDiscountPercent: 0,
    durationWeeks: 10,
    requirements: { minTier: 'pub' }
  },
  {
    id: 'sponsor-kings-head',
    sponsorName: 'The Kings Head Pub',
    tagline: 'Best carvery on a Sunday. Best darts on a Friday.',
    tier: 'pub',
    type: 'primary',
    weeklyStipend: 50,
    tournamentWinBonus: 100,
    shopDiscountPercent: 5,
    durationWeeks: 20,
    requirements: { minTier: 'pub', minConfidence: 50 }
  },

  // ==================== MORE REGIONAL / AMATEUR ====================
  {
    id: 'sponsor-midlands-bank',
    sponsorName: 'Midlands Community Bank',
    tagline: 'Banking on local talent.',
    tier: 'regional',
    type: 'primary',
    weeklyStipend: 200,
    tournamentWinBonus: 500,
    shopDiscountPercent: 0,
    durationWeeks: 52,
    requirements: { minTier: 'amateur', minRank: 100 }
  },
  {
    id: 'sponsor-northern-flights',
    sponsorName: 'Northern Flights',
    tagline: 'Durable flights for the grueling challenge tour.',
    tier: 'regional',
    type: 'equipment',
    weeklyStipend: 150,
    tournamentWinBonus: 300,
    shopDiscountPercent: 20,
    durationWeeks: 26,
    requirements: { minTier: 'amateur', minRank: 150 }
  },

  // ==================== NATIONAL / SEMI-PRO ====================
  {
    id: 'sponsor-british-rail',
    sponsorName: 'British Rail Services',
    tagline: 'Keeping the nation moving.',
    tier: 'regional',
    type: 'primary',
    weeklyStipend: 450,
    tournamentWinBonus: 1000,
    shopDiscountPercent: 0,
    durationWeeks: 26,
    requirements: { minTier: 'semi_pro', minRank: 80 }
  },
  {
    id: 'sponsor-bullseye-bet',
    sponsorName: 'Bullseye Betting Ltd',
    tagline: 'Odds on you hitting the double.',
    tier: 'regional',
    type: 'apparel',
    weeklyStipend: 350,
    tournamentWinBonus: 800,
    shopDiscountPercent: 10,
    durationWeeks: 52,
    requirements: { minTier: 'semi_pro', minRank: 64 }
  },

  // ==================== ELITE / GLOBAL ====================
  {
    id: 'sponsor-global-airlines',
    sponsorName: 'Global Airways',
    tagline: 'Fly high, aim higher.',
    tier: 'premier',
    type: 'primary',
    weeklyStipend: 4000,
    tournamentWinBonus: 10000,
    shopDiscountPercent: 0,
    durationWeeks: 52,
    requirements: { minTier: 'elite', minRank: 4 }
  },
  {
    id: 'sponsor-swiss-watches',
    sponsorName: 'Luxus Swiss Timepieces',
    tagline: 'Precision timing for the elite.',
    tier: 'premier',
    type: 'apparel',
    weeklyStipend: 2500,
    tournamentWinBonus: 8000,
    shopDiscountPercent: 50,
    durationWeeks: 52,
    requirements: { minTier: 'elite', minRank: 8 }
  },

  // ==================== PUB / LOCAL SPONSORS ====================
  {
    id: 'sponsor-red-lion',
    sponsorName: 'The Red Lion Tavern',
    tagline: 'Your local darts home in Coventry. Cold pints, warm trebles.',
    tier: 'pub',
    type: 'primary',
    weeklyStipend: 30,
    tournamentWinBonus: 60,
    shopDiscountPercent: 0,
    durationWeeks: 12,
    requirements: { minTier: 'pub' }
  },
  {
    id: 'sponsor-crown-ale',
    sponsorName: 'Crown Ale Breweries',
    tagline: 'Traditional cask ales backing Midlands darts talent.',
    tier: 'pub',
    type: 'apparel',
    weeklyStipend: 45,
    tournamentWinBonus: 85,
    shopDiscountPercent: 5,
    durationWeeks: 16,
    requirements: { minTier: 'pub', minConfidence: 45 }
  },
  {
    id: 'sponsor-midlands-haulage',
    sponsorName: 'Midlands Scrap & Logistics',
    tagline: 'Heavy freight moving British arrows forward.',
    tier: 'pub',
    type: 'primary',
    weeklyStipend: 40,
    tournamentWinBonus: 75,
    shopDiscountPercent: 0,
    durationWeeks: 20,
    requirements: { minTier: 'pub' }
  },

  // ==================== REGIONAL / AMATEUR BRANDS ====================
  {
    id: 'sponsor-arrowcraft',
    sponsorName: 'ArrowCraft Precision UK',
    tagline: 'British tungsten craftsmanship for rising county champions.',
    tier: 'regional',
    type: 'equipment',
    weeklyStipend: 140,
    tournamentWinBonus: 250,
    shopDiscountPercent: 15,
    durationWeeks: 26,
    requirements: { minTier: 'amateur', minRank: 160 }
  },
  {
    id: 'sponsor-bullseye-chain',
    sponsorName: 'Bullseye Sports Bars',
    tagline: 'The UK premier digital darts social lounge network.',
    tier: 'regional',
    type: 'primary',
    weeklyStipend: 185,
    tournamentWinBonus: 320,
    shopDiscountPercent: 10,
    durationWeeks: 26,
    requirements: { minTier: 'amateur', minRank: 120 }
  },
  {
    id: 'sponsor-viper-precision',
    sponsorName: 'Viper Precision Flights',
    tagline: 'Aerodynamic aerodynamic performance with zero flight dropouts.',
    tier: 'regional',
    type: 'equipment',
    weeklyStipend: 220,
    tournamentWinBonus: 400,
    shopDiscountPercent: 20,
    durationWeeks: 26,
    requirements: { minTier: 'semi_pro', minRank: 80 }
  },

  // ==================== PREMIER / PRO TOUR MANUFACTURERS ====================
  {
    id: 'sponsor-targetforce',
    sponsorName: 'Targetforce Global',
    tagline: 'Arming world champions with supersonic tungsten technology.',
    tier: 'premier',
    type: 'equipment',
    weeklyStipend: 850,
    tournamentWinBonus: 1600,
    shopDiscountPercent: 25,
    durationWeeks: 52,
    requirements: { minTier: 'pro', minRank: 40 }
  },
  {
    id: 'sponsor-wincraft-pro',
    sponsorName: 'WinCraft Pro International',
    tagline: 'The legendary darting heritage of champions worldwide.',
    tier: 'premier',
    type: 'primary',
    weeklyStipend: 1350,
    tournamentWinBonus: 2800,
    shopDiscountPercent: 30,
    durationWeeks: 52,
    requirements: { minTier: 'pro', minRank: 24 }
  },
  {
    id: 'sponsor-apex-media',
    sponsorName: 'Apex Darts Worldwide Broadcast',
    tagline: 'Global television streaming sports entertainment.',
    tier: 'premier',
    type: 'primary',
    weeklyStipend: 2200,
    tournamentWinBonus: 5000,
    shopDiscountPercent: 15,
    durationWeeks: 52,
    requirements: { minTier: 'elite', minRank: 10 }
  }
];

export class SponsorshipManager {
  private static readonly TIER_ORDER: Record<CareerTier, number> = {
    casual: 0,
    pub: 1,
    amateur: 2,
    semi_pro: 3,
    pro: 4,
    elite: 5
  };

  /**
   * Retrieves all available sponsorship offers that the player qualifies for
   */
  public static getAvailableOffers(player: Player, activeContracts: SponsorshipContract[]): SponsorshipContract[] {
    const pTierVal = this.TIER_ORDER[player.tier] ?? 1;
    const activeIds = activeContracts.map(c => c.id);

    return SPONSORSHIP_CATALOG.filter(item => {
      // Cannot sign duplicate sponsor
      if (activeIds.includes(item.id)) return false;

      // Tier check
      const reqTierVal = this.TIER_ORDER[item.requirements.minTier];
      if (pTierVal < reqTierVal) return false;

      // World Rank check
      if (item.requirements.minRank !== undefined) {
        if (player.ranking <= 0 || player.ranking > item.requirements.minRank) {
          return false;
        }
      }

      // Confidence check
      if (item.requirements.minConfidence !== undefined) {
        if (player.state.confidence < item.requirements.minConfidence) {
          return false;
        }
      }

      return true;
    }).map(item => ({
      ...item,
      weeksRemaining: item.durationWeeks,
      totalPaidToDate: 0,
      isActive: true
    }));
  }

  /**
   * Signs a sponsorship contract if player has fewer than 2 active sponsors
   */
  public static signContract(
    player: Player,
    offerId: string,
    activeContracts: SponsorshipContract[]
  ): { success: boolean; message: string; contract?: SponsorshipContract } {
    if (activeContracts.length >= 2) {
      return {
        success: false,
        message: 'Maximum 2 active sponsorship contracts allowed simultaneously. Terminate or wait for a contract to expire first.'
      };
    }

    const available = this.getAvailableOffers(player, activeContracts);
    const targetOffer = available.find(o => o.id === offerId);

    if (!targetOffer) {
      return {
        success: false,
        message: 'You do not meet the ranking or tier criteria for this sponsorship contract.'
      };
    }

    // Clone contract
    const contract: SponsorshipContract = {
      ...targetOffer,
      weeksRemaining: targetOffer.durationWeeks,
      totalPaidToDate: 0,
      isActive: true
    };

    activeContracts.push(contract);

    return {
      success: true,
      message: `Successfully signed commercial partnership with ${contract.sponsorName}! Weekly stipend: £${contract.weeklyStipend}.`,
      contract
    };
  }

  /**
   * Processes weekly stipend payouts and contract countdowns
   */
  public static processWeeklyStipends(
    player: Player,
    activeContracts: SponsorshipContract[]
  ): { totalStipendPaid: number; expiredContracts: string[]; messages: string[] } {
    let totalStipendPaid = 0;
    const expiredContracts: string[] = [];
    const messages: string[] = [];

    for (let i = activeContracts.length - 1; i >= 0; i--) {
      const contract = activeContracts[i];
      if (!contract.isActive) continue;

      // Credit stipend
      player.bankBalance += contract.weeklyStipend;
      contract.totalPaidToDate += contract.weeklyStipend;
      totalStipendPaid += contract.weeklyStipend;
      contract.weeksRemaining--;

      messages.push(`${contract.sponsorName}: Paid £${contract.weeklyStipend} weekly stipend (${contract.weeksRemaining} wks remaining).`);

      if (contract.weeksRemaining <= 0) {
        contract.isActive = false;
        expiredContracts.push(contract.sponsorName);
        activeContracts.splice(i, 1);
        messages.push(`Contract with ${contract.sponsorName} has completed! Total career payout: £${contract.totalPaidToDate}.`);
      }
    }

    return { totalStipendPaid, expiredContracts, messages };
  }

  /**
   * Awards tournament win bonus across all active sponsors
   */
  public static awardWinBonus(
    player: Player,
    tourneyName: string,
    activeContracts: SponsorshipContract[]
  ): { totalBonus: number; messages: string[] } {
    let totalBonus = 0;
    const messages: string[] = [];

    for (const contract of activeContracts) {
      if (!contract.isActive) continue;
      if (contract.tournamentWinBonus > 0) {
        player.bankBalance += contract.tournamentWinBonus;
        contract.totalPaidToDate += contract.tournamentWinBonus;
        totalBonus += contract.tournamentWinBonus;
        messages.push(`🏆 ${contract.sponsorName}: Awarded £${contract.tournamentWinBonus} win bonus for ${tourneyName}!`);
      }
    }

    return { totalBonus, messages };
  }

  /**
   * Computes the maximum equipment shop discount across active sponsors
   */
  public static getShopDiscount(activeContracts: SponsorshipContract[]): number {
    let maxDiscount = 0;
    for (const c of activeContracts) {
      if (c.isActive && c.shopDiscountPercent > maxDiscount) {
        maxDiscount = c.shopDiscountPercent;
      }
    }
    return maxDiscount;
  }
}
