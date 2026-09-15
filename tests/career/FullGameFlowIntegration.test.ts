import { describe, it, expect } from 'vitest';
import { Player } from '../../src/core/player/Player';
import { CareerManager } from '../../src/core/career/CareerManager';
import { Tournament, TournamentConfig } from '../../src/core/tournament/Tournament';
import { CalendarSchedule } from '../../src/core/career/CalendarSchedule';
import { SaveManager } from '../../src/storage/SaveManager';
import { TrophyManager } from '../../src/core/trophies/Trophy';
import { AchievementManager } from '../../src/core/achievements/Achievement';
import { RivalryManager } from '../../src/core/rivalry/RivalryManager';

describe('Comprehensive End-to-End System Integrity Tests', () => {
  it('handles full 2-player weekly decision lifecycle with distinct choices', () => {
    const p1 = new Player('p1', 'John', 'male', 'England', 25);
    const p2 = new Player('p2', 'Rob', 'male', 'Scotland', 26);
    const career = new CareerManager([p1, p2]);

    expect(career.isTwoPlayer).toBe(true);
    expect(career.calendar.currentWeek).toBe(1);

    // Initial stats
    const p1InitialScoring = p1.attributes.scoring;

    // Week 1: P1 chooses Training (scoring), P2 chooses Rest
    career.recordPlayerDecision('p1', {
      action: 'train',
      trainingType: 'scoring'
    });
    career.recordPlayerDecision('p2', {
      action: 'rest'
    });

    expect(career.areAllWeeklyDecisionsLocked()).toBe(true);

    const res = career.resolveWeeklyPlans();
    expect(res.type).toBe('week_advanced');
    expect(res.p1Action.action).toBe('train');
    expect(res.p1Action.trainingResult).toBeDefined();
    expect(res.p2Action?.action).toBe('rest');

    // Verify state progression
    expect(p1.attributes.scoring).toBeGreaterThanOrEqual(p1InitialScoring);
    expect(career.calendar.currentWeek).toBe(2);
  });

  it('handles 2 players entering different tournaments in the same week', () => {
    const p1 = new Player('p1', 'John', 'male', 'England', 25);
    const p2 = new Player('p2', 'Rob', 'male', 'Scotland', 26);
    p1.bankBalance = 1000;
    p2.bankBalance = 1000;
    const career = new CareerManager([p1, p2]);

    const eventA: TournamentConfig = {
      id: 'custom-event-a',
      name: 'The Red Lion Weekly Knockout',
      location: 'Coventry',
      tier: 'pub',
      category: 'pub',
      entryFee: 10,
      prizePool: { winner: 150, runnerUp: 50, semiFinalist: 20, quarterFinalist: 0 },
      rankingPoints: { winner: 2, runnerUp: 1, semiFinalist: 0, quarterFinalist: 0 },
      format: { type: 'legs', bestOfLegs: 3, startingScore: 501 }
    };

    const eventB: TournamentConfig = {
      id: 'custom-event-b',
      name: 'The Fox & Hounds Weekly Trophy',
      location: 'Solihull',
      tier: 'pub',
      category: 'pub',
      entryFee: 12,
      prizePool: { winner: 180, runnerUp: 60, semiFinalist: 25, quarterFinalist: 0 },
      rankingPoints: { winner: 2, runnerUp: 1, semiFinalist: 0, quarterFinalist: 0 },
      format: { type: 'legs', bestOfLegs: 3, startingScore: 501 }
    };

    // P1 chooses event A, P2 chooses event B
    career.recordPlayerDecision('p1', {
      action: 'tournament',
      tournamentConfig: eventA
    });
    career.recordPlayerDecision('p2', {
      action: 'tournament',
      tournamentConfig: eventB
    });

    const res = career.resolveWeeklyPlans();
    expect(res.type).toBe('tournament');
    expect(career.activeTournament).not.toBeNull();
    expect(career.activeTournament?.config.id).toBe(eventA.id);

    // Verify event B is queued in pendingTournaments for player 2
    expect(career.pendingTournaments.length).toBe(1);
    expect(career.pendingTournaments[0].player.id).toBe('p2');
    expect(career.pendingTournaments[0].config.id).toBe(eventB.id);
  });

  it('runs a full tournament with fast-simulated matches and verifies trophy & rivalry outputs', () => {
    const p1 = new Player('p1', 'John', 'male', 'England', 25);
    const career = new CareerManager([p1]);

    const pubConfig: TournamentConfig = {
      id: 'pub-autumn-cup',
      name: 'Autumn Pub Championship',
      location: 'The Bull & Spectacles',
      tier: 'amateur',
      category: 'pub',
      entryFee: 15,
      prizePool: { winner: 250, runnerUp: 100, semiFinalist: 40, quarterFinalist: 20 },
      rankingPoints: { winner: 3, runnerUp: 1, semiFinalist: 0, quarterFinalist: 0 },
      format: { type: 'legs', bestOfLegs: 3, startingScore: 501, doubleOutRequired: true }
    };

    career.enterTournament(pubConfig, [p1]);
    const tournament = career.activeTournament!;
    expect(tournament).not.toBeNull();

    // Play/Simulate all rounds until tournament finishes
    while (!tournament.isCompleted) {
      const pendingHuman = tournament.getPendingHumanMatches(['p1']);
      if (pendingHuman.length > 0) {
        // Fast-simulate human match
        const bm = pendingHuman[0];
        career.simulateHumanMatch(bm);
      }
      tournament.simulateAIMatches(['p1']);
      const currentMatches = tournament.getCurrentRoundMatches();
      const hasUnfinished = currentMatches.some(m => !m.isCompleted);
      if (!hasUnfinished) {
        tournament.advanceRound();
      }
    }

    expect(tournament.isCompleted).toBe(true);
    expect(tournament.winner).toBeDefined();

    // Finalize
    career.finalizeTournament(tournament);

    // If P1 was winner, check trophies
    if (tournament.winner?.id === 'p1') {
      expect(career.trophyAwards.length).toBeGreaterThanOrEqual(1);
      expect(career.trophyAwards[0].trophyId).toBe('pub-tankard');
      expect(career.playerAchievements['p1']['first-silverware'].unlocked).toBe(true);
    }

    // Verify rivalry ledger was populated for p1 against opponents faced
    const p1Rivals = Object.values(career.rivalryLedger['p1'] || {});
    expect(p1Rivals.length).toBeGreaterThanOrEqual(1);
    for (const r of p1Rivals) {
      expect(r.matchesPlayed).toBeGreaterThanOrEqual(1);
      expect(r.highestCheckoutInH2H).toBeLessThanOrEqual(170);
    }
  });

  it('correctly handles season rollover from Week 52 to Week 1 and evaluates Tour Card retention', () => {
    const p1 = new Player('p1', 'John', 'male', 'England', 25);
    p1.awardTourCard(2025, 2);
    p1.tourCardExpiryYear = 2026;

    const p2 = new Player('p2', 'Rob', 'male', 'Scotland', 26);
    p2.awardTourCard(2025, 2);
    p2.tourCardExpiryYear = 2026;

    const career = new CareerManager([p1, p2]);
    p1.ranking = 30; // Inside Top 64 -> retains card!
    p2.ranking = 95; // Outside Top 64 -> loses card!
    career.calendar.currentWeek = 52;
    career.calendar.currentYear = 2026;

    // Advance week from 52 -> 1
    career.advanceWeek();

    expect(career.calendar.currentWeek).toBe(1);
    expect(career.calendar.currentYear).toBe(2027);

    // P1 was rank 30 (Top 64) -> Tour card retained and renewed to 2027!
    expect(p1.hasTourCard).toBe(true);
    expect(p1.tourCardExpiryYear).toBe(2027);

    // P2 was rank 95 and card expired in 2026 -> Tour card revoked!
    expect(p2.hasTourCard).toBe(false);
    expect(p2.tier).toBe('semi_pro');
  });

  it('guarantees complete fidelity through SaveManager for complex 2-player state', () => {
    const p1 = new Player('p1', 'John', 'male', 'England', 25);
    const p2 = new Player('p2', 'Rob', 'male', 'Scotland', 26);
    p1.awardTourCard(2026, 2);

    const career = new CareerManager([p1, p2]);
    career.activePlayerIndex = 1;
    career.calendar.currentWeek = 14;
    career.calendar.currentYear = 2026;

    // Add trophy award
    career.trophyAwards.push({
      id: 'trophy-saved-1',
      trophyId: 'phil-taylor',
      trophyName: 'The Phil Taylor Trophy',
      tournamentId: 'world-matchplay',
      tournamentName: 'World Matchplay',
      tier: 'major',
      playerId: 'p1',
      playerName: 'John',
      week: 28,
      year: 2026,
      prizeWon: 200000,
      icon: '🏆',
      description: 'World Matchplay Champion'
    });

    // Add achievements
    career.playerAchievements['p1']['big-fish'].unlocked = true;
    career.playerAchievements['p1']['big-fish'].details = '170 finish';

    // Add rivalries
    RivalryManager.updateH2HRecord(
      career.rivalryLedger,
      'p1',
      { id: 'ai-rival-littler', name: 'Luke Littler', tier: 'elite' },
      { playerLegsWon: 6, opponentLegsWon: 4, playerAverage: 102.4, playerHighestCheckout: 164, isWinner: true, isDecidingLeg: false },
      14, 2026, 'Premier League'
    );

    // Save to slot 2
    SaveManager.saveGame(2, career);

    // Read slots metadata
    const slots = SaveManager.listSlots();
    const slot2 = slots.find(s => s.slotId === 2);
    expect(slot2?.exists).toBe(true);
    expect(slot2?.isTwoPlayer).toBe(true);
    expect(slot2?.playerName).toBe('John');
    expect(slot2?.player2Name).toBe('Rob');

    // Load back
    const loaded = SaveManager.loadGame(2);
    expect(loaded).not.toBeNull();
    expect(loaded!.isTwoPlayer).toBe(true);
    expect(loaded!.players.length).toBe(2);
    expect(loaded!.calendar.currentWeek).toBe(14);
    expect(loaded!.calendar.currentYear).toBe(2026);
    expect(loaded!.activePlayerIndex).toBe(1);

    // Verify trophies, achievements, rivalries
    expect(loaded!.trophyAwards.length).toBe(1);
    expect(loaded!.trophyAwards[0].trophyId).toBe('phil-taylor');
    expect(loaded!.playerAchievements['p1']['big-fish'].unlocked).toBe(true);
    expect(loaded!.playerAchievements['p2']['big-fish'].unlocked).toBe(false);
    expect(loaded!.rivalryLedger['p1']['ai-rival-littler']).toBeDefined();
    expect(loaded!.rivalryLedger['p1']['ai-rival-littler'].bestAverageInH2H).toBe(102.4);
    expect(loaded!.rivalryLedger['p1']['ai-rival-littler'].highestCheckoutInH2H).toBe(164);
  });
});
