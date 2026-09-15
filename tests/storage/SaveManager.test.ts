import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from '../../src/storage/SaveManager';
import { Player } from '../../src/core/player/Player';
import { CareerManager } from '../../src/core/career/CareerManager';

describe('SaveManager (4 Slots)', () => {
  beforeEach(() => {
    SaveManager.clearAll();
  });

  it('lists 4 available empty slots initially', () => {
    const slots = SaveManager.listSlots();
    expect(slots.length).toBe(4);
    expect(slots.every(s => !s.exists)).toBe(true);
  });

  it('saves and reloads a career identically from a slot', () => {
    const player = new Player('p1', 'Phil The Power', 'male', 'England', 32, {
      scoring: 70,
      doubling: 65
    });
    player.bankBalance = 850;

    const career = new CareerManager(player);
    career.calendar.currentWeek = 14;
    career.addLog({
      week: 14,
      year: 2026,
      title: 'Milestone Title',
      description: 'Won tournament',
      type: 'milestone'
    });

    SaveManager.saveGame(1, career);

    const slots = SaveManager.listSlots();
    expect(slots[0].exists).toBe(true);
    expect(slots[0].playerName).toBe('Phil The Power');
    expect(slots[0].bankBalance).toBe(850);

    const loaded = SaveManager.loadGame(1);
    expect(loaded).not.toBeNull();
    expect(loaded?.player.name).toBe('Phil The Power');
    expect(loaded?.player.attributes.scoring).toBe(70);
    expect(loaded?.player.bankBalance).toBe(850);
    expect(loaded?.calendar.currentWeek).toBe(14);
    expect(loaded?.eventLogs.length).toBe(1);
  });

  it('deletes a save slot cleanly', () => {
    const player = new Player('p2', 'Gary', 'male', 'Scotland', 28);
    const career = new CareerManager(player);
    SaveManager.saveGame(2, career);

    expect(SaveManager.listSlots()[1].exists).toBe(true);
    SaveManager.deleteSlot(2);
    expect(SaveManager.listSlots()[1].exists).toBe(false);
  });
});
