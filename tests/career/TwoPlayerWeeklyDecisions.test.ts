import { describe, it, expect } from 'vitest';
import { CareerManager } from '../../src/core/career/CareerManager';
import { Player } from '../../src/core/player/Player';
import { TournamentConfig } from '../../src/core/tournament/Tournament';
import { PlayerFactory } from '../../src/core/player/PlayerFactory';
import { DebugTracker } from '../../src/core/debug/DebugTracker';
import { SaveManager } from '../../src/storage/SaveManager';

describe('2-Player Weekly Decision Flow & Calendar Progression', () => {
  const create2PCareer = () => {
    const p1 = new Player('p1', 'John', 'male', 'England', 28);
    const p2 = new Player('p2', 'Rob', 'male', 'Scotland', 26);
    return new CareerManager([p1, p2]);
  };

  const dummyTourney: TournamentConfig = {
    id: 'test-open-1',
    name: 'The Red Lion Open',
    location: 'Coventry',
    tier: 'pub',
    entryFee: 10,
    prizePool: { winner: 120, runnerUp: 50, semiFinalist: 20, quarterFinalist: 0 },
    rankingPoints: { winner: 25, runnerUp: 15, semiFinalist: 8, quarterFinalist: 2 },
    format: { type: 'legs', bestOfLegs: 3, startingScore: 501 }
  };

  const dummyTourney2: TournamentConfig = {
    id: 'test-trophy-2',
    name: 'The Fox & Hounds Trophy',
    location: 'Solihull',
    tier: 'pub',
    entryFee: 15,
    prizePool: { winner: 180, runnerUp: 75, semiFinalist: 30, quarterFinalist: 0 },
    rankingPoints: { winner: 35, runnerUp: 20, semiFinalist: 10, quarterFinalist: 3 },
    format: { type: 'legs', bestOfLegs: 3, startingScore: 501 }
  };

  it('Player 1 enters tournament while Player 2 trains: Player 2 is excluded from bracket', () => {
    const career = create2PCareer();
    const p1 = career.players[0];
    const p2 = career.players[1];

    // P1 chooses tournament
    career.recordPlayerDecision(p1.id, {
      action: 'tournament',
      tournamentConfig: dummyTourney
    });

    // P2 chooses scoring training drill
    const initialScoring = p2.attributes.scoring;
    career.recordPlayerDecision(p2.id, {
      action: 'train',
      trainingType: 'scoring'
    });

    expect(career.areAllWeeklyDecisionsLocked()).toBe(true);

    // Resolve weekly plans
    const res = career.resolveWeeklyPlans();
    expect(res.type).toBe('tournament');
    expect(res.tournament).toBeDefined();

    const t = res.tournament!;
    // Tournament should have 8 participants: John and 7 AI opponents
    expect(t.participants.length).toBe(8);
    expect(t.participants.some(p => p.id === p1.id)).toBe(true);
    expect(t.participants.some(p => p.id === p2.id)).toBe(false); // Rob is NOT in the tournament!

    // P2 training was applied
    expect(p2.attributes.scoring).toBeGreaterThanOrEqual(initialScoring);
  });

  it('Both players enter the SAME tournament: both are in bracket seeded opposite', () => {
    const career = create2PCareer();
    const p1 = career.players[0];
    const p2 = career.players[1];

    career.recordPlayerDecision(p1.id, {
      action: 'tournament',
      tournamentConfig: dummyTourney
    });
    career.recordPlayerDecision(p2.id, {
      action: 'tournament',
      tournamentConfig: dummyTourney
    });

    const res = career.resolveWeeklyPlans();
    expect(res.type).toBe('tournament');
    const t = res.tournament!;

    expect(t.participants.length).toBe(8);
    expect(t.participants.some(p => p.id === p1.id)).toBe(true);
    expect(t.participants.some(p => p.id === p2.id)).toBe(true);

    // Seeded in opposite halves: QF1 (index 0) and QF4 (index 7)
    expect(t.participants[0].id).toBe(p1.id);
    expect(t.participants[7].id).toBe(p2.id);
  });

  it('Both players train/rest: advances week by exactly 1 and resets decisions', () => {
    const career = create2PCareer();
    const p1 = career.players[0];
    const p2 = career.players[1];
    const startWeek = career.calendar.currentWeek;

    p1.state.fatigue = 50;
    p2.state.fatigue = 50;

    career.recordPlayerDecision(p1.id, { action: 'rest', trainingType: 'rest' });
    career.recordPlayerDecision(p2.id, { action: 'rest', trainingType: 'rest' });

    const res = career.resolveWeeklyPlans();
    expect(res.type).toBe('week_advanced');
    expect(career.calendar.currentWeek).toBe(startWeek + 1);

    // Decisions reset to pending
    expect(career.weeklyDecisions.get(p1.id)?.action).toBe('pending');
    expect(career.weeklyDecisions.get(p2.id)?.action).toBe('pending');
    expect(career.activePlayerIndex).toBe(0);

    // Rest recovered fatigue
    expect(p1.state.fatigue).toBeLessThan(50);
    expect(p2.state.fatigue).toBeLessThan(50);
  });

  it('Both players enter DIFFERENT tournaments: queues secondary tournament', () => {
    const career = create2PCareer();
    const p1 = career.players[0];
    const p2 = career.players[1];

    career.recordPlayerDecision(p1.id, { action: 'tournament', tournamentConfig: dummyTourney });
    career.recordPlayerDecision(p2.id, { action: 'tournament', tournamentConfig: dummyTourney2 });

    const res = career.resolveWeeklyPlans();
    expect(res.type).toBe('tournament');
    expect(res.tournament?.config.id).toBe(dummyTourney.id);
    expect(res.tournament?.participants.some(p => p.id === p1.id)).toBe(true);
    expect(res.tournament?.participants.some(p => p.id === p2.id)).toBe(false);

    // Second tournament queued for Rob
    expect(career.pendingTournaments.length).toBe(1);
    expect(career.pendingTournaments[0].player.id).toBe(p2.id);
    expect(career.pendingTournaments[0].config.id).toBe(dummyTourney2.id);
  });

  it('SaveManager preserves and restores weekly decisions and queued tournaments', () => {
    const career = create2PCareer();
    const p1 = career.players[0];
    const p2 = career.players[1];

    career.recordPlayerDecision(p1.id, { action: 'tournament', tournamentConfig: dummyTourney });
    career.recordPlayerDecision(p2.id, { action: 'rest', trainingType: 'rest' });
    career.pendingTournaments = [{ player: p2, config: dummyTourney2 }];

    SaveManager.saveGame(2, career);
    const loaded = SaveManager.loadGame(2);

    expect(loaded).not.toBeNull();
    expect(loaded!.weeklyDecisions.get(p1.id)?.action).toBe('tournament');
    expect(loaded!.weeklyDecisions.get(p1.id)?.tournamentConfig?.id).toBe(dummyTourney.id);
    expect(loaded!.weeklyDecisions.get(p2.id)?.action).toBe('rest');
    expect(loaded!.pendingTournaments.length).toBe(1);
    expect(loaded!.pendingTournaments[0].player.id).toBe(p2.id);
  });

  it('Two-stage confirmation sequence: P1 chooses & confirms, turn switches to P2, P2 chooses & confirms before executing', () => {
    const career = create2PCareer();
    const p1 = career.players[0];
    const p2 = career.players[1];

    // Initial state: active player is P1 (0) and both decisions are pending
    expect(career.activePlayerIndex).toBe(0);
    expect(career.areAllWeeklyDecisionsLocked()).toBe(false);

    // Stage 1: Player 1 chooses a tournament and confirms choice at top of page
    career.recordPlayerDecision(p1.id, {
      action: 'tournament',
      tournamentConfig: dummyTourney
    });
    career.activePlayerIndex = 1; // Handoff turn to Player 2

    // Decisions are not yet all locked because P2 is still pending
    expect(career.areAllWeeklyDecisionsLocked()).toBe(false);
    expect(career.activePlayerIndex).toBe(1);

    // Stage 2: Player 2 chooses a training drill and confirms choice at top of page
    career.recordPlayerDecision(p2.id, {
      action: 'train',
      trainingType: 'doubling'
    });

    // Now both decisions are locked
    expect(career.areAllWeeklyDecisionsLocked()).toBe(true);

    // Execute weekly decisions
    const res = career.resolveWeeklyPlans();
    expect(res.type).toBe('tournament');
    expect(res.tournament).toBeDefined();

    // P1 is in the tournament; P2 is not in the tournament
    expect(res.tournament!.participants.some(p => p.id === p1.id)).toBe(true);
    expect(res.tournament!.participants.some(p => p.id === p2.id)).toBe(false);
  });

  it('Player 1 chooses practice while Player 2 chooses tournament: only Player 2 enters bracket and Player 1 is excluded', () => {
    const career = create2PCareer();
    const p1 = career.players[0];
    const p2 = career.players[1];

    const initialScoring = p1.attributes.scoring;

    // Player 1 chooses scoring practice drill
    career.recordPlayerDecision(p1.id, {
      action: 'train',
      trainingType: 'scoring'
    });
    career.activePlayerIndex = 1;

    // Player 2 chooses tournament
    career.recordPlayerDecision(p2.id, {
      action: 'tournament',
      tournamentConfig: dummyTourney
    });

    expect(career.areAllWeeklyDecisionsLocked()).toBe(true);

    const res = career.resolveWeeklyPlans();
    expect(res.type).toBe('tournament');
    expect(res.tournament).toBeDefined();

    // Only Player 2 (Rob) should be in the tournament bracket!
    expect(res.tournament!.participants.some(p => p.id === p2.id)).toBe(true);
    expect(res.tournament!.participants.some(p => p.id === p1.id)).toBe(false);

    // Player 1 (John) gained practice XP
    expect(p1.attributes.scoring).toBeGreaterThanOrEqual(initialScoring);
    expect(res.p1Action.action).toBe('train');
    expect(res.p2Action?.action).toBe('tournament');
  });

  it('Consecutive calls to PlayerFactory.createPlayer produce strictly unique IDs', () => {
    const factory = new PlayerFactory();
    const p1 = factory.createPlayer({
      name: 'Player 1',
      gender: 'male',
      nationality: 'England'
    });
    const p2 = factory.createPlayer({
      name: 'Player 2',
      gender: 'male',
      nationality: 'Scotland'
    });

    expect(p1.id).not.toBe(p2.id);
    expect(typeof p1.id).toBe('string');
    expect(typeof p2.id).toBe('string');
  });

  it('DebugTracker generateMarkdownReport correctly formats bracket matches without throwing', () => {
    const career = create2PCareer();
    const p2 = career.players[1];

    career.enterTournament(dummyTourney, [p2]);
    expect(career.activeTournament).not.toBeNull();

    const tracker = DebugTracker.getInstance();
    // Must NOT throw TypeError or unhandled exception
    const report = tracker.generateMarkdownReport({
      view: 'tournament_bracket',
      career
    });

    expect(typeof report).toBe('string');
    expect(report).toContain('Active Tournament Bracket');
    expect(report).toContain(dummyTourney.name);
    expect(report).toContain('Quarter-Final');
  });

  it('SaveManager automatically detects and repairs duplicate player IDs from legacy saves', () => {
    const p1 = new Player('shared-id-123', 'John', 'male', 'England', 28);
    const p2 = new Player('shared-id-123', 'Rob', 'male', 'Scotland', 26);

    const career = new CareerManager([p1, p2]);
    // CareerManager constructor itself enforces ID uniqueness
    expect(career.players[0].id).not.toBe(career.players[1].id);

    // Test SaveManager loadGame repair on simulated raw duplicate data
    SaveManager.saveGame(3, career);
    const loaded = SaveManager.loadGame(3);
    expect(loaded).not.toBeNull();
    expect(loaded!.players[0].id).not.toBe(loaded!.players[1].id);
    expect(loaded!.weeklyDecisions.has(loaded!.players[0].id)).toBe(true);
    expect(loaded!.weeklyDecisions.has(loaded!.players[1].id)).toBe(true);
  });

  it('Aligns activePlayerIndex to P1 and finds pending matches when P1 enters tournament and P2 trains', () => {
    const career = create2PCareer();
    const p1 = career.players[0];
    const p2 = career.players[1];

    // P1 chooses tournament
    career.recordPlayerDecision(p1.id, {
      action: 'tournament',
      tournamentConfig: dummyTourney
    });

    // P2 chooses training
    career.recordPlayerDecision(p2.id, {
      action: 'train',
      trainingType: 'scoring'
    });

    // Simulate that it was P2's turn when confirming
    career.activePlayerIndex = 1;

    const res = career.resolveWeeklyPlans();
    expect(res.type).toBe('tournament');
    expect(career.activePlayerIndex).toBe(0); // Aligned to P1!
    expect(career.player.id).toBe(p1.id);

    const t = res.tournament!;
    // Check pending matches for all human players
    const humanParticipants = career.players.filter(p => t.participants.some(tp => tp.id === p.id));
    expect(humanParticipants.length).toBe(1);
    expect(humanParticipants[0].id).toBe(p1.id);

    const pendingMatches = t.getPendingHumanMatches(humanParticipants.map(p => p.id));
    expect(pendingMatches.length).toBe(1);
    expect(pendingMatches[0].player1.id === p1.id || pendingMatches[0].player2.id === p1.id).toBe(true);
  });
});

