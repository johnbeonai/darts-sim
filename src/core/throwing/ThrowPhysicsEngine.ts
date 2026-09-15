import { Player } from '../player/Player';
import { DartboardGeometry, DartboardHitResult } from './DartboardGeometry';
import { MatchSituation } from '../simulation/PerformancePipeline';

export interface AimingSwayState {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly amplitude: number;
  readonly tremor: number;
  readonly heartbeatPulse?: number;
  readonly isHighPressure?: boolean;
}

export interface SwipeStrokePoint {
  readonly x: number;
  readonly y: number;
  readonly time: number;
}

export interface SwipeThrowInput {
  readonly startX: number;
  readonly startY: number;
  readonly endX: number;
  readonly endY: number;
  readonly durationMs: number;
  readonly points?: SwipeStrokePoint[];
}

export interface TimingMeterThrowInput {
  readonly meterX?: number; // 0..100 (50 is center sweet spot on X-axis)
  readonly meterY?: number; // 0..100 (50 is sweet spot on Y-axis / release elevation)
  readonly meterValue?: number; // backward compatibility
  readonly targetX: number;
  readonly targetY: number;
}

export class ThrowPhysicsEngine {
  /**
   * Calculates aiming reticle breathing sway and tremor based on player attributes,
   * fatigue, confidence, match pressure, and active arm injuries.
   */
  public static calculateAimSway(
    player: Player,
    timeMs: number,
    situation?: MatchSituation | null
  ): AimingSwayState {
    const t = timeMs / 1000;
    const attr = player.attributes;
    const state = player.state;

    // Base sway amplitude inversely scales with skill (scoring/doubling)
    // Range: ~2.5mm (super steady elite) to ~9.0mm (raw amateur)
    const baseSkill = (attr.scoring + attr.doubling) / 2;
    let baseAmplitude = 2.5 + (100 - baseSkill) * 0.065;

    // Fatigue multiplier: high fatigue increases drift (up to 2.2x)
    const fatigueFactor = 1.0 + (state.fatigue / 100) * 1.2;

    // Confidence dampening: high confidence steadies hand (0.75x to 1.3x)
    const confidenceFactor = 1.3 - (state.confidence / 100) * 0.55;

    // Match pressure factor & composure resistance
    let pressureFactor = 1.0;
    const isPressureSituation = Boolean(
      situation?.isDecidingLeg ||
      (situation?.pressureMultiplier && situation.pressureMultiplier > 1.0)
    );

    if (isPressureSituation) {
      const resistance = attr.pressure / 100;
      const mult = situation?.pressureMultiplier || 1.25;
      pressureFactor = 1.0 + (1.0 - resistance) * (mult - 1.0) * 2.0;
    }

    // High-tension heartbeat tremor (cardiac cycle ~80-90 bpm)
    let pressureTremor = 0.0;
    let heartbeatPulse = 0.0;
    if (isPressureSituation) {
      const cardiacPeriod = 0.72; // ~83 bpm
      const cyclePhase = (t % cardiacPeriod) / cardiacPeriod;
      const lub = Math.exp(-Math.pow((cyclePhase - 0.06) / 0.04, 2));
      const dub = Math.exp(-Math.pow((cyclePhase - 0.20) / 0.035, 2)) * 0.75;
      heartbeatPulse = Math.max(0, Math.min(1, lub + dub));

      // Nerve vulnerability scales inversely with player composure (attr.pressure)
      const nerveVulnerability = Math.max(0.12, (100 - attr.pressure) / 100);
      const mult = situation?.pressureMultiplier || 1.3;
      pressureTremor = heartbeatPulse * nerveVulnerability * 3.6 * (mult / 1.2);
    }

    // Injury penalty: acute shoulder or elbow pain causes twitches
    let injuryFactor = 1.0;
    let injuryTremor = 0.0;
    if (player.hasActiveInjury) {
      injuryFactor = 1.5;
      injuryTremor = 2.5 * Math.sin(t * 14.5);
    }

    const effectiveAmp = baseAmplitude * fatigueFactor * confidenceFactor * pressureFactor * injuryFactor;
    const combinedTremor = injuryTremor + (isPressureSituation ? Math.sin(t * 19.0) * pressureTremor * 0.6 : 0);

    // Dual harmonic breathing lissajous figure with cardiac tremor micro-jitter
    const swayX = Math.sin(t * 1.8) * effectiveAmp + Math.cos(t * 3.7) * (effectiveAmp * 0.3) + combinedTremor;
    const swayY = Math.cos(t * 1.4) * effectiveAmp + Math.sin(t * 4.1) * (effectiveAmp * 0.25) + (isPressureSituation ? (heartbeatPulse * pressureTremor * 0.4) : 0);

    return {
      offsetX: Math.round(swayX * 10) / 10,
      offsetY: Math.round(swayY * 10) / 10,
      amplitude: Math.round(effectiveAmp * 10) / 10,
      tremor: Math.round((injuryTremor + pressureTremor) * 10) / 10,
      heartbeatPulse: Math.round(heartbeatPulse * 100) / 100,
      isHighPressure: isPressureSituation
    };
  }

  /**
   * Resolves a Swipe / Flick Throw gesture into a landed dart.
   * Player swipes from bottom oche towards target on virtual board.
   * Calculates launch angle, velocity, stroke straightness/wobble, and landing angle.
   */
  public static resolveSwipeThrow(
    player: Player,
    aimX: number,
    aimY: number,
    swipe: SwipeThrowInput,
    sway: AimingSwayState,
    situation?: MatchSituation | null
  ): DartboardHitResult {
    const deltaX = swipe.endX - swipe.startX;
    const deltaY = swipe.endY - swipe.startY; // In touch/mouse screen coords, upward stroke is negative deltaY
    const duration = Math.max(60, Math.min(750, swipe.durationMs));
    const strokeDistance = Math.hypot(deltaX, deltaY);

    // Speed in px per ms (sweet spot ~1.3 to 1.7)
    const speed = strokeDistance / duration;
    const idealSpeed = 1.45;
    const speedDiff = speed - idealSpeed;

    // Vertical deviation: fast stroke sails high (-Y in SVG), slow stroke drops low (+Y in SVG)
    const verticalDeviationMm = -speedDiff * 16.0;

    // Launch angle deflection from true vertical (upward is dx=0, dy < 0)
    // Angle in degrees where 0 deg is straight upward, +deg is right, -deg is left
    const deflectionRad = Math.atan2(deltaX, -deltaY);
    const deflectionDeg = (deflectionRad * 180) / Math.PI;
    const absDeg = Math.abs(deflectionDeg);

    // Progressive, punishing lateral drift:
    // Straight strokes (<1.5°) land true.
    // Crooked flicks (>2.5°) veer sharply into 1 / 5 or miss the board completely.
    const lateralScale = 160.0 + (absDeg > 2.0 ? Math.pow(absDeg - 2.0, 1.3) * 32.0 : 0);
    const horizontalAngleDriftMm = Math.tan(deflectionRad) * lateralScale;

    // Stroke straightness / wobble analysis if stroke points are provided
    let wobblePenaltyMm = 0;
    if (swipe.points && swipe.points.length > 2) {
      let totalDeviation = 0;
      const numPoints = swipe.points.length;
      for (let i = 1; i < numPoints - 1; i++) {
        const pt = swipe.points[i];
        const numerator = Math.abs(
          (swipe.endY - swipe.startY) * pt.x -
          (swipe.endX - swipe.startX) * pt.y +
          swipe.endX * swipe.startY -
          swipe.endY * swipe.startX
        );
        const dist = strokeDistance > 0 ? numerator / strokeDistance : 0;
        totalDeviation += dist;
      }
      const avgWobble = totalDeviation / (numPoints - 2);
      if (avgWobble > 1.8) {
        wobblePenaltyMm = Math.min(28, (avgWobble - 1.8) * 3.0);
      }
    }

    // Authentic landing angles based on throw stroke (enhanced yaw response)
    const landingAngleDeg = Math.max(-42, Math.min(42, -deflectionDeg * 1.4));
    const landingPitchDeg = Math.max(10, Math.min(35, 22 - (speedDiff * 7.5)));

    // RPG Scatter Modulation
    const scatter = this.calculateAttributeScatter(player, aimX, aimY, situation);

    // Final Impact Point
    const landedX = aimX + sway.offsetX + horizontalAngleDriftMm + scatter.dx + (Math.random() - 0.5) * wobblePenaltyMm;
    const landedY = aimY + sway.offsetY + verticalDeviationMm + scatter.dy + (Math.random() - 0.5) * wobblePenaltyMm;

    return DartboardGeometry.resolveCoordinate(
      landedX,
      landedY,
      player.id,
      landingAngleDeg,
      landingPitchDeg
    );
  }

  /**
   * Resolves a 2-Stage Timing Meter Throw.
   * Stage 1: Horizontal Aim Line / X-Axis (0..100, 50 is center sweet spot).
   * Stage 2: Vertical Release Elevation & Power / Y-Axis (0..100, 50 is sweet spot).
   */
  public static resolveTimingThrow(
    player: Player,
    meterInput: TimingMeterThrowInput,
    sway: AimingSwayState,
    situation?: MatchSituation | null
  ): DartboardHitResult {
    const { targetX, targetY } = meterInput;

    // Stage 1: X-Axis Horizontal Drift (0..100, 50 is center sweet spot)
    const meterX = meterInput.meterX !== undefined ? meterInput.meterX : 50;
    const xDelta = meterX - 50; // -50 to +50
    let horizontalErrorMm = 0;
    if (Math.abs(xDelta) > 4) {
      const effX = xDelta > 0 ? xDelta - 4 : xDelta + 4;
      horizontalErrorMm = effX * 0.45;
    }

    // Stage 2: Y-Axis Release Power / Elevation (0..100, 50 is sweet spot)
    const meterY = meterInput.meterY !== undefined ? meterInput.meterY : (meterInput.meterValue ?? 50);
    const yDelta = meterY - 50; // -50 to +50
    let verticalErrorMm = 0;
    if (Math.abs(yDelta) > 4) {
      const effY = yDelta > 0 ? yDelta - 4 : yDelta + 4;
      // Early release drops dart down (+Y in SVG), late release sails up (-Y)
      verticalErrorMm = -effY * 0.70;
    }

    // Authentic landing angles based on X drift and Y elevation
    const landingAngleDeg = -xDelta * 0.25;
    const landingPitchDeg = Math.max(12, Math.min(32, 22 - (yDelta * 0.18)));

    const scatter = this.calculateAttributeScatter(player, targetX, targetY, situation);

    const landedX = targetX + sway.offsetX + horizontalErrorMm + scatter.dx;
    const landedY = targetY + sway.offsetY + verticalErrorMm + scatter.dy;

    return DartboardGeometry.resolveCoordinate(
      landedX,
      landedY,
      player.id,
      landingAngleDeg,
      landingPitchDeg
    );
  }

  /**
   * Direct Quick Aim Tap with attribute scatter.
   */
  public static resolveTapThrow(
    player: Player,
    targetX: number,
    targetY: number,
    sway: AimingSwayState,
    situation?: MatchSituation | null
  ): DartboardHitResult {
    const scatter = this.calculateAttributeScatter(player, targetX, targetY, situation);

    const landedX = targetX + sway.offsetX + scatter.dx;
    const landedY = targetY + sway.offsetY + scatter.dy;

    return DartboardGeometry.resolveCoordinate(landedX, landedY, player.id);
  }

  /**
   * Computes Gaussian-style scatter radius based on player RPG stats and equipment.
   */
  private static calculateAttributeScatter(
    player: Player,
    targetX: number,
    targetY: number,
    situation?: MatchSituation | null
  ): { dx: number; dy: number } {
    const targetDist = Math.sqrt(targetX * targetX + targetY * targetY);
    const isDoubleTarget = targetDist >= DartboardGeometry.DOUBLE_INNER_RADIUS;
    const isTrebleTarget =
      targetDist >= DartboardGeometry.TREBLE_INNER_RADIUS &&
      targetDist <= DartboardGeometry.TREBLE_OUTER_RADIUS;

    // Determine relevant attribute
    let relevantStat = player.attributes.scoring;
    if (isDoubleTarget || targetDist <= DartboardGeometry.OUTER_BULL_RADIUS) {
      relevantStat = player.attributes.doubling;
    }

    // Equipment bonuses (consistency and scoring modifiers tighten scatter)
    let equipMultiplier = 1.0;
    if (player.equipment) {
      if (isDoubleTarget) {
        equipMultiplier = player.equipment.doublingModifier || 1.0;
      } else if (isTrebleTarget) {
        equipMultiplier = player.equipment.scoringModifier || 1.0;
      }
      // Consistency modifier is a generic multiplier that makes scatter tighter (larger value is better)
      equipMultiplier *= (player.equipment.consistencyModifier || 1.0);
    }

    // Base standard deviation in mm: range 1.5mm (stat 99) to 7.5mm (stat 30)
    const effectiveStat = Math.min(99, relevantStat * equipMultiplier);
    const sigma = Math.max(1.5, 7.5 - (effectiveStat / 100) * 6.0);

    // Box-Muller transform for normal distribution
    const u1 = Math.max(0.0001, Math.random());
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);

    return {
      dx: Math.round(z0 * sigma * 10) / 10,
      dy: Math.round(z1 * sigma * 10) / 10,
    };
  }
}
