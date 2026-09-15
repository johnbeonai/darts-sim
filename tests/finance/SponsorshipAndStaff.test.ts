import { describe, it, expect } from 'vitest';
import { Player } from '../../src/core/player/Player';
import { CareerManager } from '../../src/core/career/CareerManager';
import { SponsorshipManager, SPONSORSHIP_CATALOG } from '../../src/core/finance/SponsorshipManager';
import { StaffManager, STAFF_CATALOG } from '../../src/core/finance/StaffManager';
import { TrainingManager } from '../../src/core/career/TrainingManager';

describe('Sponsorship & Support Staff Financial Depth', () => {
  it('Player qualifies for pub tier sponsors at start of career', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    player.tier = 'pub';

    const offers = SponsorshipManager.getAvailableOffers(player, []);
    expect(offers.length).toBeGreaterThan(0);
    expect(offers.some(o => o.tier === 'pub')).toBe(true);

    // Pro tier sponsors should NOT be available to a pub player
    expect(offers.some(o => o.tier === 'premier')).toBe(false);
  });

  it('Player can sign up to 2 active sponsorships, but cannot exceed maximum 2', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    player.tier = 'pub';

    const res1 = SponsorshipManager.signContract(player, 'sponsor-red-lion', player.activeSponsorships);
    expect(res1.success).toBe(true);
    expect(player.activeSponsorships.length).toBe(1);

    const res2 = SponsorshipManager.signContract(player, 'sponsor-midlands-haulage', player.activeSponsorships);
    expect(res2.success).toBe(true);
    expect(player.activeSponsorships.length).toBe(2);

    // Attempt 3rd contract
    const res3 = SponsorshipManager.signContract(player, 'sponsor-crown-ale', player.activeSponsorships);
    expect(res3.success).toBe(false);
    expect(player.activeSponsorships.length).toBe(2);
  });

  it('Weekly advance credits sponsorship stipends to player bank balance', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    player.bankBalance = 100;
    player.tier = 'pub';

    SponsorshipManager.signContract(player, 'sponsor-red-lion', player.activeSponsorships); // £30/wk
    const initialWeeks = player.activeSponsorships[0].weeksRemaining;

    const res = SponsorshipManager.processWeeklyStipends(player, player.activeSponsorships);
    expect(res.totalStipendPaid).toBe(30);
    expect(player.bankBalance).toBe(130);
    expect(player.activeSponsorships[0].weeksRemaining).toBe(initialWeeks - 1);
  });

  it('Hiring support staff deducts weekly salary and boosts player performance', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    player.bankBalance = 500;
    player.tier = 'pub';

    // Hire County Practice Coach (£35/week)
    const hireRes = StaffManager.hireStaff(player, 'coach-dave', player.hiredStaffIds);
    expect(hireRes.success).toBe(true);
    expect(player.hiredStaffIds).toContain('coach-dave');

    // Verify coach multiplier
    const multiplier = StaffManager.getTrainingMultiplier(player.hiredStaffIds);
    expect(multiplier).toBe(1.25);

    // Verify training XP boost
    player.attributes.potential = 80;
    player.attributes.scoring = 40;
    player.attributes.workEthic = 80;

    const trainRes = TrainingManager.executeTraining(player, 'scoring');
    expect(trainRes.gain).toBeGreaterThan(0);

    // Weekly payroll deduction
    const payrollRes = StaffManager.processWeeklyPayroll(player, player.hiredStaffIds);
    expect(payrollRes.totalPayroll).toBe(35);
    expect(player.bankBalance).toBe(465);
  });

  it('Physiotherapist enhances rest recovery and reduces match fatigue', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    player.bankBalance = 500;
    player.state.fatigue = 80;

    StaffManager.hireStaff(player, 'physio-sarah', player.hiredStaffIds);

    // Rest week with physio should recover up to 35 + 15 = 50 fatigue
    const restRes = TrainingManager.executeTraining(player, 'rest');
    expect(Math.abs(restRes.fatigueChange)).toBe(50);
    expect(player.state.fatigue).toBe(30);
  });

  it('All staff members in STAFF_CATALOG contain realistic bios, specialties, and avatar keys', () => {
    expect(STAFF_CATALOG.length).toBeGreaterThanOrEqual(6);
    for (const member of STAFF_CATALOG) {
      expect(member.bio).toBeDefined();
      expect(member.bio.length).toBeGreaterThan(30);
      expect(member.avatarKey).toBeDefined();
      expect(member.experienceYears).toBeGreaterThan(5);
      expect(member.specialties.length).toBeGreaterThan(0);
      expect(member.nationality).toBeDefined();
    }
  });
});

