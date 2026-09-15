import { Player } from '../player/Player';
import { DartResult } from '../match/DartResult';
import { Visit } from '../match/Visit';
import { IRandomProvider, DefaultRandomProvider } from '../random/RandomProvider';
import { TargetingEngine, Target } from './TargetingEngine';
export type { Target };

export interface MatchSituation {
  remainingScore: number;
  opponentRemaining: number;
  isDecidingLeg?: boolean;
  pressureMultiplier?: number; // 1.0 normal, up to 1.5 in high-stakes
}

/**
 * Performance Pipeline
 * Implements Section 31 of Technical Blueprint:
 * Base Ability -> Fatigue -> Confidence -> Pressure -> Opponent -> Random Variance -> Dart/Visit Outcome.
 */
export class PerformancePipeline {
  // Adjacent segments on standard clock dartboard (for realistic miss scatter)
  private static readonly CLOCKWISE_NEIGHBORS: Record<number, [number, number]> = {
    20: [1, 5],
    1: [18, 20],
    18: [4, 1],
    4: [13, 18],
    13: [6, 4],
    6: [10, 13],
    10: [15, 6],
    15: [2, 10],
    2: [17, 15],
    17: [3, 2],
    3: [19, 17],
    19: [7, 3],
    7: [16, 19],
    16: [8, 7],
    8: [11, 16],
    11: [14, 8],
    14: [9, 11],
    9: [12, 14],
    12: [5, 9],
    5: [20, 12]
  };

  constructor(private rng: IRandomProvider = new DefaultRandomProvider()) {}

  /**
   * Simulates a single dart thrown by player targeting a specific segment.
   */
  public simulateDart(
    player: Player,
    target: Target,
    situation: MatchSituation
  ): DartResult {
    // 1. Calculate effective skill for this target type with Equipment Modifiers
    const isDoubleAttempt = target.multiplier === 2;
    const isTrebleAttempt = target.multiplier === 3;

    const scoringMod = player.equipment?.scoringModifier ?? 1.0;
    const doublingMod = player.equipment?.doublingModifier ?? 1.0;

    const injuryPenalties = player.totalInjuryPenalties || { scoring: 0, doubling: 0, consistency: 0, pressure: 0 };
    const injurySkillPenalty = isDoubleAttempt ? injuryPenalties.doubling : injuryPenalties.scoring;

    let baseSkill = isDoubleAttempt
      ? Math.max(5, player.attributes.doubling - injurySkillPenalty) * doublingMod
      : Math.max(5, player.attributes.scoring - injurySkillPenalty) * scoringMod;

    // 2. Modifiers
    // Confidence (-5 to +5%)
    const confModifier = (player.state.confidence - 50) * 0.1;

    // Fatigue penalty (up to -15% at max fatigue)
    const fatiguePenalty = (player.state.fatigue / 100) * 15;

    // Form bonus (-5 to +5%)
    const formModifier = (player.state.form - 50) * 0.1;

    // Pressure modifier + Sports Psychologist clutch bonus
    let pressureImpact = 0;
    if (situation.isDecidingLeg || situation.opponentRemaining <= 50) {
      const clutchBonus = player.hiredStaffIds ? (player.hiredStaffIds.includes('psych-mercer') ? 12 : player.hiredStaffIds.includes('psych-clara') ? 6 : 0) : 0;
      const effectivePressure = Math.max(5, player.attributes.pressure - (injuryPenalties.pressure || 0)) + clutchBonus;
      pressureImpact = (effectivePressure - 50) * 0.15;
    }

    const effectiveSkill = Math.min(99, Math.max(10,
      baseSkill + confModifier - fatiguePenalty + formModifier + pressureImpact
    ));

    // Consistency controls scatter variance (scaled by equipment consistency modifier & injury)
    const consistencyMod = player.equipment?.consistencyModifier ?? 1.0;
    const baseConsistency = Math.max(5, player.attributes.consistency - (injuryPenalties.consistency || 0));
    const consistency = Math.min(100, Math.max(10, baseConsistency * consistencyMod));

    // 3. Resolve Dart Landing
    if (target.segment === 25) {
      return this.resolveBullAttempt(player, target, effectiveSkill);
    } else if (isTrebleAttempt) {
      return this.resolveTrebleAttempt(player, target, effectiveSkill, consistency);
    } else if (isDoubleAttempt) {
      return this.resolveDoubleAttempt(player, target, effectiveSkill, consistency);
    } else {
      return this.resolveSingleAttempt(player, target, effectiveSkill);
    }
  }

  private resolveTrebleAttempt(player: Player, target: Target, skill: number, consistency: number): DartResult {
    // Probability of hitting treble: world class (95 skill) ~ 42-45%, amateur (45 skill) ~ 12-16%
    const hitTrebleChance = (skill / 100) * 0.45;
    const r = this.rng.next();

    if (r < hitTrebleChance) {
      return new DartResult(player.id, target.segment, 3, 'statistical');
    }

    // Missed treble: Most misses stay in the single of the same bed
    const hitSingleBedChance = 0.55 + (consistency / 100) * 0.25;
    if (this.rng.next() < hitSingleBedChance) {
      return new DartResult(player.id, target.segment, 1, 'statistical');
    }

    // Scatters to neighbor bed
    const neighbors = PerformancePipeline.CLOCKWISE_NEIGHBORS[target.segment] || [1, 5];
    const neighbor = this.rng.pickOne(neighbors);

    // Neighbor treble or single
    const isNeighborTreble = this.rng.chance(0.08);
    return new DartResult(player.id, neighbor, isNeighborTreble ? 3 : 1, 'statistical');
  }

  private resolveDoubleAttempt(player: Player, target: Target, skill: number, consistency: number): DartResult {
    // Probability of hitting double: elite (85 skill) ~ 40-45%, amateur (45 skill) ~ 15-20%
    const hitDoubleChance = (skill / 100) * 0.48;
    if (this.rng.chance(hitDoubleChance)) {
      return new DartResult(player.id, target.segment, 2, 'statistical');
    }

    // Missed double: Inside into single bed, or outside the wire (miss)
    const insideChance = 0.65;
    if (this.rng.chance(insideChance)) {
      return new DartResult(player.id, target.segment, 1, 'statistical');
    }

    // Outside the wire = complete miss (0)
    return new DartResult(player.id, 0, 1, 'statistical');
  }

  private resolveBullAttempt(player: Player, target: Target, skill: number): DartResult {
    const hitDBullChance = (skill / 100) * 0.25;
    const hitOuterBullChance = (skill / 100) * 0.45;

    const r = this.rng.next();
    if (target.multiplier === 2 && r < hitDBullChance) {
      return new DartResult(player.id, 25, 2, 'statistical');
    }
    if (r < (hitDBullChance + hitOuterBullChance)) {
      return new DartResult(player.id, 25, 1, 'statistical');
    }

    // Missed bull scatters into random low single
    const randomSeg = this.rng.nextInt(1, 20);
    return new DartResult(player.id, randomSeg, 1, 'statistical');
  }

  private resolveSingleAttempt(player: Player, target: Target, skill: number): DartResult {
    // Singles are relatively easy to hit
    const hitSingleChance = 0.70 + (skill / 100) * 0.25;
    if (this.rng.chance(hitSingleChance)) {
      return new DartResult(player.id, target.segment, 1, 'statistical');
    }

    // Drift into neighbor
    const neighbors = PerformancePipeline.CLOCKWISE_NEIGHBORS[target.segment] || [1, 5];
    return new DartResult(player.id, this.rng.pickOne(neighbors), 1, 'statistical');
  }

  /**
   * Simulates an entire 3-dart visit
   */
  public simulateVisit(
    player: Player,
    situation: MatchSituation,
    doubleOutRequired: boolean = true,
    doubleInRequired: boolean = false,
    hasDoubledIn: boolean = true
  ): Visit {
    const visit = new Visit(player.id, situation.remainingScore, [], doubleOutRequired, doubleInRequired, hasDoubledIn);

    for (let d = 0; d < 3; d++) {
      if (visit.isCompleted) break;

      const target = TargetingEngine.getTarget(visit.scoreAfter, 3 - d, visit.hasDoubledIn);
      const dart = this.simulateDart(player, target, situation);
      visit.addDart(dart);
    }

    return visit;
  }
}
