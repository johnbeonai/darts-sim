import { describe, it, expect } from 'vitest';
import { Player } from '../../src/core/player/Player';
import { CareerManager } from '../../src/core/career/CareerManager';
import { SeededRandomProvider } from '../../src/core/random/RandomProvider';

describe('2-Player Shared Circuit Career Mode', () => {
  it('initializes 2-player career with independent attributes, bank balances, and turns', () => {
    const rng = new SeededRandomProvider(42);
    const p1 = new Player('p1', 'Player One', 'male', 'England', 21);
    const p2 = new Player('p2', 'Player Two', 'male', 'Scotland', 23);

    p1.bankBalance = 200;
    p2.bankBalance = 350;

    const career = new CareerManager([p1, p2], rng);

    expect(career.isTwoPlayer).toBe(true);
    expect(career.players.length).toBe(2);
    expect(career.player.id).toBe('p1');
    expect(career.secondPlayer?.id).toBe('p2');
    expect(career.humanPlayerIds).toEqual(['p1', 'p2']);

    // Turn switching
    expect(career.activePlayerIndex).toBe(0);
    career.switchPlayerTurn();
    expect(career.activePlayerIndex).toBe(1);
    expect(career.player.id).toBe('p2');

    career.switchPlayerTurn();
    expect(career.activePlayerIndex).toBe(0);
    expect(career.player.id).toBe('p1');
  });

  it('seeds both human players into opposite halves of the bracket when entering same tournament', () => {
    const rng = new SeededRandomProvider(123);
    const p1 = new Player('p1', 'Taylor', 'male', 'England', 25);
    const p2 = new Player('p2', 'Barney', 'male', 'Netherlands', 27);
    const career = new CareerManager([p1, p2], rng);

    const tourneyConfig = career.availableTournaments[0];
    const tournament = career.enterTournament(tourneyConfig, [p1, p2]);

    expect(tournament.participants.length).toBe(8);

    // QF 1 Player 1 is Seed 1 (Taylor)
    const qf1 = tournament.rounds[0][0];
    expect(qf1.player1.id).toBe(p1.id);

    // QF 4 Player 2 is Seed 2 (Barney)
    const qf4 = tournament.rounds[0][3];
    expect(qf4.player2.id).toBe(p2.id);

    // simulateAIMatches should skip both matches involving p1 and p2
    tournament.simulateAIMatches(career.humanPlayerIds);

    expect(qf1.isCompleted).toBe(false); // Taylor's match
    expect(qf4.isCompleted).toBe(false); // Barney's match
    expect(tournament.rounds[0][1].isCompleted).toBe(true); // AI vs AI match 2
    expect(tournament.rounds[0][2].isCompleted).toBe(true); // AI vs AI match 3
  });

  it('detects head-to-head matches between two human players', () => {
    const rng = new SeededRandomProvider(999);
    const p1 = new Player('p1', 'Human One', 'male', 'England', 20);
    const p2 = new Player('p2', 'Human Two', 'male', 'Wales', 22);
    const career = new CareerManager([p1, p2], rng);

    const tournament = career.enterTournament(career.availableTournaments[0], [p1, p2]);

    // Construct mock final match between p1 and p2
    const mockFinal = {
      id: 'final-test',
      roundName: 'Final' as const,
      roundIndex: 2,
      player1: p1,
      player2: p2,
      winner: null,
      match: null,
      isCompleted: false
    };

    expect(tournament.isHeadToHead(mockFinal, career.humanPlayerIds)).toBe(true);
  });

  it('advances week and resets decisions for both players', () => {
    const rng = new SeededRandomProvider(555);
    const p1 = new Player('p1', 'Player 1', 'male', 'England', 20);
    const p2 = new Player('p2', 'Player 2', 'male', 'Ireland', 21);
    const career = new CareerManager([p1, p2], rng);

    // Register decisions
    career.weeklyDecisions.set(p1.id, { playerId: p1.id, action: 'train', trainingType: 'scoring' });
    career.weeklyDecisions.set(p2.id, { playerId: p2.id, action: 'rest' });

    expect(career.areAllWeeklyDecisionsLocked()).toBe(true);

    const initialWeek = career.calendar.currentWeek;
    career.advanceWeek();

    expect(career.calendar.currentWeek).toBe(initialWeek + 1);
    expect(career.activePlayerIndex).toBe(0);
    expect(career.weeklyDecisions.get(p1.id)?.action).toBe('pending');
    expect(career.weeklyDecisions.get(p2.id)?.action).toBe('pending');
  });
});
