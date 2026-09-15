import { describe, it, expect, beforeEach } from 'vitest';
import { Player } from '../../src/core/player/Player';
import { CareerManager } from '../../src/core/career/CareerManager';
import { SaveManager } from '../../src/storage/SaveManager';

describe('SaveManager 2-Player Persistence & Slot Selection', () => {
  beforeEach(() => {
    SaveManager.clearAll();
  });

  it('saves and loads a 2-player career with both players preserved', () => {
    const p1 = new Player('p1', 'Player Alpha', 'male', 'England', 24);
    const p2 = new Player('p2', 'Player Beta', 'male', 'Scotland', 26);
    p1.bankBalance = 500;
    p2.bankBalance = 750;

    const career = new CareerManager([p1, p2]);
    SaveManager.saveGame(2, career);

    const slots = SaveManager.listSlots();
    const slot2 = slots.find(s => s.slotId === 2);

    expect(slot2).toBeDefined();
    expect(slot2?.exists).toBe(true);
    expect(slot2?.isTwoPlayer).toBe(true);
    expect(slot2?.playerName).toBe('Player Alpha');
    expect(slot2?.player2Name).toBe('Player Beta');

    const loaded = SaveManager.loadGame(2);
    expect(loaded).not.toBeNull();
    expect(loaded?.isTwoPlayer).toBe(true);
    expect(loaded?.players.length).toBe(2);
    expect(loaded?.players[0].name).toBe('Player Alpha');
    expect(loaded?.players[0].bankBalance).toBe(500);
    expect(loaded?.players[1].name).toBe('Player Beta');
    expect(loaded?.players[1].bankBalance).toBe(750);
  });

  it('correctly handles 1-player career backwards compatibility', () => {
    const p1 = new Player('p1', 'Solo Prodigy', 'male', 'Wales', 19);
    p1.bankBalance = 300;

    const career = new CareerManager(p1);
    SaveManager.saveGame(1, career);

    const slots = SaveManager.listSlots();
    const slot1 = slots.find(s => s.slotId === 1);

    expect(slot1?.exists).toBe(true);
    expect(slot1?.isTwoPlayer).toBe(false);
    expect(slot1?.playerName).toBe('Solo Prodigy');
    expect(slot1?.player2Name).toBeUndefined();

    const loaded = SaveManager.loadGame(1);
    expect(loaded).not.toBeNull();
    expect(loaded?.isTwoPlayer).toBe(false);
    expect(loaded?.players.length).toBe(1);
    expect(loaded?.player.name).toBe('Solo Prodigy');
  });
});
