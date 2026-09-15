import { describe, it, expect } from 'vitest';
import { Player } from '../../src/core/player/Player';
import { MindGamesManager } from '../../src/core/rivalry/MindGamesManager';

describe('MindGamesManager', () => {
  const createPlayer = (id: string, conf: number, form: number, pres: number): Player => {
    const p = new Player(id, `Player ${id}`, 'male', 'ENG', 25, { pressure: pres }, { confidence: conf, form: form });
    return p;
  };

  it('Ice-Cold Professional increases player confidence and composure', () => {
    const p1 = createPlayer('1', 50, 50, 50);
    const p2 = createPlayer('2', 50, 50, 50);

    const result = MindGamesManager.applyStance('ice_cold', p1, p2);

    expect(p1.state.confidence).toBe(58);
    expect(p1.state.form).toBe(52);
    expect(p1.attributes.pressure).toBe(55);
    
    // Opponent unchanged
    expect(p2.state.confidence).toBe(50);
    
    expect(result.stance.title).toBe('Ice-Cold Professional');
  });

  it('Psychological Needle drains opponent confidence and form', () => {
    const p1 = createPlayer('1', 50, 50, 50);
    const p2 = createPlayer('2', 50, 50, 50);

    const result = MindGamesManager.applyStance('psychological_needle', p1, p2);

    expect(p1.state.confidence).toBe(55);
    
    // Opponent drains
    expect(p2.state.confidence).toBe(38); // 50 - 12
    
    expect(result.crowdHostilityDelta).toBe(20);
  });

  it('Fiery Staredown gives huge form boost but lowers composure', () => {
    const p1 = createPlayer('1', 50, 50, 50);
    const p2 = createPlayer('2', 50, 50, 50);

    MindGamesManager.applyStance('fiery_staredown', p1, p2);

    expect(p1.state.form).toBe(60); // 50 + 10
    expect(p1.state.confidence).toBe(56);
    expect(p1.attributes.pressure).toBe(47); // 50 - 3

    expect(p2.state.confidence).toBe(44); // 50 - 6
  });

  it('Gracious Respect boosts both players confidence but reduces crowd hostility', () => {
    const p1 = createPlayer('1', 50, 50, 50);
    const p2 = createPlayer('2', 50, 50, 50);

    const res = MindGamesManager.applyStance('gracious_respect', p1, p2);

    expect(p1.state.confidence).toBe(55);
    expect(p1.attributes.pressure).toBe(58); // 50 + 8

    expect(p2.state.confidence).toBe(53); // 50 + 3
    
    expect(res.crowdHostilityDelta).toBe(-15);
  });
});
