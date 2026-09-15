import { describe, it, expect } from 'vitest';
import { Player } from '../../src/core/player/Player';
import { CareerManager } from '../../src/core/career/CareerManager';
import { CalendarSchedule } from '../../src/core/career/CalendarSchedule';
import { QSchoolManager } from '../../src/core/career/QSchoolManager';
import { SaveManager } from '../../src/storage/SaveManager';

describe('Phase 8 & 12: Tour Card & Tier-Gated Calendar Progression', () => {
  it('awards 2-Year Tour Card on Q-School stage victory and updates player tier to pro', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    player.tier = 'amateur';
    expect(player.hasTourCard).toBe(false);

    const res = QSchoolManager.processStagePerformance(player, 'winner', 2026);
    expect(res.tourCardEarned).toBe(true);
    expect(player.hasTourCard).toBe(true);
    expect(player.tourCardExpiryYear).toBe(2027); // 2-year card (2026 and 2027)
    expect(player.tier).toBe('pro');
  });

  it('accumulates Q-School points for runner-up and semi-final finishes', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    const res1 = QSchoolManager.processStagePerformance(player, 'runnerUp', 2026);
    expect(res1.tourCardEarned).toBe(false);
    expect(player.qSchoolPoints).toBe(5);

    const res2 = QSchoolManager.processStagePerformance(player, 'semiFinalist', 2026);
    expect(player.qSchoolPoints).toBe(8);
  });

  it('correctly gates tournaments based on Tour Card requirement', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    const career = new CareerManager([player]);

    // Week 3 is a Players Championship (requires Tour Card)
    const week3Events = CalendarSchedule.getTournamentsForWeek(3, 2026);
    const pcEvent = week3Events.find(e => e.category === 'pro_tour');
    expect(pcEvent).toBeDefined();

    // Player does not have Tour Card
    player.hasTourCard = false;
    const check1 = career.isPlayerEligibleForTournament(player, pcEvent!);
    expect(check1.eligible).toBe(false);
    expect(check1.reason).toContain('PDC Tour Card required');

    // Award Tour Card
    player.awardTourCard(2026, 2);
    const check2 = career.isPlayerEligibleForTournament(player, pcEvent!);
    expect(check2.eligible).toBe(true);
  });

  it('correctly gates Televised Majors based on PDC Order of Merit ranking cutoffs', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    player.awardTourCard(2026, 2);
    const career = new CareerManager([player]);

    // Week 28 is World Matchplay (requires Top 32)
    const matchplayEvents = CalendarSchedule.getTournamentsForWeek(28, 2026);
    const matchplay = matchplayEvents.find(e => e.id.includes('world-matchplay'));
    expect(matchplay).toBeDefined();
    expect(matchplay!.requirements?.maxRank).toBe(32);

    // Player ranked #45
    player.ranking = 45;
    const check1 = career.isPlayerEligibleForTournament(player, matchplay!);
    expect(check1.eligible).toBe(false);
    expect(check1.reason).toContain('Top 32');

    // Player ranked #18
    player.ranking = 18;
    const check2 = career.isPlayerEligibleForTournament(player, matchplay!);
    expect(check2.eligible).toBe(true);
  });

  it('evaluates Tour Card retention at season end (Top 64 rule)', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    player.awardTourCard(2026, 2);
    player.tourCardExpiryYear = 2026; // Expiring at end of 2026 season
    const career = new CareerManager([player]);

    // Case A: Ranked #40 (within Top 64) -> Tour Card renewed
    player.ranking = 40;
    career.calendar.currentWeek = 52;
    career.advanceWeek(); // Moves to Week 1, 2027

    expect(career.calendar.currentYear).toBe(2027);
    expect(player.hasTourCard).toBe(true);
    expect(player.tourCardExpiryYear).toBe(2027);
  });

  it('revokes Tour Card if expiring outside Top 64 at season end', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    player.awardTourCard(2026, 2);
    player.tourCardExpiryYear = 2026; // Expiring at end of 2026
    const career = new CareerManager([player]);

    // Case B: Ranked #75 (outside Top 64) -> Tour Card lapsed
    player.ranking = 75;
    career.calendar.currentWeek = 52;
    career.advanceWeek(); // Moves to Week 1, 2027

    expect(player.hasTourCard).toBe(false);
    expect(player.tier).toBe('semi_pro');
  });

  it('SaveManager persists Tour Card status across slots', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    player.awardTourCard(2026, 2);
    player.qSchoolPoints = 15;
    const career = new CareerManager([player]);

    SaveManager.saveGame(3, career);
    const loaded = SaveManager.loadGame(3);

    expect(loaded).not.toBeNull();
    expect(loaded!.player.hasTourCard).toBe(true);
    expect(loaded!.player.tourCardExpiryYear).toBe(2027);
    expect(loaded!.player.qSchoolPoints).toBe(15);
  });

  it('WeeklyResolutionResult captures action details for both players without skipping', () => {
    const p1 = new Player('p1', 'John', 'male', 'England', 25);
    const p2 = new Player('p2', 'Rob', 'male', 'Scotland', 27);
    p2.state.fatigue = 50;
    const career = new CareerManager([p1, p2]);

    career.recordPlayerDecision(p1.id, { action: 'train', trainingType: 'scoring' });
    career.recordPlayerDecision(p2.id, { action: 'rest', trainingType: 'rest' });

    const res = career.resolveWeeklyPlans();
    expect(res.type).toBe('week_advanced');
    expect(res.p1Action).toBeDefined();
    expect(res.p1Action.action).toBe('train');
    expect(res.p1Action.trainingResult?.attributeTrained).toBe('Scoring');
    expect(res.p2Action).toBeDefined();
    expect(res.p2Action?.action).toBe('rest');
    expect(res.p2Action?.trainingResult?.fatigueChange).toBeLessThan(0);
  });

  it('strictly gates Q-School Final Stage to only players qualified from First Stage', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    player.bankBalance = 500;
    const career = new CareerManager([player]);

    // Week 2 is Q-School Final Stage
    const week2Events = CalendarSchedule.getTournamentsForWeek(2, 2026);
    const qFinal = week2Events.find(e => e.id.includes('q-school-final'));
    expect(qFinal).toBeDefined();

    // Player did NOT qualify from Stage 1
    player.qSchoolFinalQualified = false;
    const check1 = career.isPlayerEligibleForTournament(player, qFinal!);
    expect(check1.eligible).toBe(false);
    expect(check1.reason).toContain('Did not qualify for Q-School Final Stage');

    // Player qualifies from Stage 1 (e.g. Day Winner or points cutoff)
    const stageRes = QSchoolManager.processStagePerformance(player, 'winner', 2026, 'stage1');
    expect(stageRes.tourCardEarned).toBe(false);
    expect(stageRes.finalStageQualified).toBe(true);
    expect(player.qSchoolFinalQualified).toBe(true);

    // Now player is eligible for Q-School Final Stage
    const check2 = career.isPlayerEligibleForTournament(player, qFinal!);
    expect(check2.eligible).toBe(true);
  });

  it('restricts uncarded amateur players from entering Semi-Pro Challenge Tour and PDC Pro Tour events', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    player.bankBalance = 1000;
    player.tier = 'amateur';
    player.hasTourCard = false;
    player.hasEnteredQSchool = false;
    const career = new CareerManager([player]);

    // Challenge Tour Event (requires Semi-Pro tier or Q-School participation)
    const week4Events = CalendarSchedule.getTournamentsForWeek(4, 2026);
    const challengeTour = week4Events.find(e => e.category === 'challenge_tour');
    expect(challengeTour).toBeDefined();

    const ctCheck = career.isPlayerEligibleForTournament(player, challengeTour!);
    expect(ctCheck.eligible).toBe(false);
    expect(ctCheck.reason).toContain('Challenge Tour requires Semi-Pro tier');

    // World Darts Championship (Ally Pally) requires PDC Tour Card
    const week50Events = CalendarSchedule.getTournamentsForWeek(50, 2026);
    const allyPally = week50Events.find(e => e.id.includes('world-championship'));
    expect(allyPally).toBeDefined();

    // Even if ranked highly (e.g. #20), without a Tour Card player cannot enter Ally Pally
    player.ranking = 20;
    const allyPallyCheck = career.isPlayerEligibleForTournament(player, allyPally!);
    expect(allyPallyCheck.eligible).toBe(false);
    expect(allyPallyCheck.reason).toContain('PDC Tour Card required');

    // Tour Card holders cannot enter local pub or amateur tournaments
    player.awardTourCard(2026, 2);
    const pubEvent = CalendarSchedule.getTournamentsForWeek(1, 2026).find(e => e.category === 'pub');
    expect(pubEvent).toBeDefined();

    const pubCheck = career.isPlayerEligibleForTournament(player, pubEvent!);
    expect(pubCheck.eligible).toBe(false);
    expect(pubCheck.reason).toContain('Card holders cannot enter');
  });

  it('SaveManager persists Q-School qualification flags across save slots', () => {
    const player = new Player('p1', 'John', 'male', 'England', 25);
    player.qSchoolFinalQualified = true;
    player.hasEnteredQSchool = true;
    player.qSchoolPoints = 7;
    const career = new CareerManager([player]);

    SaveManager.saveGame(4, career);
    const loaded = SaveManager.loadGame(4);

    expect(loaded).not.toBeNull();
    expect(loaded!.player.qSchoolFinalQualified).toBe(true);
    expect(loaded!.player.hasEnteredQSchool).toBe(true);
    expect(loaded!.player.qSchoolPoints).toBe(7);
  });
});
