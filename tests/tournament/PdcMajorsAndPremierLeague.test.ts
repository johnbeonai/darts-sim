import { describe, it, expect } from 'vitest';
import { Visit } from '../../src/core/match/Visit';
import { Leg } from '../../src/core/match/Leg';
import { Match } from '../../src/core/match/Match';
import { DartResult } from '../../src/core/match/DartResult';
import { TargetingEngine } from '../../src/core/simulation/TargetingEngine';
import { PremierLeagueManager, PREMIER_LEAGUE_VENUES } from '../../src/core/tournament/PremierLeagueManager';
import { PlayerFactory } from '../../src/core/player/PlayerFactory';
import { CalendarSchedule } from '../../src/core/career/CalendarSchedule';

describe('PDC Majors: World Grand Prix (Double-In / Double-Out)', () => {
  it('should ignore scoring until opening double is struck', () => {
    // 501 start, doubleOutRequired: true, doubleInRequired: true, hasDoubledIn: false
    const visit = new Visit('p1', 501, [], true, true, false);
    expect(visit.hasDoubledIn).toBe(false);

    // 1st dart: Single 20 (scores 0 because not doubled in)
    const d1 = new DartResult('p1', 20, 1, 'manual');
    visit.addDart(d1);
    expect(visit.scoreAfter).toBe(501);
    expect(visit.hasDoubledIn).toBe(false);

    // 2nd dart: Treble 20 (scores 0 because not doubled in)
    const d2 = new DartResult('p1', 20, 3, 'manual');
    visit.addDart(d2);
    expect(visit.scoreAfter).toBe(501);
    expect(visit.hasDoubledIn).toBe(false);

    // 3rd dart: Double 20 (strikes opening double! Scores 40 and opens scoring)
    const d3 = new DartResult('p1', 20, 2, 'manual');
    visit.addDart(d3);
    expect(visit.scoreAfter).toBe(461);
    expect(visit.hasDoubledIn).toBe(true);
    expect(visit.visitScore).toBe(40);
  });

  it('allows subsequent darts in the visit to score normally once doubled in', () => {
    const visit = new Visit('p1', 501, [], true, true, false);

    // 1st dart: D20 (40 pts, opens scoring)
    visit.addDart(new DartResult('p1', 20, 2, 'manual'));
    expect(visit.scoreAfter).toBe(461);
    expect(visit.hasDoubledIn).toBe(true);

    // 2nd dart: T20 (60 pts)
    visit.addDart(new DartResult('p1', 20, 3, 'manual'));
    expect(visit.scoreAfter).toBe(401);

    // 3rd dart: T20 (60 pts)
    visit.addDart(new DartResult('p1', 20, 3, 'manual'));
    expect(visit.scoreAfter).toBe(341);
    expect(visit.visitScore).toBe(160);
  });

  it('tracks hasDoubledIn across visits in Leg model', () => {
    const leg = new Leg('leg-1', ['p1', 'p2'], 'p1', 501, true, true);
    expect(leg.doubleInRequired).toBe(true);
    expect(leg.hasDoubledIn.get('p1')).toBe(false);
    expect(leg.hasDoubledIn.get('p2')).toBe(false);

    // p1 misses double in visit 1 (3 x S20)
    const v1 = new Visit('p1', 501, [], true, true, false);
    v1.addDart(new DartResult('p1', 20, 1, 'manual'));
    v1.addDart(new DartResult('p1', 20, 1, 'manual'));
    v1.addDart(new DartResult('p1', 20, 1, 'manual'));
    leg.addVisit(v1);

    expect(leg.getRemainingScore('p1')).toBe(501);
    expect(leg.hasDoubledIn.get('p1')).toBe(false);

    // p2 doubles in on dart 1 (D20) followed by 2 x T20
    const v2 = new Visit('p2', 501, [], true, true, false);
    v2.addDart(new DartResult('p2', 20, 2, 'manual'));
    v2.addDart(new DartResult('p2', 20, 3, 'manual'));
    v2.addDart(new DartResult('p2', 20, 3, 'manual'));
    leg.addVisit(v2);

    expect(leg.getRemainingScore('p2')).toBe(341);
    expect(leg.hasDoubledIn.get('p2')).toBe(true);
  });

  it('TargetingEngine targets D20 when player has not doubled in', () => {
    const target = TargetingEngine.getTarget(501, 3, false);
    expect(target.segment).toBe(20);
    expect(target.multiplier).toBe(2);
    expect(target.label).toBe('D20');

    // Once doubled in, targets T20
    const targetAfter = TargetingEngine.getTarget(501, 3, true);
    expect(targetAfter.segment).toBe(20);
    expect(targetAfter.multiplier).toBe(3);
    expect(targetAfter.label).toBe('T20');
  });
});

describe('PDC Majors: World Matchplay (Win by 2 Clear Legs Overtime)', () => {
  it('finishes immediately when a player wins by 2 or more clear legs reaching target', () => {
    // Best of 19 (first to 10)
    const match = new Match('match-1', ['p1', 'p2'], {
      type: 'legs',
      bestOfLegs: 19,
      winByTwoClearLegs: true,
      maxTieBreakLegs: 6
    });

    // P1 wins 10 legs, P2 wins 5 legs
    for (let i = 0; i < 9; i++) {
      match.onLegCompleted('p1');
    }
    for (let i = 0; i < 5; i++) {
      match.onLegCompleted('p2');
    }

    expect(match.status).toBe('in_progress');
    // P1 wins 10th leg (score 10-5)
    const res = match.onLegCompleted('p1');
    expect(res.matchWon).toBe(true);
    expect(res.matchWinnerId).toBe('p1');
    expect(match.status).toBe('finished');
  });

  it('requires a 2-leg margin when tied at 9-9 (overtime extension)', () => {
    const match = new Match('match-2', ['p1', 'p2'], {
      type: 'legs',
      bestOfLegs: 19,
      winByTwoClearLegs: true,
      maxTieBreakLegs: 6
    });

    // Bring to 9-9
    for (let i = 0; i < 9; i++) {
      match.onLegCompleted('p1');
      match.onLegCompleted('p2');
    }

    expect(match.isTieBreakActive()).toBe(true);

    // P1 wins leg 19 -> score is 10-9 (only 1-leg lead, so match continues!)
    const leg19 = match.onLegCompleted('p1');
    expect(leg19.matchWon).toBe(false);
    expect(match.status).toBe('in_progress');

    // P1 wins leg 20 -> score is 11-9 (2 clear legs lead! Match finishes!)
    const leg20 = match.onLegCompleted('p1');
    expect(leg20.matchWon).toBe(true);
    expect(leg20.matchWinnerId).toBe('p1');
    expect(match.status).toBe('finished');
  });

  it('enforces sudden-death deciding leg at 12-12 (maxTieBreakLegs = 6)', () => {
    const match = new Match('match-3', ['p1', 'p2'], {
      type: 'legs',
      bestOfLegs: 19,
      winByTwoClearLegs: true,
      maxTieBreakLegs: 6
    });

    // Bring to 12-12
    for (let i = 0; i < 12; i++) {
      match.onLegCompleted('p1');
      match.onLegCompleted('p2');
    }

    expect(match.status).toBe('in_progress');
    expect(match.legsWon.get('p1')).toBe(12);
    expect(match.legsWon.get('p2')).toBe(12);

    // Next leg is the 25th leg (sudden death!)
    // Sudden death target = 10 + floor(6/2) = 13.
    const suddenDeath = match.onLegCompleted('p2');
    expect(suddenDeath.matchWon).toBe(true);
    expect(suddenDeath.matchWinnerId).toBe('p2');
    expect(match.legsWon.get('p2')).toBe(13);
    expect(match.status).toBe('finished');
  });
});

describe('PDC Premier League Darts', () => {
  it('has 16 official European tour venues defined', () => {
    expect(PREMIER_LEAGUE_VENUES.length).toBe(16);
    expect(PREMIER_LEAGUE_VENUES[0].city).toBe('Belfast');
    expect(PREMIER_LEAGUE_VENUES[1].city).toBe('Berlin');
    expect(PREMIER_LEAGUE_VENUES[2].city).toBe('Glasgow');
    expect(PREMIER_LEAGUE_VENUES[3].city).toBe('Dublin');
  });

  it('initializes an 8-player field and tracks weekly points', () => {
    const factory = new PlayerFactory();
    const human = factory.createPlayer({ name: 'John Hero', gender: 'male', nationality: 'ENG' }, 'human-1');
    human.tier = 'elite';
    const cpus = Array.from({ length: 15 }, (_, i) => {
      const p = factory.createPlayer({ name: `Pro Player ${i + 1}`, gender: 'male', nationality: 'ENG' }, `cpu-${i + 1}`);
      p.tier = 'elite';
      return p;
    });

    const pl = new PremierLeagueManager(2026);
    pl.initializeSeason([human, ...cpus], human.id);

    expect(pl.contestantIds.length).toBe(8);
    expect(pl.standings.length).toBe(8);
    expect(pl.isContestant('human-1')).toBe(true);

    // Simulate Night 1: human wins (5 pts), cpu-1 is runner-up (3 pts), cpu-2 and cpu-3 are semi-finalists (2 pts)
    const matchLegRecords = [
      { p1Id: 'human-1', p2Id: 'cpu-4', p1Legs: 6, p2Legs: 3 },
      { p1Id: 'cpu-2', p2Id: 'cpu-5', p1Legs: 6, p2Legs: 4 },
      { p1Id: 'cpu-1', p2Id: 'cpu-6', p1Legs: 6, p2Legs: 2 },
      { p1Id: 'cpu-3', p2Id: 'cpu-7', p1Legs: 6, p2Legs: 5 },
      // Semi-Finals
      { p1Id: 'human-1', p2Id: 'cpu-2', p1Legs: 6, p2Legs: 4 },
      { p1Id: 'cpu-1', p2Id: 'cpu-3', p1Legs: 6, p2Legs: 5 },
      // Final
      { p1Id: 'human-1', p2Id: 'cpu-1', p1Legs: 6, p2Legs: 4 }
    ];

    pl.recordNightResult(
      1,
      'SSE Arena Belfast',
      'Belfast',
      'human-1',
      'cpu-1',
      ['cpu-2', 'cpu-3'],
      matchLegRecords
    );

    // Check Standings
    expect(pl.standings[0].playerId).toBe('human-1');
    expect(pl.standings[0].points).toBe(5);
    expect(pl.standings[0].nightWins).toBe(1);
    expect(pl.standings[0].matchesWon).toBe(3);

    expect(pl.standings[1].playerId).toBe('cpu-1');
    expect(pl.standings[1].points).toBe(3);
    expect(pl.standings[1].nightRunnerUps).toBe(1);

    const qualifiers = pl.getPlayOffsQualifiers();
    expect(qualifiers.length).toBe(4);
    expect(qualifiers[0].playerId).toBe('human-1');
  });

  it('properly serializes and deserializes PremierLeagueManager', () => {
    const pl = new PremierLeagueManager(2026);
    pl.contestantIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'];
    pl.standings = [
      {
        playerId: 'p1',
        playerName: 'P1',
        nationality: 'ENG',
        playedNights: 2,
        nightWins: 2,
        nightRunnerUps: 0,
        matchesWon: 6,
        matchesLost: 0,
        legsWon: 36,
        legsLost: 14,
        legDifference: 22,
        points: 10
      }
    ];
    pl.currentNightIndex = 2;

    const json = pl.toJSON();
    const restored = PremierLeagueManager.fromJSON(json);

    expect(restored.year).toBe(2026);
    expect(restored.currentNightIndex).toBe(2);
    expect(restored.standings[0].points).toBe(10);
    expect(restored.standings[0].legDifference).toBe(22);
  });

  it('CalendarSchedule includes World Matchplay with tiebreak, Grand Prix with doubleIn, and Premier League', () => {
    const week5Tourneys = CalendarSchedule.getTournamentsForWeek(5, 2026);
    const plNight1 = week5Tourneys.find(t => t.id.startsWith('premier-league-night-1'));
    expect(plNight1).toBeDefined();
    expect(plNight1?.name).toContain('Premier League — Night 1');

    const week21Tourneys = CalendarSchedule.getTournamentsForWeek(21, 2026);
    const playOffs = week21Tourneys.find(t => t.id.startsWith('premier-league-play-offs'));
    expect(playOffs).toBeDefined();
    expect(playOffs?.prizePool.winner).toBe(275000);

    const week28Tourneys = CalendarSchedule.getTournamentsForWeek(28, 2026);
    const matchplay = week28Tourneys.find(t => t.id.startsWith('world-matchplay-'));
    expect(matchplay?.format.winByTwoClearLegs).toBe(true);
    expect(matchplay?.format.maxTieBreakLegs).toBe(6);

    const week40Tourneys = CalendarSchedule.getTournamentsForWeek(40, 2026);
    const grandPrix = week40Tourneys.find(t => t.id.startsWith('world-grand-prix-'));
    expect(grandPrix?.format.doubleInRequired).toBe(true);
    expect(grandPrix?.format.doubleOutRequired).toBe(true);
  });
});
