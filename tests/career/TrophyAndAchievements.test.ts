import { describe, it, expect } from 'vitest';
import { Player } from '../../src/core/player/Player';
import { CareerManager } from '../../src/core/career/CareerManager';
import { Tournament, TournamentConfig } from '../../src/core/tournament/Tournament';
import { TrophyManager, TROPHY_CATALOG } from '../../src/core/trophies/Trophy';
import { AchievementManager, ACHIEVEMENT_CATALOG } from '../../src/core/achievements/Achievement';
import { RivalryManager } from '../../src/core/rivalry/RivalryManager';
import { Match } from '../../src/core/match/Match';
import { DartResult } from '../../src/core/match/DartResult';
import { Visit } from '../../src/core/match/Visit';
import { SaveManager } from '../../src/storage/SaveManager';

describe('Phase 10 & 55: Trophy Cabinet, Milestone Achievements & Rivalry Ledger', () => {
  it('correctly maps tournament configurations to authentic trophies and awards them on victory', () => {
    const p1 = new Player('p1', 'John', 'male', 'England', 25);
    const career = new CareerManager([p1]);

    const majorConfig: TournamentConfig = {
      id: 'pdc-world-championship-2026',
      name: 'PDC World Darts Championship',
      location: 'Alexandra Palace, London',
      tier: 'elite',
      category: 'major',
      isMajor: true,
      entryFee: 0,
      prizePool: { winner: 500000, runnerUp: 200000, semiFinalist: 100000, quarterFinalist: 50000 },
      rankingPoints: { winner: 500, runnerUp: 200, semiFinalist: 100, quarterFinalist: 50 },
      format: { type: 'legs', bestOfLegs: 7, startingScore: 501, doubleOutRequired: true }
    };

    const tournament = new Tournament(majorConfig, [p1, ...career.world.getAllAIPlayers().slice(0, 7)]);
    const trophyDef = TrophyManager.resolveTrophyDefinition(tournament);
    expect(trophyDef.id).toBe('sid-waddell');
    expect(trophyDef.name).toBe('The Sid Waddell Trophy');

    // Finalize tournament with p1 as winner
    tournament.winner = p1;
    career.finalizeTournament(tournament);

    expect(career.trophyAwards.length).toBe(1);
    const award = career.trophyAwards[0];
    expect(award.trophyId).toBe('sid-waddell');
    expect(award.trophyName).toBe('The Sid Waddell Trophy');
    expect(award.prizeWon).toBe(500000);
    expect(award.playerId).toBe(p1.id);

    // Also verify tournament milestone achievements unlocked:
    // First Silverware, Major Champion, King of Ally Pally
    const p1Achievements = career.playerAchievements[p1.id];
    expect(p1Achievements['first-silverware'].unlocked).toBe(true);
    expect(p1Achievements['major-champion'].unlocked).toBe(true);
    expect(p1Achievements['king-of-ally-pally'].unlocked).toBe(true);
  });

  it('correctly awards ProTour Shield and Pub Tankard for corresponding tiers', () => {
    const p1 = new Player('p1', 'John', 'male', 'England', 25);
    const career = new CareerManager([p1]);

    const proTourConfig: TournamentConfig = {
      id: 'pc-event-1',
      name: 'Players Championship 1',
      location: 'Wigan',
      tier: 'pro',
      category: 'pro_tour',
      entryFee: 125,
      prizePool: { winner: 15000, runnerUp: 10000, semiFinalist: 5000, quarterFinalist: 2500 },
      rankingPoints: { winner: 15, runnerUp: 10, semiFinalist: 5, quarterFinalist: 2 },
      format: { type: 'legs', bestOfLegs: 5, startingScore: 501, doubleOutRequired: true }
    };

    const tPro = new Tournament(proTourConfig, [p1, ...career.world.getAllAIPlayers().slice(0, 7)]);
    expect(TrophyManager.resolveTrophyDefinition(tPro).id).toBe('pro-tour-shield');

    const pubConfig: TournamentConfig = {
      id: 'pub-red-lion-open',
      name: 'The Red Lion Open',
      location: 'Local Pub',
      tier: 'amateur',
      category: 'pub',
      entryFee: 10,
      prizePool: { winner: 150, runnerUp: 50, semiFinalist: 20, quarterFinalist: 10 },
      rankingPoints: { winner: 2, runnerUp: 1, semiFinalist: 0, quarterFinalist: 0 },
      format: { type: 'legs', bestOfLegs: 3, startingScore: 501, doubleOutRequired: true }
    };

    const tPub = new Tournament(pubConfig, [p1, ...career.world.getAllAIPlayers().slice(0, 7)]);
    expect(TrophyManager.resolveTrophyDefinition(tPub).id).toBe('pub-tankard');
  });

  it('triggers "The Big Fish" achievement when checking out 170', () => {
    const p1 = new Player('p1', 'John', 'male', 'England', 25);
    const achievements = AchievementManager.initPlayerAchievements();

    expect(achievements['big-fish'].unlocked).toBe(false);

    // 170 checkout
    const unlocked = AchievementManager.evaluateLegFinish(achievements, p1, 9, 170, 5, 2026);
    expect(achievements['big-fish'].unlocked).toBe(true);
    expect(unlocked).toContain('The Big Fish');
  });

  it('triggers "Perfection (Nine-Darter)" when 501 is checked out in exactly 9 darts', () => {
    const p1 = new Player('p1', 'John', 'male', 'England', 25);
    const achievements = AchievementManager.initPlayerAchievements();

    expect(achievements['nine-darter'].unlocked).toBe(false);

    const unlocked = AchievementManager.evaluateLegFinish(achievements, p1, 9, 141, 10, 2026);
    expect(achievements['nine-darter'].unlocked).toBe(true);
    expect(unlocked).toContain('Perfection (Nine-Darter)');
  });

  it('triggers "Century Master" (100+ avg) and "The Whitewash" in match evaluation', () => {
    const p1 = new Player('p1', 'John', 'male', 'England', 25);
    const achievements = AchievementManager.initPlayerAchievements();

    const matchStats = { average: 104.5, scores180: 3, legsWon: 5 };
    const oppStats = { legsWon: 0 };

    const unlocked = AchievementManager.evaluateMatchStats(
      achievements,
      p1,
      matchStats,
      oppStats,
      true, // isWinner
      false, // not deciding leg
      0, // prev losses
      12,
      2026,
      'Luke Littler'
    );

    expect(achievements['century-master'].unlocked).toBe(true);
    expect(achievements['the-whitewash'].unlocked).toBe(true);
    expect(unlocked).toContain('Century Master (100+ Avg)');
    expect(unlocked).toContain('The Whitewash');
  });

  it('triggers "Nemesis Slayer" when defeating a rival with 2+ prior losses', () => {
    const p1 = new Player('p1', 'John', 'male', 'England', 25);
    const achievements = AchievementManager.initPlayerAchievements();

    const matchStats = { average: 92.0, scores180: 1, legsWon: 5 };
    const oppStats = { legsWon: 3 };

    // With 2 prior losses
    const unlocked = AchievementManager.evaluateMatchStats(
      achievements,
      p1,
      matchStats,
      oppStats,
      true, // isWinner
      false,
      2, // prevLosses
      14,
      2026,
      'Michael van Gerwen'
    );

    expect(achievements['nemesis-slayer'].unlocked).toBe(true);
    expect(unlocked).toContain('Nemesis Slayer');
  });

  it('tracks Rivalry Ledger H2H records and dynamically calculates rivalry statuses', () => {
    const ledger: Record<string, any> = {};
    const p1Id = 'p1';
    const opponent = { id: 'ai-mvg', name: 'Michael van Gerwen', tier: 'elite' };

    // Match 1: Player loses
    RivalryManager.updateH2HRecord(
      ledger,
      p1Id,
      opponent,
      { playerLegsWon: 2, opponentLegsWon: 5, playerAverage: 88.5, playerHighestCheckout: 76, isWinner: false, isDecidingLeg: false },
      1, 2026, 'Premier League'
    );
    expect(ledger[p1Id][opponent.id].matchesPlayed).toBe(1);
    expect(ledger[p1Id][opponent.id].status).toBe('friendly');

    // Match 2: Player loses again
    RivalryManager.updateH2HRecord(
      ledger,
      p1Id,
      opponent,
      { playerLegsWon: 3, opponentLegsWon: 5, playerAverage: 91.0, playerHighestCheckout: 100, isWinner: false, isDecidingLeg: false },
      5, 2026, 'UK Open'
    );
    expect(ledger[p1Id][opponent.id].matchesPlayed).toBe(2);
    expect(ledger[p1Id][opponent.id].status).toBe('developing');

    // Match 3: Player loses a 3rd time (opponent win rate 100% >= 65%) -> Status becomes Nemesis!
    RivalryManager.updateH2HRecord(
      ledger,
      p1Id,
      opponent,
      { playerLegsWon: 4, opponentLegsWon: 5, playerAverage: 94.0, playerHighestCheckout: 120, isWinner: false, isDecidingLeg: true },
      10, 2026, 'World Matchplay'
    );
    expect(ledger[p1Id][opponent.id].matchesPlayed).toBe(3);
    expect(ledger[p1Id][opponent.id].status).toBe('nemesis');
    expect(ledger[p1Id][opponent.id].recentResults).toEqual(['L', 'L', 'L']);

    // Match 4: Player wins! Form updates to ['L', 'L', 'L', 'W']
    RivalryManager.updateH2HRecord(
      ledger,
      p1Id,
      opponent,
      { playerLegsWon: 5, opponentLegsWon: 3, playerAverage: 98.2, playerHighestCheckout: 160, isWinner: true, isDecidingLeg: false },
      15, 2026, 'World Grand Prix'
    );
    expect(ledger[p1Id][opponent.id].playerWins).toBe(1);
    expect(ledger[p1Id][opponent.id].opponentWins).toBe(3);
    expect(ledger[p1Id][opponent.id].highestCheckoutInH2H).toBe(160);
    expect(ledger[p1Id][opponent.id].bestAverageInH2H).toBe(98.2);
    expect(ledger[p1Id][opponent.id].recentResults).toEqual(['L', 'L', 'L', 'W']);
  });

  it('preserves multi-player independence for achievements and rivalries', () => {
    const p1 = new Player('p1', 'John', 'male', 'England', 25);
    const p2 = new Player('p2', 'Rob', 'male', 'Scotland', 26);
    const career = new CareerManager([p1, p2]);

    expect(career.playerAchievements['p1']).toBeDefined();
    expect(career.playerAchievements['p2']).toBeDefined();

    // Unlock Big Fish for p1 only
    career.playerAchievements['p1']['big-fish'].unlocked = true;
    expect(career.playerAchievements['p1']['big-fish'].unlocked).toBe(true);
    expect(career.playerAchievements['p2']['big-fish'].unlocked).toBe(false);
  });

  it('serializes and deserializes trophies, achievements, and rivalry ledgers through SaveManager', () => {
    const p1 = new Player('p1', 'John', 'male', 'England', 25);
    const career = new CareerManager([p1]);

    career.trophyAwards.push({
      id: 'trophy-test-1',
      trophyId: 'sid-waddell',
      trophyName: 'The Sid Waddell Trophy',
      tournamentId: 'pdc-world-championship',
      tournamentName: 'PDC World Darts Championship',
      tier: 'major',
      playerId: p1.id,
      playerName: p1.name,
      week: 52,
      year: 2026,
      prizeWon: 500000,
      icon: '👑',
      description: 'World Champion'
    });

    career.playerAchievements[p1.id]['big-fish'].unlocked = true;
    career.playerAchievements[p1.id]['big-fish'].details = '170 Checkout!';

    RivalryManager.updateH2HRecord(
      career.rivalryLedger,
      p1.id,
      { id: 'ai-rival-1', name: 'Luke Humphries', tier: 'elite' },
      { playerLegsWon: 5, opponentLegsWon: 4, playerAverage: 97.5, playerHighestCheckout: 130, isWinner: true, isDecidingLeg: true },
      20, 2026, 'UK Open'
    );

    // Save to slot 3
    SaveManager.saveGame(3, career);

    // Load from slot 3
    const loaded = SaveManager.loadGame(3);
    expect(loaded).not.toBeNull();
    expect(loaded!.trophyAwards.length).toBe(1);
    expect(loaded!.trophyAwards[0].trophyName).toBe('The Sid Waddell Trophy');
    expect(loaded!.playerAchievements[p1.id]['big-fish'].unlocked).toBe(true);
    expect(loaded!.rivalryLedger[p1.id]['ai-rival-1']).toBeDefined();
    expect(loaded!.rivalryLedger[p1.id]['ai-rival-1'].opponentName).toBe('Luke Humphries');
    expect(loaded!.rivalryLedger[p1.id]['ai-rival-1'].playerWins).toBe(1);
  });
});
