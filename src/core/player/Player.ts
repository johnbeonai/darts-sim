/**
 * Core Player Model
 * Implements Section 10-15 of the Master Technical Blueprint.
 */

import {
  EquipmentItem,
  EquippedLoadout,
  EquipmentModifiers,
  getDefaultEquipmentLoadout,
  getEquipmentItemById,
  calculateLoadoutModifiers
} from '../equipment/EquipmentItem';
import { SponsorshipContract } from '../finance/SponsorshipManager';
import { Injury, InjuryPenalties } from '../injury/Injury';

export type Gender = 'male' | 'female' | 'other';
export type CareerTier = 'casual' | 'pub' | 'amateur' | 'semi_pro' | 'pro' | 'elite';

export interface PlayerAttributes {
  // Base Attributes (0 - 100)
  scoring: number;
  doubling: number;
  consistency: number;
  pressure: number;
  stamina: number;

  // Hidden Development Attributes (0 - 100)
  potential: number;
  workEthic: number;
  professionalism: number;
}

export interface PlayerDynamicState {
  confidence: number; // 0 - 100 (baseline 50)
  fatigue: number;    // 0 - 100 (baseline 0)
  form: number;       // 0 - 100 (baseline 50)
}

export interface EquipmentProfile {
  name: string;
  weightGrams: number; // e.g. 21 - 26g
  scoringModifier: number; // subtle distribution modifier, not flat +5
  doublingModifier?: number;
  consistencyModifier: number;
  fatigueModifier?: number;
  completeSetId?: string;
  barrelId?: string;
  shaftId?: string;
  flightId?: string;
}

export interface PlayerCareerStats {
  matchesPlayed: number;
  matchesWon: number;
  legsPlayed: number;
  legsWon: number;
  total180s: number;
  total140s: number;
  total100s: number;
  highestCheckout: number;
  dartsThrown: number;
  totalPointsScored: number;
  nineDarters?: number;
}

import { PerkId } from './SkillTree';

export class Player {
  public attributes: PlayerAttributes;
  public state: PlayerDynamicState;
  public equipment: EquipmentProfile;
  public stats: PlayerCareerStats;

  public tier: CareerTier = 'amateur';
  public ranking: number = 0;
  public rankingPoints: number = 0;
  public prizeMoneyTotal: number = 0;
  public bankBalance: number = 250; // Starting money (£)

  public xp: number = 0;
  public perks: PerkId[] = [];

  // Phase 10: Inventory, Sponsorships, and Hired Support Staff
  public ownedEquipmentIds: string[] = ['barrel-brass-22', 'shaft-nylon-medium', 'flight-standard-100'];
  public equippedLoadout: EquippedLoadout;
  public activeSponsorships: SponsorshipContract[] = [];
  public activeBounties: string[] = []; // IDs of completed bounties
  public signatureDeal?: any; // To avoid circular imports if needed, or import SignatureEquipmentDeal
  public mediaProfile?: any;
  public aiPersonality?: any;
  public homeBaseId?: string; // References CITIES
  public activeLifestyleUpgrades?: string[];
  public hiredStaffIds: string[] = [];

  // Phase 8 & 12: Professional Tour Card & Q-School Progression
  public hasTourCard: boolean = false;
  public tourCardExpiryYear?: number;
  public qSchoolPoints: number = 0;
  public qSchoolFinalQualified: boolean = false;
  public hasEnteredQSchool: boolean = false;

  // Phase 10.6: Sports Injuries & Physical Condition
  public activeInjuries: Injury[] = [];
  public injuryHistory: string[] = [];
  public coldTherapyUsesThisMonth: number = 0;
  public lastColdTherapyMonth?: number;
  public lastColdTherapyYear?: number;

  public get hasActiveInjury(): boolean {
    return this.activeInjuries.length > 0;
  }

  public get totalInjuryPenalties(): InjuryPenalties {
    let scoring = 0;
    let doubling = 0;
    let consistency = 0;
    let pressure = 0;

    for (const inj of this.activeInjuries) {
      scoring += inj.penalties.scoring;
      doubling += inj.penalties.doubling;
      consistency += inj.penalties.consistency;
      pressure += inj.penalties.pressure;
    }

    return { scoring, doubling, consistency, pressure };
  }

  constructor(
    public id: string,
    public name: string,
    public gender: Gender,
    public nationality: string,
    public age: number,
    attributes: Partial<PlayerAttributes> = {},
    state: Partial<PlayerDynamicState> = {},
    equipment?: Partial<EquipmentProfile>
  ) {
    this.attributes = {
      scoring: Math.min(100, Math.max(0, attributes.scoring ?? 45)),
      doubling: Math.min(100, Math.max(0, attributes.doubling ?? 45)),
      consistency: Math.min(100, Math.max(0, attributes.consistency ?? 45)),
      pressure: Math.min(100, Math.max(0, attributes.pressure ?? 45)),
      stamina: Math.min(100, Math.max(0, attributes.stamina ?? 50)),
      potential: Math.min(100, Math.max(0, attributes.potential ?? 70)),
      workEthic: Math.min(100, Math.max(0, attributes.workEthic ?? 60)),
      professionalism: Math.min(100, Math.max(0, attributes.professionalism ?? 60))
    };

    this.state = {
      confidence: Math.min(100, Math.max(0, state.confidence ?? 50)),
      fatigue: Math.min(100, Math.max(0, state.fatigue ?? 0)),
      form: Math.min(100, Math.max(0, state.form ?? 50))
    };

    this.equippedLoadout = getDefaultEquipmentLoadout();

    this.equipment = {
      name: equipment?.name ?? 'Pub Starter Brass 22g',
      weightGrams: equipment?.weightGrams ?? 22,
      scoringModifier: equipment?.scoringModifier ?? 1.0,
      doublingModifier: equipment?.doublingModifier ?? 1.0,
      consistencyModifier: equipment?.consistencyModifier ?? 1.0,
      fatigueModifier: equipment?.fatigueModifier ?? 1.0,
      completeSetId: equipment?.completeSetId,
      barrelId: equipment?.barrelId ?? 'barrel-brass-22',
      shaftId: equipment?.shaftId ?? 'shaft-nylon-medium',
      flightId: equipment?.flightId ?? 'flight-standard-100'
    };

    this.stats = {
      matchesPlayed: 0,
      matchesWon: 0,
      legsPlayed: 0,
      legsWon: 0,
      total180s: 0,
      total140s: 0,
      total100s: 0,
      highestCheckout: 0,
      dartsThrown: 0,
      totalPointsScored: 0,
      nineDarters: 0
    };
  }

  public get careerAverage(): number {
    return this.stats.dartsThrown > 0
      ? Math.round(((this.stats.totalPointsScored / this.stats.dartsThrown) * 3) * 100) / 100
      : 0;
  }

  /**
   * Adjusts confidence dynamically based on match events
   */
  public adjustConfidence(delta: number): void {
    this.state.confidence = Math.min(100, Math.max(0, this.state.confidence + delta));
  }

  /**
   * Adds fatigue after legs/matches, mitigated by stamina and hired physiotherapist
   */
  public addFatigue(delta: number): void {
    const staminaDampening = 1.0 - (this.attributes.stamina / 200);
    const equipFatigueMod = this.equipment.fatigueModifier ?? 1.0;
    const actualDelta = Math.max(1, delta * staminaDampening * equipFatigueMod);
    this.state.fatigue = Math.min(100, Math.max(0, this.state.fatigue + actualDelta));
  }

  /**
   * Rests and recovers fatigue
   */
  public rest(recovery: number = 25): void {
    this.recoverFatigue(recovery);
  }

  /**
   * Directly reduces/recovers fatigue
   */
  public recoverFatigue(amount: number): void {
    this.state.fatigue = Math.max(0, this.state.fatigue - amount);
  }

  public reduceFatigue(amount: number): void {
    this.recoverFatigue(amount);
  }

  /**
   * Equips an item (either a complete set or an individual barrel, shaft, or flight)
   */
  public equipItem(item: EquipmentItem): void {
    if (!this.ownedEquipmentIds.includes(item.id)) {
      this.ownedEquipmentIds.push(item.id);
    }

    if (item.category === 'complete_set') {
      this.equippedLoadout.completeSetId = item.id;
      this.equippedLoadout.totalWeightGrams = item.weightGrams;
      this.equippedLoadout.modifiers = { ...item.modifiers };

      this.equipment = {
        name: item.name,
        weightGrams: item.weightGrams,
        scoringModifier: item.modifiers.scoringModifier,
        doublingModifier: item.modifiers.doublingModifier,
        consistencyModifier: item.modifiers.consistencyModifier,
        fatigueModifier: item.modifiers.fatigueModifier,
        completeSetId: item.id
      };
      return;
    }

    // Individual component equipped
    this.equippedLoadout.completeSetId = undefined;

    if (item.category === 'barrel') {
      this.equippedLoadout.barrelId = item.id;
      this.equippedLoadout.totalWeightGrams = item.weightGrams + 2; // +2g for stem and flight
    } else if (item.category === 'shaft') {
      this.equippedLoadout.shaftId = item.id;
    } else if (item.category === 'flight') {
      this.equippedLoadout.flightId = item.id;
    }

    const b = getEquipmentItemById(this.equippedLoadout.barrelId);
    const s = getEquipmentItemById(this.equippedLoadout.shaftId);
    const f = getEquipmentItemById(this.equippedLoadout.flightId);

    if (b && s && f) {
      const combinedMods = calculateLoadoutModifiers(b, s, f);
      this.equippedLoadout.modifiers = combinedMods;
      this.equipment = {
        name: `${b.name} Custom Setup`,
        weightGrams: this.equippedLoadout.totalWeightGrams,
        scoringModifier: combinedMods.scoringModifier,
        doublingModifier: combinedMods.doublingModifier,
        consistencyModifier: combinedMods.consistencyModifier,
        fatigueModifier: combinedMods.fatigueModifier,
        barrelId: b.id,
        shaftId: s.id,
        flightId: f.id
      };
    }
  }

  /**
   * Purchases an equipment item with optional sponsor discount applied
   */
  public buyEquipmentItem(item: EquipmentItem, discountPercent: number = 0): { success: boolean; message: string } {
    if (this.ownedEquipmentIds.includes(item.id)) {
      return { success: false, message: 'You already own this equipment item.' };
    }

    const effectiveDiscount = Math.min(50, Math.max(0, discountPercent));
    const finalPrice = Math.round(item.price * (1 - effectiveDiscount / 100));

    if (this.bankBalance < finalPrice) {
      return {
        success: false,
        message: `Insufficient funds. Price is £${finalPrice}, but your bank balance is £${this.bankBalance}.`
      };
    }

    this.bankBalance -= finalPrice;
    this.ownedEquipmentIds.push(item.id);

    return {
      success: true,
      message: `Purchased ${item.name} for £${finalPrice}${effectiveDiscount > 0 ? ` (${effectiveDiscount}% sponsor discount applied)` : ''}!`
    };
  }

  /**
   * Awards a PDC Tour Card for a specified number of years (default 2 years)
   */
  public awardTourCard(currentYear: number, durationYears: number = 2): void {
    this.hasTourCard = true;
    this.tourCardExpiryYear = currentYear + durationYears - 1;
    this.tier = 'pro';
  }

  /**
   * Revokes expired Tour Card and returns player to semi_pro tier
   */
  public revokeTourCard(): void {
    this.hasTourCard = false;
    this.tourCardExpiryYear = undefined;
    if (this.tier === 'pro' || this.tier === 'elite') {
      this.tier = 'semi_pro';
    }
  }
}
