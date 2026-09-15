import { describe, it, expect } from 'vitest';
import { AroundTheClockGame } from '../../src/core/minigames/AroundTheClockGame';
import { CricketGame } from '../../src/core/minigames/CricketGame';
import { Checkout121Game } from '../../src/core/minigames/Checkout121Game';
import { ShanghaiGame } from '../../src/core/minigames/ShanghaiGame';

describe('Practice Mini-Game: Around the Clock', () => {
  it('should advance targets sequentially in standard mode', () => {
    const atc = new AroundTheClockGame('standard', false);
    expect(atc.getCurrentTarget()).toBe(1);
    expect(atc.getCurrentTargetLabel()).toBe('1');

    // Miss on target 1 (throws at 20)
    const miss = atc.recordDart(20, 1);
    expect(miss.wasHit).toBe(false);
    expect(atc.getCurrentTarget()).toBe(1);

    // Hit target 1
    const hit1 = atc.recordDart(1, 1);
    expect(hit1.wasHit).toBe(true);
    expect(atc.getCurrentTarget()).toBe(2);

    // Hit target 2
    atc.recordDart(2, 1);
    expect(atc.getCurrentTarget()).toBe(3);
    expect(atc.getDartsThrown()).toBe(3);
    expect(atc.getHitsCount()).toBe(2);
  });

  it('should advance multiple steps when bonus is enabled', () => {
    const atc = new AroundTheClockGame('standard', true);
    expect(atc.getCurrentTarget()).toBe(1);

    // Treble 1 should advance 3 steps (from 1 to 4)
    atc.recordDart(1, 3);
    expect(atc.getCurrentTarget()).toBe(4);

    // Double 4 should advance 2 steps (from 4 to 6)
    atc.recordDart(4, 2);
    expect(atc.getCurrentTarget()).toBe(6);
  });

  it('should enforce doubles only in doubles_only mode', () => {
    const atc = new AroundTheClockGame('doubles_only');
    expect(atc.getCurrentTargetLabel()).toBe('D1');

    // Single 1 should not advance in doubles only
    const singleDart = atc.recordDart(1, 1);
    expect(singleDart.wasHit).toBe(false);
    expect(atc.getCurrentTarget()).toBe(1);

    // Double 1 advances
    const doubleDart = atc.recordDart(1, 2);
    expect(doubleDart.wasHit).toBe(true);
    expect(atc.getCurrentTargetLabel()).toBe('D2');
  });

  it('should complete the sequence at the bullseye', () => {
    const atc = new AroundTheClockGame('standard', false);
    // Fast advance to Bull (index 20 is 25, index 21 is 50)
    const seq = atc.getTargetSequence();
    for (let i = 0; i < seq.length - 2; i++) {
      atc.recordDart(seq[i], 1);
    }
    expect(atc.getCurrentTarget()).toBe(25);
    expect(atc.getCurrentTargetLabel()).toBe('BULL');

    // Hit Outer Bull (25)
    atc.recordDart(25, 1);
    expect(atc.getCurrentTarget()).toBe(50);
    expect(atc.getCurrentTargetLabel()).toBe('D-BULL');
    expect(atc.getIsCompleted()).toBe(false);

    // Hit Bullseye (segment 25, mult 2)
    atc.recordDart(25, 2);
    expect(atc.getIsCompleted()).toBe(true);
    expect(atc.getCurrentTargetLabel()).toBe('FINISHED!');
    expect(atc.getProgressPercent()).toBe(100);
  });

  it('should support undoing darts', () => {
    const atc = new AroundTheClockGame('standard', false);
    atc.recordDart(1, 1);
    expect(atc.getCurrentTarget()).toBe(2);

    const undone = atc.undoLastDart();
    expect(undone).toBe(true);
    expect(atc.getCurrentTarget()).toBe(1);
    expect(atc.getDartsThrown()).toBe(0);
  });
});

describe('Practice Mini-Game: Cricket', () => {
  it('should require 3 marks to close a number and then score points', () => {
    const cricket = new CricketGame('two_player', 'Player 1', 'Player 2');

    // Player 1 throws Treble 20 (3 marks -> Closed!)
    cricket.recordDart(20, 3);
    expect(cricket.isTargetClosed(0, 20)).toBe(true);
    expect(cricket.getPlayerScores()[0]).toBe(0); // Closing marks do not score points

    // Player 1 throws Single 20 (already closed, opponent open -> scores 20!)
    const scoreDart = cricket.recordDart(20, 1);
    expect(scoreDart.pointsAdded).toBe(20);
    expect(cricket.getPlayerScores()[0]).toBe(20);

    // 3rd dart in visit
    cricket.recordDart(19, 1);
    expect(cricket.getPlayerMarks(0)[19]).toBe(1);

    // After 3 darts, turn passes to Player 2
    expect(cricket.getActivePlayerIndex()).toBe(1);
  });

  it('should deaden a number once both players close it', () => {
    const cricket = new CricketGame('two_player', 'Player 1', 'Player 2');

    // P1 closes 20 with Treble
    cricket.recordDart(20, 3);
    cricket.recordDart(1, 1);
    cricket.recordDart(1, 1); // P1 turn over

    expect(cricket.getActivePlayerIndex()).toBe(1);

    // P2 closes 20 with Treble
    cricket.recordDart(20, 3);
    expect(cricket.isTargetClosed(1, 20)).toBe(true);
    expect(cricket.isTargetDead(20)).toBe(true);

    // P2 throws another 20 - should score 0 because number is DEAD
    const deadDart = cricket.recordDart(20, 1);
    expect(deadDart.pointsAdded).toBe(0);
    expect(cricket.getPlayerScores()[1]).toBe(0);
  });

  it('should award victory when all targets closed and points are ahead', () => {
    const cricket = new CricketGame('solo', 'Solo Player');
    // Close 20, 19, 18, 17, 16, 15, 25
    CricketGame.TARGETS.forEach(target => {
      cricket.recordDart(target, target === 25 ? 2 : 3);
      if (target === 25) {
        // Bull needs 3 marks: mult 2 gives 2, mult 1 gives 1
        cricket.recordDart(25, 1);
      }
    });

    expect(cricket.allTargetsClosed(0)).toBe(true);
    expect(cricket.getIsCompleted()).toBe(true);
    expect(cricket.getWinnerIndex()).toBe(0);
  });
});

describe('Practice Mini-Game: 121 Checkout Challenge', () => {
  it('should advance to 122 upon successful checkout on a double within 9 darts', () => {
    const game = new Checkout121Game(121);
    expect(game.getCurrentTarget()).toBe(121);
    expect(game.getDartsRemainingThisTarget()).toBe(9);

    // 1st dart: Treble 20 (60) -> Remainder 61
    const d1 = game.recordDart(20, 3);
    expect(d1.status).toBe('continue');
    expect(game.getCurrentRemainingScore()).toBe(61);
    expect(game.getDartsRemainingThisTarget()).toBe(8);

    // 2nd dart: Treble 11 (33) -> Remainder 28
    const d2 = game.recordDart(11, 3);
    expect(d2.status).toBe('continue');
    expect(game.getCurrentRemainingScore()).toBe(28);

    // 3rd dart: Double 14 (28) -> Check out!
    const d3 = game.recordDart(14, 2);
    expect(d3.status).toBe('checkout');
    expect(d3.newTarget).toBe(122);
    expect(game.getCurrentTarget()).toBe(122);
    expect(game.getTotalCheckouts()).toBe(1);
    expect(game.getCurrentStreak()).toBe(1);
    expect(game.getDartsRemainingThisTarget()).toBe(9); // 9 fresh darts granted
  });

  it('should bust if score reaches 1 or 0 without double and restore visit start score', () => {
    const game = new Checkout121Game(121);

    // 1st dart: Treble 20 (60) -> 61
    game.recordDart(20, 3);
    // 2nd dart: Treble 20 (60) -> 1 (Bust!)
    const bustDart = game.recordDart(20, 3);
    expect(bustDart.status).toBe('bust');
    expect(game.getCurrentRemainingScore()).toBe(121); // Reverted to start of visit
    // Bust finishes the 3-dart visit, so 3 darts were used (6 remaining)
    expect(game.getDartsRemainingThisTarget()).toBe(6);
  });

  it('should reset to 121 when all 9 darts fail', () => {
    const game = new Checkout121Game(121);
    // Throw 3 visits of misses (9 darts total)
    for (let i = 0; i < 8; i++) {
      game.recordDart(0, 1);
    }
    expect(game.getDartsRemainingThisTarget()).toBe(1);

    // 9th dart
    const finalDart = game.recordDart(0, 1);
    expect(finalDart.status).toBe('failed');
    expect(game.getCurrentTarget()).toBe(121);
    expect(game.getCurrentStreak()).toBe(0);
    expect(game.getDartsRemainingThisTarget()).toBe(9);
  });

  it('should provide checkout route suggestions', () => {
    const game = new Checkout121Game(121);
    const routes = game.getSuggestedRoutes();
    expect(routes.length).toBeGreaterThan(0);
    expect(routes[0]).toContain('T20');
  });
});

describe('Practice Mini-Game: Shanghai', () => {
  it('should only score points on the current round number', () => {
    const game = new ShanghaiGame(7, 'solo', 'Player 1');
    expect(game.getCurrentRound()).toBe(1);

    // Round 1: Throw at 20 (should score 0 points)
    game.recordDart(20, 3);
    expect(game.getPlayerScores()[0]).toBe(0);

    // Throw at 1 (Single 1 -> scores 1 point)
    game.recordDart(1, 1);
    expect(game.getPlayerScores()[0]).toBe(1);

    // Throw at 1 (Double 1 -> scores 2 points)
    game.recordDart(1, 2);
    expect(game.getPlayerScores()[0]).toBe(3);

    // After 3 darts, round advances to Round 2
    expect(game.getCurrentRound()).toBe(2);
  });

  it('should trigger instant win upon hitting a SHANGHAI (Single + Double + Treble in 1 visit)', () => {
    const game = new ShanghaiGame(7, 'solo', 'Player 1');
    expect(game.getCurrentRound()).toBe(1);

    // Hit Single 1
    game.recordDart(1, 1);
    // Hit Double 1
    game.recordDart(1, 2);
    // Hit Treble 1 -> SHANGHAI!
    const res = game.recordDart(1, 3);

    expect(res.isShanghaiHit).toBe(true);
    expect(game.getIsCompleted()).toBe(true);
    expect(game.getShanghaiAchievedBy()).toBe(0);
    expect(game.getWinnerIndex()).toBe(0);
  });

  it('should complete after final round and crown highest scorer', () => {
    const game = new ShanghaiGame(7, 'two_player', 'Alice', 'Bob');

    // Play 7 rounds with simple hits
    for (let r = 1; r <= 7; r++) {
      // Alice hits Single r, Single r, Miss
      game.recordDart(r, 1);
      game.recordDart(r, 1);
      game.recordDart(0, 1);

      // Bob hits Single r, Miss, Miss
      game.recordDart(r, 1);
      game.recordDart(0, 1);
      game.recordDart(0, 1);
    }

    expect(game.getIsCompleted()).toBe(true);
    expect(game.getPlayerScores()[0]).toBeGreaterThan(game.getPlayerScores()[1]);
    expect(game.getWinnerIndex()).toBe(0);
  });
});
