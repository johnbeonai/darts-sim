import { describe, it, expect } from 'vitest';
import { Player } from '../../src/core/player/Player';
import {
  EQUIPMENT_CATALOG,
  getEquipmentItemById,
  calculateLoadoutModifiers
} from '../../src/core/equipment/EquipmentItem';
import { PerformancePipeline, Target } from '../../src/core/simulation/PerformancePipeline';

describe('Equipment System & Performance Distribution Shaping', () => {
  it('EQUIPMENT_CATALOG contains valid items across all categories', () => {
    expect(EQUIPMENT_CATALOG.length).toBeGreaterThanOrEqual(15);
    const completeSets = EQUIPMENT_CATALOG.filter(i => i.category === 'complete_set');
    const barrels = EQUIPMENT_CATALOG.filter(i => i.category === 'barrel');
    const shafts = EQUIPMENT_CATALOG.filter(i => i.category === 'shaft');
    const flights = EQUIPMENT_CATALOG.filter(i => i.category === 'flight');

    expect(completeSets.length).toBeGreaterThan(0);
    expect(barrels.length).toBeGreaterThan(0);
    expect(shafts.length).toBeGreaterThan(0);
    expect(flights.length).toBeGreaterThan(0);
  });

  it('Player starts with default starter equipment', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    expect(player.ownedEquipmentIds).toContain('barrel-brass-22');
    expect(player.equipment.weightGrams).toBe(22);
    expect(player.equipment.scoringModifier).toBe(1.0);
    expect(player.equipment.doublingModifier).toBe(1.0);
  });

  it('Player purchases an item with sponsor discount and equips it', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    player.bankBalance = 100;

    const barrel = getEquipmentItemById('barrel-tungsten-80-24')!;
    expect(barrel).toBeDefined();

    // Purchase with 20% discount: £55 -> £44
    const res = player.buyEquipmentItem(barrel, 20);
    expect(res.success).toBe(true);
    expect(player.bankBalance).toBe(100 - 44);
    expect(player.ownedEquipmentIds).toContain(barrel.id);

    // Equip the newly purchased barrel
    player.equipItem(barrel);
    expect(player.equippedLoadout.barrelId).toBe(barrel.id);
    expect(player.equipment.weightGrams).toBe(26); // 24g barrel + 2g stem/flight
    expect(player.equipment.scoringModifier).toBeGreaterThan(1.0);
  });

  it('Player cannot purchase equipment when funds are insufficient', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    player.bankBalance = 20;

    const expensiveSet = getEquipmentItemById('set-world-champion-22')!;
    const res = player.buyEquipmentItem(expensiveSet, 0);
    expect(res.success).toBe(false);
    expect(player.bankBalance).toBe(20);
    expect(player.ownedEquipmentIds).not.toContain(expensiveSet.id);
  });

  it('Equipping a Complete Set applies set modifiers directly', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    const tourSet = getEquipmentItemById('set-apex-predator-24')!;

    player.equipItem(tourSet);
    expect(player.equipment.completeSetId).toBe(tourSet.id);
    expect(player.equipment.scoringModifier).toBe(tourSet.modifiers.scoringModifier);
    expect(player.equipment.doublingModifier).toBe(tourSet.modifiers.doublingModifier);
    expect(player.equipment.weightGrams).toBe(24);
  });

  it('PerformancePipeline incorporates equipment scoring and doubling modifiers', () => {
    const baselinePlayer = new Player('p1', 'Baseline', 'male', 'England', 25, { scoring: 50, doubling: 50 });
    const eliteGearPlayer = new Player('p2', 'Geared', 'male', 'England', 25, { scoring: 50, doubling: 50 });

    const worldSet = getEquipmentItemById('set-world-champion-22')!;
    eliteGearPlayer.equipItem(worldSet);

    // Mock RNG to return fixed value
    let rngVal = 0.20;
    const mockRng = {
      next: () => rngVal,
      nextInt: (min: number, max: number) => min,
      nextGaussian: () => 0
    };

    const pipeline = new PerformancePipeline(mockRng as any);

    // Test treble target: with higher scoring modifier, hit probability is higher
    const targetTreble: Target = { segment: 20, multiplier: 3, label: 'T20' };
    const situation = {
      remainingScore: 501,
      opponentRemaining: 501,
      isDecidingLeg: false,
      dartsInHand: 3
    };

    // Baseline chance: 50 * 0.45 / 100 = 0.225
    // Geared chance: (50 * 1.08) * 0.45 / 100 = 0.243
    // At rngVal = 0.23, baseline will miss treble (0.23 > 0.225), but geared player hits treble (0.23 < 0.243)!
    rngVal = 0.23;
    const resBase = pipeline.simulateDart(baselinePlayer, targetTreble, situation);
    const resGeared = pipeline.simulateDart(eliteGearPlayer, targetTreble, situation);

    expect(resBase.multiplier).toBe(1); // missed treble (hit single)
    expect(resGeared.multiplier).toBe(3); // HIT TREBLE thanks to equipment boost!
  });
});
