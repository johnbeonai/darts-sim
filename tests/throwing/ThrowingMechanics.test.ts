import { describe, it, expect } from 'vitest';
import { DartboardGeometry } from '../../src/core/throwing/DartboardGeometry';
import { ThrowPhysicsEngine } from '../../src/core/throwing/ThrowPhysicsEngine';
import { PlayerFactory } from '../../src/core/player/PlayerFactory';
import { evaluateShotQuality } from '../../src/core/throwing/ShotQualityEvaluator';

describe('Interactive Throwing: DartboardGeometry', () => {
  it('should resolve center (0, 0) as Bullseye (Double Bull, 50 points)', () => {
    const hit = DartboardGeometry.resolveCoordinate(0, 0);
    expect(hit.segment).toBe(25);
    expect(hit.multiplier).toBe(2);
    expect(hit.dart.score).toBe(50);
    expect(hit.dart.isInnerBull).toBe(true);
    expect(hit.dart.isDouble).toBe(true);
  });

  it('should resolve radius 10mm as Outer Bull (Single Bull, 25 points)', () => {
    const hit = DartboardGeometry.resolveCoordinate(0, -10);
    expect(hit.segment).toBe(25);
    expect(hit.multiplier).toBe(1);
    expect(hit.dart.score).toBe(25);
    expect(hit.dart.isBull).toBe(true);
    expect(hit.dart.isInnerBull).toBe(false);
  });

  it('should resolve Treble 20 at (x=0, y=-102)', () => {
    const hit = DartboardGeometry.resolveCoordinate(0, -102);
    expect(hit.segment).toBe(20);
    expect(hit.multiplier).toBe(3);
    expect(hit.dart.score).toBe(60);
    expect(hit.dart.label).toBe('T20');
  });

  it('should resolve Double 20 at (x=0, y=-165)', () => {
    const hit = DartboardGeometry.resolveCoordinate(0, -165);
    expect(hit.segment).toBe(20);
    expect(hit.multiplier).toBe(2);
    expect(hit.dart.score).toBe(40);
    expect(hit.dart.label).toBe('D20');
  });

  it('should resolve Double 16 at correct polar angle', () => {
    const target = DartboardGeometry.getTargetCoordinates(16, 2);
    const hit = DartboardGeometry.resolveCoordinate(target.x, target.y);
    expect(hit.segment).toBe(16);
    expect(hit.multiplier).toBe(2);
    expect(hit.dart.score).toBe(32);
    expect(hit.dart.label).toBe('D16');
  });

  it('should resolve Treble 19 at correct polar angle', () => {
    const target = DartboardGeometry.getTargetCoordinates(19, 3);
    const hit = DartboardGeometry.resolveCoordinate(target.x, target.y);
    expect(hit.segment).toBe(19);
    expect(hit.multiplier).toBe(3);
    expect(hit.dart.score).toBe(57);
    expect(hit.dart.label).toBe('T19');
  });

  it('should resolve coordinates beyond 170mm as Miss (0 points)', () => {
    const hit = DartboardGeometry.resolveCoordinate(0, -185);
    expect(hit.segment).toBe(0);
    expect(hit.multiplier).toBe(1);
    expect(hit.dart.score).toBe(0);
    expect(hit.dart.isMiss).toBe(true);
  });

  it('should detect wire proximity when within 1.2mm of a wire', () => {
    // Radius 107 is the wire between treble and outer single
    const onWire = DartboardGeometry.resolveCoordinate(0, -107.2);
    expect(onWire.isWire).toBe(true);
  });

  it('should generate accurate target coordinates', () => {
    const t20 = DartboardGeometry.getTargetCoordinates(20, 3);
    expect(t20.x).toBe(0);
    expect(t20.y).toBe(-102);
    expect(t20.label).toBe('T20');

    const bull = DartboardGeometry.getTargetCoordinates(25, 2);
    expect(bull.x).toBe(0);
    expect(bull.y).toBe(0);
    expect(bull.label).toBe('D-BULL');
  });
});

describe('Interactive Throwing: ThrowPhysicsEngine', () => {
  it('should calculate higher aim sway when player is fatigued', () => {
    const factory = new PlayerFactory();
    const player = factory.createPlayer({ name: 'Phil', gender: 'male', nationality: 'English', archetype: 'balanced' });

    player.state.fatigue = 0;
    const freshSway = ThrowPhysicsEngine.calculateAimSway(player, 1000);

    player.state.fatigue = 90;
    const fatiguedSway = ThrowPhysicsEngine.calculateAimSway(player, 1000);

    expect(fatiguedSway.amplitude).toBeGreaterThan(freshSway.amplitude);
  });

  it('should add tremor when player has an active injury', () => {
    const factory = new PlayerFactory();
    const player = factory.createPlayer({ name: 'Phil', gender: 'male', nationality: 'English', archetype: 'balanced' });

    player.activeInjuries = [];
    const healthySway = ThrowPhysicsEngine.calculateAimSway(player, 1500);
    expect(healthySway.tremor).toBe(0);

    player.activeInjuries = [{
      id: 'inj-1',
      type: 'shoulder_strain',
      name: 'Rotator Cuff',
      description: 'Strained shoulder',
      severity: 'moderate',
      weeksRemaining: 2,
      initialDuration: 3,
      isTreatedThisWeek: false,
      penalties: { scoring: 5, doubling: 5, consistency: 5, pressure: 5 },
    }];
    const injuredSway = ThrowPhysicsEngine.calculateAimSway(player, 1500);
    expect(injuredSway.amplitude).toBeGreaterThan(healthySway.amplitude);
  });

  it('should resolve timing throws with sweet spot having minimal vertical error', () => {
    const factory = new PlayerFactory();
    const player = factory.createPlayer({ name: 'Phil', gender: 'male', nationality: 'English', archetype: 'clinical_finisher' });
    const sway = { offsetX: 0, offsetY: 0, amplitude: 0, tremor: 0 };

    // Aim at T20 (x=0, y=-102) with 50 sweet spot
    const hit = ThrowPhysicsEngine.resolveTimingThrow(
      player,
      { meterValue: 50, targetX: 0, targetY: -102 },
      sway
    );

    // Should land close to T20
    expect(hit.segment).toBe(20);
  });

  it('should drop low when released early on timing meter', () => {
    const factory = new PlayerFactory();
    const player = factory.createPlayer({ name: 'Phil', gender: 'male', nationality: 'English', archetype: 'balanced' });
    const sway = { offsetX: 0, offsetY: 0, amplitude: 0, tremor: 0 };

    // Meter value 10 is very early release (should drop down, +y in SVG)
    const earlyHit = ThrowPhysicsEngine.resolveTimingThrow(
      player,
      { meterValue: 10, targetX: 0, targetY: -102 },
      sway
    );

    // In SVG, +y means lower down the board (towards bull/19/3)
    expect(earlyHit.y).toBeGreaterThan(-102);
  });

  it('should resolve swipe throws accurately', () => {
    const factory = new PlayerFactory();
    const player = factory.createPlayer({ name: 'Phil', gender: 'male', nationality: 'English', archetype: 'balanced' });
    const sway = { offsetX: 0, offsetY: 0, amplitude: 0, tremor: 0 };

    // Straight upward flick from (0, 300) to (0, 75) in 150ms
    const swipeHit = ThrowPhysicsEngine.resolveSwipeThrow(
      player,
      0,
      -102,
      { startX: 0, startY: 300, endX: 0, endY: 75, durationMs: 150 },
      sway
    );

    expect(swipeHit).toBeDefined();
    expect(swipeHit.dart).toBeDefined();
  });

  it('should penalize crooked lateral flicks heavily with significant horizontal drift', () => {
    const factory = new PlayerFactory();
    const player = factory.createPlayer({ name: 'Phil', gender: 'male', nationality: 'English', archetype: 'clinical_finisher' });
    const sway = { offsetX: 0, offsetY: 0, amplitude: 0, tremor: 0 };

    // 1. Straight upward flick targeting T20 (x=0, y=-102)
    const straightHit = ThrowPhysicsEngine.resolveSwipeThrow(
      player,
      0,
      -102,
      { startX: 0, startY: 300, endX: 0, endY: 80, durationMs: 150 },
      sway
    );
    expect(Math.abs(straightHit.x)).toBeLessThan(15); // Stays close to center vertical line

    // 2. Crooked flick veering right (endX = 40, endY = 80 -> ~10° deflection)
    const crookedHit = ThrowPhysicsEngine.resolveSwipeThrow(
      player,
      0,
      -102,
      { startX: 0, startY: 300, endX: 40, endY: 80, durationMs: 150 },
      sway
    );

    // Crooked hit must drift far to the right (+X > 25mm), missing segment 20
    expect(crookedHit.x).toBeGreaterThan(25);
    expect(crookedHit.segment).not.toBe(20); // Veered into 1, 18, 4, or off target
    expect(crookedHit.landingAngleDeg).toBeLessThan(0); // Angled fin tilt into board
  });
});

describe('Precision Throw Oche: Visual Stroke Tracking & Quality Rating', () => {
  const dummyPoints = [{ x: 130, y: 260 }, { x: 130, y: 80 }];

  it('should rate dead-straight flick as Green: EXCELLENT SHOT', () => {
    // 0 deg deflection, 180px in 120ms = 1.5 px/ms
    const result = evaluateShotQuality(0, -180, 120, dummyPoints);
    expect(result.quality).toBe('green');
    expect(result.badgeText).toContain('EXCELLENT SHOT');
    expect(result.deflectionDeg).toBeCloseTo(0, 1);
  });

  it('should rate minor veer (< 4.5 deg) as Amber: GOOD SHOT', () => {
    // ~2.5 deg deflection: dx = 8, dy = -180
    const result = evaluateShotQuality(8, -180, 120, dummyPoints);
    expect(result.quality).toBe('amber');
    expect(result.badgeText).toContain('GOOD SHOT');
    expect(result.deflectionDeg).toBeGreaterThan(2.0);
    expect(result.deflectionDeg).toBeLessThan(4.5);
  });

  it('should rate crooked flick (> 4.5 deg) as Red: BAD SHOT', () => {
    // ~9.5 deg deflection: dx = 30, dy = -180
    const result = evaluateShotQuality(30, -180, 120, dummyPoints);
    expect(result.quality).toBe('red');
    expect(result.badgeText).toContain('BAD SHOT');
    expect(result.subText).toContain('Severe Veer');
  });

  it('should rate sluggish flick with tempo fault as Red: BAD SHOT', () => {
    // 0 deg deflection but sluggish duration 800ms for 20px = 0.025 px/ms
    const result = evaluateShotQuality(0, -20, 800, dummyPoints);
    expect(result.quality).toBe('red');
    expect(result.badgeText).toContain('BAD SHOT');
    expect(result.subText).toContain('Speed Fault');
  });
});
