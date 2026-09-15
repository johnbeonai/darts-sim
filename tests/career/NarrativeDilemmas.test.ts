import { describe, it, expect } from 'vitest';
import { Player } from '../../src/core/player/Player';
import { CareerManager } from '../../src/core/career/CareerManager';
import { NarrativeDilemmaManager, DILEMMA_CATALOG } from '../../src/core/career/NarrativeDilemmaManager';
import { SaveManager } from '../../src/storage/SaveManager';

describe('NarrativeDilemmaManager: Off-the-Oche Lifestyle & Decision Engine', () => {
  it('should evaluate and return dilemmas on landmark weeks', () => {
    const dilemmaWeek10 = NarrativeDilemmaManager.evaluateWeeklyDilemma(10);
    expect(dilemmaWeek10).not.toBeNull();
    expect(dilemmaWeek10?.options).toHaveLength(2);
    expect(dilemmaWeek10?.title).toBeDefined();

    const dilemmaWeek24 = NarrativeDilemmaManager.evaluateWeeklyDilemma(24);
    expect(dilemmaWeek24).not.toBeNull();
  });

  it('should correctly apply positive and negative consequences of chosen dilemmas', () => {
    const player = new Player('p1', 'Player One', 'male', 'England', 25);
    player.bankBalance = 1000;
    player.state.fatigue = 20;
    player.state.confidence = 50;
    player.state.form = 50;

    const exhibitionGala = DILEMMA_CATALOG.find(d => d.id === 'friday-exhibition-gala')!;

    // Choose option A: Accept gala (+£7,500, +16 fatigue, -4 form)
    const optA = exhibitionGala.options[0];
    const outcome = NarrativeDilemmaManager.resolveChoice(player, optA);

    expect(outcome).toContain('£7,500');
    expect(player.bankBalance).toBe(8500);
    expect(player.state.fatigue).toBe(36);
    expect(player.state.confidence).toBe(55);
    expect(player.state.form).toBe(46);
  });

  it('should persist pendingDilemma across save slots using SaveManager', () => {
    const player = new Player('p-save', 'Save Tester', 'male', 'Scotland', 28);
    const career = new CareerManager(player);

    career.pendingDilemma = DILEMMA_CATALOG[0];
    SaveManager.saveGame(2, career);

    const loaded = SaveManager.loadGame(2);
    expect(loaded).not.toBeNull();
    expect(loaded?.pendingDilemma).not.toBeNull();
    expect(loaded?.pendingDilemma?.id).toBe('friday-exhibition-gala');
  });
});
