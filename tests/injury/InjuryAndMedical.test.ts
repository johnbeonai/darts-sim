import { describe, it, expect } from 'vitest';
import { Player } from '../../src/core/player/Player';
import { InjuryFactory, INJURY_DEFINITIONS } from '../../src/core/injury/Injury';
import { MedicalManager } from '../../src/core/injury/MedicalManager';
import { PerformancePipeline } from '../../src/core/simulation/PerformancePipeline';
import { SaveManager } from '../../src/storage/SaveManager';
import { CareerManager } from '../../src/core/career/CareerManager';

describe('Injury & Medical System (Phase 10.6 & 14.7)', () => {
  it('InjuryFactory creates valid injury definitions with appropriate penalties', () => {
    const shoulder = InjuryFactory.createInjury('shoulder_strain', 'moderate');
    expect(shoulder.type).toBe('shoulder_strain');
    expect(shoulder.severity).toBe('moderate');
    expect(shoulder.weeksRemaining).toBe(4);
    expect(shoulder.penalties.scoring).toBe(15);
    expect(shoulder.penalties.consistency).toBe(12);

    const elbow = InjuryFactory.createInjury('tennis_elbow', 'severe');
    expect(elbow.penalties.doubling).toBe(28);
    expect(elbow.weeksRemaining).toBe(6);
  });

  it('Player correctly aggregates total injury penalties across multiple injuries', () => {
    const player = new Player('test-p1', 'John', 'male', 'England', 25);
    expect(player.hasActiveInjury).toBe(false);
    expect(player.totalInjuryPenalties.scoring).toBe(0);

    const shoulder = InjuryFactory.createInjury('shoulder_strain', 'mild'); // scoring: 8, doubling: 4
    const blister = InjuryFactory.createInjury('blister', 'moderate');       // scoring: 8, consistency: 22

    player.activeInjuries.push(shoulder, blister);
    expect(player.hasActiveInjury).toBe(true);

    const penalties = player.totalInjuryPenalties;
    expect(penalties.scoring).toBe(16); // 8 + 8
    expect(penalties.doubling).toBe(16); // 4 + 12
    expect(penalties.consistency).toBe(28); // 6 + 22
  });

  it('PerformancePipeline applies injury penalties to debuff effective skill and grouping', () => {
    const pipeline = new PerformancePipeline();
    const healthyPlayer = new Player('healthy', 'Healthy Hal', 'male', 'England', 25, {
      scoring: 80,
      doubling: 80,
      consistency: 80
    });

    const injuredPlayer = new Player('injured', 'Injured Ian', 'male', 'England', 25, {
      scoring: 80,
      doubling: 80,
      consistency: 80
    });
    injuredPlayer.activeInjuries.push(InjuryFactory.createInjury('shoulder_strain', 'severe')); // scoring: 25, consistency: 20

    const situation = { remainingScore: 501, opponentRemaining: 501 };

    // Simulate 200 visits each to compare scoring averages
    let healthyTotal = 0;
    let injuredTotal = 0;

    for (let i = 0; i < 200; i++) {
      const hVisit = pipeline.simulateVisit(healthyPlayer, situation);
      const iVisit = pipeline.simulateVisit(injuredPlayer, situation);
      healthyTotal += hVisit.visitScore;
      injuredTotal += iVisit.visitScore;
    }

    const healthyAvg = healthyTotal / 200;
    const injuredAvg = injuredTotal / 200;

    expect(injuredAvg).toBeLessThan(healthyAvg);
  });

  it('MedicalManager administers treatments, deducts funds, relieves fatigue and accelerates recovery', () => {
    const player = new Player('test-p1', 'John', 'male', 'England', 25);
    player.bankBalance = 500;
    player.state.fatigue = 60;

    const injury = InjuryFactory.createInjury('tennis_elbow', 'moderate'); // 4 weeks
    player.activeInjuries.push(injury);

    // 1. Physiotherapy session (£75, cuts 1 week, relieves 30 fatigue)
    const res1 = MedicalManager.applyTreatment(player, 'physiotherapy');
    expect(res1.success).toBe(true);
    expect(player.bankBalance).toBe(425);
    expect(player.state.fatigue).toBe(30);
    expect(injury.weeksRemaining).toBe(3);

    // 2. Specialist clinic (£250, cuts 2 weeks, relieves 50 fatigue)
    const res2 = MedicalManager.applyTreatment(player, 'specialist_rehab');
    expect(res2.success).toBe(true);
    expect(player.bankBalance).toBe(175);
    expect(injury.weeksRemaining).toBe(1);

    // 3. One more physio heals it completely
    const res3 = MedicalManager.applyTreatment(player, 'physiotherapy');
    expect(res3.success).toBe(true);
    expect(res3.injuryHealed).toBe(true);
    expect(player.hasActiveInjury).toBe(false);
    expect(player.injuryHistory.length).toBe(1);
    expect(player.injuryHistory[0]).toContain('Fully Rehabilitated');
  });

  it('MedicalManager sports psychology cures Dartitis and restores confidence', () => {
    const player = new Player('test-p1', 'John', 'male', 'England', 25);
    player.bankBalance = 300;
    player.state.confidence = 20;

    const dartitis = InjuryFactory.createInjury('dartitis', 'mild'); // 3 weeks
    player.activeInjuries.push(dartitis);

    const res = MedicalManager.applyTreatment(player, 'sports_psychology');
    expect(res.success).toBe(true);
    expect(res.injuryHealed).toBe(true); // 3 weeks - 3 weeks = 0 weeks -> healed!
    expect(player.hasActiveInjury).toBe(false);
    expect(player.state.confidence).toBe(45); // 20 + 25
  });

  it('MedicalManager rejects treatments when player has insufficient bank balance', () => {
    const player = new Player('test-p1', 'John', 'male', 'England', 25);
    player.bankBalance = 20; // Only £20
    player.activeInjuries.push(InjuryFactory.createInjury('wrist_sprain', 'mild'));

    const res = MedicalManager.applyTreatment(player, 'specialist_rehab'); // Costs £250
    expect(res.success).toBe(false);
    expect(res.message).toContain('Insufficient funds');
    expect(player.bankBalance).toBe(20);
  });

  it('advanceWeeklyMedical decrements untreated recovery weeks and triggers natural healing', () => {
    const player = new Player('test-p1', 'John', 'male', 'England', 25);
    const blister = InjuryFactory.createInjury('blister', 'mild'); // 1 week
    player.activeInjuries.push(blister);

    const messages = MedicalManager.advanceWeeklyMedical(player);
    expect(player.hasActiveInjury).toBe(false);
    expect(messages.some(m => m.includes('Full Recovery'))).toBe(true);
  });

  it('SaveManager persists active injuries and medical history across save slots', () => {
    const p1 = new Player('p1', 'John', 'male', 'England', 25);
    p1.activeInjuries.push(InjuryFactory.createInjury('shoulder_strain', 'moderate'));
    p1.injuryHistory.push('Blister (mild) - Healed');

    const career = new CareerManager([p1]);
    SaveManager.saveGame(2, career);

    const loaded = SaveManager.loadGame(2);
    expect(loaded).not.toBeNull();
    const loadedP1 = loaded!.players[0];
    expect(loadedP1.hasActiveInjury).toBe(true);
    expect(loadedP1.activeInjuries[0].type).toBe('shoulder_strain');
    expect(loadedP1.activeInjuries[0].weeksRemaining).toBe(4);
    expect(loadedP1.injuryHistory.length).toBe(1);
    expect(loadedP1.injuryHistory[0]).toContain('Blister');
  });

  it('MedicalManager grants 1 FREE Cold Therapy per month and charges £30 for subsequent sessions', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    player.bankBalance = 100;
    player.state.fatigue = 50;

    // Month 1, Session 1: FREE
    const details1 = MedicalManager.getTreatmentDetails(player, 'ice_and_rest', 1, 2026);
    expect(details1.cost).toBe(0);
    expect(details1.isFreeMonthly).toBe(true);

    const res1 = MedicalManager.applyTreatment(player, 'ice_and_rest', undefined, 1, 2026);
    expect(res1.success).toBe(true);
    expect(res1.cost).toBe(0);
    expect(player.bankBalance).toBe(100); // No money deducted
    expect(player.state.fatigue).toBe(30); // 50 - 20 = 30
    expect(player.coldTherapyUsesThisMonth).toBe(1);

    // Month 1, Session 2: Costs £30
    const details2 = MedicalManager.getTreatmentDetails(player, 'ice_and_rest', 1, 2026);
    expect(details2.cost).toBe(30);
    expect(details2.isFreeMonthly).toBe(false);

    const res2 = MedicalManager.applyTreatment(player, 'ice_and_rest', undefined, 1, 2026);
    expect(res2.success).toBe(true);
    expect(res2.cost).toBe(30);
    expect(player.bankBalance).toBe(70); // 100 - 30 = 70
    expect(player.state.fatigue).toBe(10); // 30 - 20 = 10
    expect(player.coldTherapyUsesThisMonth).toBe(2);

    // Month 2 begins: Quota automatically resets back to 1 FREE
    const detailsMonth2 = MedicalManager.getTreatmentDetails(player, 'ice_and_rest', 2, 2026);
    expect(detailsMonth2.cost).toBe(0);
    expect(detailsMonth2.isFreeMonthly).toBe(true);

    const resMonth2 = MedicalManager.applyTreatment(player, 'ice_and_rest', undefined, 2, 2026);
    expect(resMonth2.success).toBe(true);
    expect(resMonth2.cost).toBe(0);
    expect(player.bankBalance).toBe(70); // Still 70
  });

  it('MedicalManager rejects subsequent Cold Therapy in the same month if player cannot afford £30', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    player.bankBalance = 10; // Only £10
    player.state.fatigue = 60;

    // Use free session
    const res1 = MedicalManager.applyTreatment(player, 'ice_and_rest', undefined, 3, 2026);
    expect(res1.success).toBe(true);
    expect(player.bankBalance).toBe(10);

    // Try second session in same month: needs £30 but only has £10
    const res2 = MedicalManager.applyTreatment(player, 'ice_and_rest', undefined, 3, 2026);
    expect(res2.success).toBe(false);
    expect(res2.message).toContain('costs £30');
    expect(player.bankBalance).toBe(10);
  });
});
