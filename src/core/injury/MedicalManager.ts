/**
 * Medical & Physiotherapy Manager
 * Coordinates injury treatments, fatigue rehabilitation, weekly healing, and dynamic injury risks.
 * In accordance with Phase 10.6 & 14.7 of the Master Technical Blueprint.
 */

import { Player } from '../player/Player';
import { Injury, InjuryType, InjurySeverity, InjuryFactory, INJURY_DEFINITIONS } from './Injury';
import { IRandomProvider, DefaultRandomProvider } from '../random/RandomProvider';

export type TreatmentType =
  | 'ice_and_rest'
  | 'physiotherapy'
  | 'specialist_rehab'
  | 'sports_psychology';

export interface TreatmentOption {
  id: TreatmentType;
  name: string;
  cost: number;
  durationReductionWeeks: number;
  fatigueRestored: number;
  confidenceBonus: number;
  description: string;
  targetInjuryType?: InjuryType;
}

export const TREATMENT_OPTIONS: Record<TreatmentType, TreatmentOption> = {
  ice_and_rest: {
    id: 'ice_and_rest',
    name: 'Cold Therapy & Arm Rest',
    cost: 0,
    durationReductionWeeks: 0,
    fatigueRestored: 20,
    confidenceBonus: 0,
    description: 'Conservative home icing, muscle balm, and complete throwing rest for the arm.'
  },
  physiotherapy: {
    id: 'physiotherapy',
    name: 'Intensive Physiotherapy Session',
    cost: 75,
    durationReductionWeeks: 1,
    fatigueRestored: 30,
    confidenceBonus: 4,
    description: 'Deep tissue therapy, targeted tendon dry needling, and joint mobilization to cut 1 week off recovery.'
  },
  specialist_rehab: {
    id: 'specialist_rehab',
    name: 'Harley Street Specialist Clinic',
    cost: 250,
    durationReductionWeeks: 2,
    fatigueRestored: 50,
    confidenceBonus: 10,
    description: 'Elite sports ultrasound rehab, anti-inflammatory treatment, and custom biomechanical brace. Cuts 2 weeks off recovery.'
  },
  sports_psychology: {
    id: 'sports_psychology',
    name: 'Sports Psychology Consultation',
    cost: 150,
    durationReductionWeeks: 3,
    fatigueRestored: 20,
    confidenceBonus: 25,
    description: 'Specialized neuro-cognitive therapy targeted at curing release anxiety, panic hesitation, and Dartitis.'
  }
};

export interface TreatmentCostDetails {
  cost: number;
  isFreeMonthly: boolean;
  usesThisMonth: number;
  monthlyQuotaReached: boolean;
}

export interface TreatmentResult {
  success: boolean;
  message: string;
  cost: number;
  fatigueReduced: number;
  confidenceGained: number;
  weeksSaved: number;
  injuryHealed?: boolean;
}

export class MedicalManager {
  public static readonly COLD_THERAPY_BASE_COST = 30;

  /**
   * Retrieves current pricing and monthly free quota status for a treatment
   */
  public static getTreatmentDetails(
    player: Player,
    treatmentId: TreatmentType,
    currentMonth: number = 1,
    currentYear: number = 1
  ): TreatmentCostDetails {
    if (treatmentId !== 'ice_and_rest') {
      const t = TREATMENT_OPTIONS[treatmentId];
      return {
        cost: t ? t.cost : 0,
        isFreeMonthly: false,
        usesThisMonth: 0,
        monthlyQuotaReached: false
      };
    }

    // Auto-reset when month or year changes
    if (player.lastColdTherapyMonth !== currentMonth || player.lastColdTherapyYear !== currentYear) {
      player.coldTherapyUsesThisMonth = 0;
      player.lastColdTherapyMonth = currentMonth;
      player.lastColdTherapyYear = currentYear;
    }

    const uses = player.coldTherapyUsesThisMonth || 0;
    if (uses === 0) {
      return {
        cost: 0,
        isFreeMonthly: true,
        usesThisMonth: 0,
        monthlyQuotaReached: false
      };
    }

    return {
      cost: MedicalManager.COLD_THERAPY_BASE_COST,
      isFreeMonthly: false,
      usesThisMonth: uses,
      monthlyQuotaReached: true
    };
  }

  /**
   * Applies treatment to an active player injury or relieves fatigue
   */
  public static applyTreatment(
    player: Player,
    treatmentId: TreatmentType,
    targetInjuryId?: string,
    currentMonth: number = 1,
    currentYear: number = 1
  ): TreatmentResult {
    const treatment = TREATMENT_OPTIONS[treatmentId];
    if (!treatment) {
      return { success: false, message: 'Invalid treatment protocol.', cost: 0, fatigueReduced: 0, confidenceGained: 0, weeksSaved: 0 };
    }

    const costDetails = this.getTreatmentDetails(player, treatmentId, currentMonth, currentYear);
    const effectiveCost = costDetails.cost;

    if (player.bankBalance < effectiveCost) {
      return {
        success: false,
        message: `Insufficient funds: ${treatment.name} costs £${effectiveCost}${treatmentId === 'ice_and_rest' ? ' (1 free monthly session already used)' : ''}, but balance is £${player.bankBalance}.`,
        cost: 0,
        fatigueReduced: 0,
        confidenceGained: 0,
        weeksSaved: 0
      };
    }

    // Deduct cost
    player.bankBalance -= effectiveCost;

    if (treatmentId === 'ice_and_rest') {
      player.coldTherapyUsesThisMonth = (player.coldTherapyUsesThisMonth || 0) + 1;
      player.lastColdTherapyMonth = currentMonth;
      player.lastColdTherapyYear = currentYear;
    }

    // Apply fatigue reduction & confidence bonus
    player.recoverFatigue(treatment.fatigueRestored);
    if (treatment.confidenceBonus > 0) {
      player.adjustConfidence(treatment.confidenceBonus);
    }

    // Target active injury
    let injury: Injury | undefined;
    if (targetInjuryId) {
      injury = player.activeInjuries.find(i => i.id === targetInjuryId);
    } else if (player.activeInjuries.length > 0) {
      injury = player.activeInjuries[0];
    }

    if (!injury) {
      return {
        success: true,
        message: `${treatment.name} administered. Relieved fatigue by ${treatment.fatigueRestored}%. No active injuries present.`,
        cost: effectiveCost,
        fatigueReduced: treatment.fatigueRestored,
        confidenceGained: treatment.confidenceBonus,
        weeksSaved: 0
      };
    }

    // If Dartitis treatment used on physical injury or vice versa
    if (treatmentId === 'sports_psychology' && injury.type !== 'dartitis') {
      // Psychological treatment helps confidence but less effective on tendon tears
      injury.weeksRemaining = Math.max(1, injury.weeksRemaining - 1);
    } else {
      injury.weeksRemaining = Math.max(0, injury.weeksRemaining - treatment.durationReductionWeeks);
    }

    injury.isTreatedThisWeek = true;

    let injuryHealed = false;
    if (injury.weeksRemaining <= 0) {
      injuryHealed = true;
      player.activeInjuries = player.activeInjuries.filter(i => i.id !== injury!.id);
      player.injuryHistory.push(`${injury.name} (${injury.severity}) - Fully Rehabilitated`);
    }

    return {
      success: true,
      message: injuryHealed
        ? `Medical Miracle! ${injury.name} has completely healed after ${treatment.name}!`
        : `${treatment.name} applied to ${injury.name}. Remaining recovery reduced to ${injury.weeksRemaining} week(s).`,
      cost: effectiveCost,
      fatigueReduced: treatment.fatigueRestored,
      confidenceGained: treatment.confidenceBonus,
      weeksSaved: treatment.durationReductionWeeks,
      injuryHealed
    };
  }

  /**
   * Advances active injuries weekly: decrements time, clears healed injuries, resets treatment flag
   */
  public static advanceWeeklyMedical(player: Player, currentMonth?: number, currentYear?: number): string[] {
    if (currentMonth !== undefined) {
      if (player.lastColdTherapyMonth !== currentMonth || player.lastColdTherapyYear !== currentYear) {
        player.coldTherapyUsesThisMonth = 0;
        player.lastColdTherapyMonth = currentMonth;
        if (currentYear !== undefined) player.lastColdTherapyYear = currentYear;
      }
    }

    const messages: string[] = [];
    const remainingInjuries: Injury[] = [];

    for (const injury of player.activeInjuries) {
      // If not treated this week, natural healing progresses by 1 week
      if (!injury.isTreatedThisWeek) {
        injury.weeksRemaining -= 1;
      }
      injury.isTreatedThisWeek = false;

      if (injury.weeksRemaining <= 0) {
        messages.push(`Full Recovery: ${player.name} has recovered from ${injury.name}!`);
        player.injuryHistory.push(`${injury.name} (${injury.severity}) - Healed`);
        player.adjustConfidence(6);
      } else {
        remainingInjuries.push(injury);
        messages.push(`${player.name}'s ${injury.name} requires ${injury.weeksRemaining} more week(s) of rehabilitation.`);
      }
    }

    player.activeInjuries = remainingInjuries;
    return messages;
  }

  /**
   * Evaluates dynamic injury risk at week end based on fatigue, stamina, workload, and staff
   */
  public static evaluateDynamicInjuryRisk(
    player: Player,
    activityType: 'tournament' | 'train' | 'rest',
    rng: IRandomProvider = new DefaultRandomProvider()
  ): Injury | null {
    // If player already has 2 active injuries, do not stack further
    if (player.activeInjuries.length >= 2) return null;

    // Resting eliminates injury risk
    if (activityType === 'rest') return null;

    // Base risk increases with high fatigue and low stamina
    const fatigue = player.state.fatigue;
    const stamina = player.attributes.stamina;
    const confidence = player.state.confidence;

    // 1. Check Dartitis Risk (Psychological Block):
    // Triggered when confidence drops into crisis (< 25) while fatigue is high (> 45)
    if (confidence < 25 && fatigue > 45 && !player.activeInjuries.some(i => i.type === 'dartitis')) {
      const dartitisRoll = rng.next();
      if (dartitisRoll < 0.20) {
        const severity: InjurySeverity = confidence < 15 ? 'moderate' : 'mild';
        const dartitis = InjuryFactory.createInjury('dartitis', severity);
        player.activeInjuries.push(dartitis);
        return dartitis;
      }
    }

    // 2. Physical Strain Risk:
    // Safe threshold: fatigue < 40 has near 0% risk
    if (fatigue < 40) return null;

    // Risk scales from 2% at 40 fatigue up to 25% at 100 fatigue
    let injuryChance = ((fatigue - 35) / 65) * 0.22;

    // High stamina provides resistance (up to 40% reduction)
    injuryChance *= (1 - (stamina / 250));

    // Hired Physiotherapist staff bonus (halves injury risk!)
    if (player.hiredStaffIds) {
      if (player.hiredStaffIds.includes('physio-sarah')) {
        injuryChance *= 0.45; // 55% reduction
      } else if (player.hiredStaffIds.includes('physio-evans')) {
        injuryChance *= 0.65; // 35% reduction
      }
    }

    const roll = rng.next();
    if (roll < injuryChance) {
      // Pick random physical injury type
      const types: InjuryType[] = ['shoulder_strain', 'tennis_elbow', 'wrist_sprain', 'blister'];
      const chosenType = types[Math.floor(rng.next() * types.length)];

      // Severity determined by fatigue level
      let severity: InjurySeverity = 'mild';
      if (fatigue > 85) severity = 'severe';
      else if (fatigue > 65) severity = 'moderate';

      const injury = InjuryFactory.createInjury(chosenType, severity);
      player.activeInjuries.push(injury);
      return injury;
    }

    return null;
  }
}
