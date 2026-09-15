import { describe, it, expect } from 'vitest';
import { Player } from '../../src/core/player/Player';
import {
  PressConferenceManager,
  MatchPressContext,
} from '../../src/core/media/PressConferenceManager';

describe('PressConferenceManager', () => {
  it('generates thrilling deciding leg questions when match went to the wire', () => {
    const context: MatchPressContext = {
      won: true,
      playerAvg: 94.5,
      opponentAvg: 93.8,
      isDecidingLeg: true,
      isRivalry: false,
      opponentName: 'Michael van Gerwen',
      tournamentName: 'World Matchplay',
      doublesAttempted: 10,
      doublesHit: 5,
    };

    const questions = PressConferenceManager.generateQuestions(context);
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0].contextTag).toBe('deciding_thriller');
    expect(questions[0].question).toContain('deciding leg');
    expect(questions[0].options.length).toBeGreaterThanOrEqual(2);
  });

  it('generates blowout win questions when player averaged 98+', () => {
    const context: MatchPressContext = {
      won: true,
      playerAvg: 103.4,
      opponentAvg: 88.0,
      isDecidingLeg: false,
      isRivalry: false,
      opponentName: 'Gerwyn Price',
      tournamentName: 'Premier League',
      doublesAttempted: 8,
      doublesHit: 6,
    };

    const questions = PressConferenceManager.generateQuestions(context);
    expect(questions[0].contextTag).toBe('blowout_win');
    expect(questions[0].question).toContain('103.4');
  });

  it('generates rivalry follow-up questions when facing a recognized rival', () => {
    const context: MatchPressContext = {
      won: true,
      playerAvg: 91.0,
      opponentAvg: 89.5,
      isDecidingLeg: false,
      isRivalry: true,
      rivalryRecord: {
        opponentId: 'p2',
        opponentName: 'Luke Littler',
        opponentTier: 'PDC Pro Tour',
        matchesPlayed: 4,
        playerWins: 2,
        opponentWins: 2,
        legsWon: 14,
        legsLost: 15,
        highestCheckoutInH2H: 140,
        bestAverageInH2H: 99.2,
        decidingLegMatches: 2,
        lastEncounterWeek: 12,
        lastEncounterYear: 2026,
        lastTournamentName: 'UK Open',
        lastResult: 'won',
        status: 'heated',
        recentResults: ['W', 'L', 'W', 'L'],
      },
      opponentName: 'Luke Littler',
      tournamentName: 'World Grand Prix',
      doublesAttempted: 8,
      doublesHit: 4,
    };

    const questions = PressConferenceManager.generateQuestions(context);
    expect(questions.length).toBe(2);
    expect(questions[1].contextTag).toBe('rivalry_clash');
    expect(questions[1].question).toContain('HEATED');
  });

  it('applies answer effects to player confidence and form correctly', () => {
    const player = new Player('p1', 'Phil', 'male', 'England', 30);
    player.state.confidence = 60;
    player.state.form = 50;

    PressConferenceManager.applyAnswerEffects(player, {
      id: 'opt1',
      tone: 'confident',
      label: 'Bravado',
      statement: 'I am the best',
      effects: {
        confidenceDelta: 10,
        formDelta: 5,
      },
    });

    expect(player.state.confidence).toBe(70);
    expect(player.state.form).toBe(55);
  });
});
