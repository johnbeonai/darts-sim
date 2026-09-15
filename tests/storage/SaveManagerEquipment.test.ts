import { describe, it, expect } from 'vitest';
import { Player } from '../../src/core/player/Player';
import { CareerManager } from '../../src/core/career/CareerManager';
import { SaveManager } from '../../src/storage/SaveManager';
import { getEquipmentItemById } from '../../src/core/equipment/EquipmentItem';
import { SponsorshipManager } from '../../src/core/finance/SponsorshipManager';
import { StaffManager } from '../../src/core/finance/StaffManager';

describe('SaveManager Equipment & Finance Serialization', () => {
  it('Saves and loads player equipment loadout, inventory, sponsorships, and hired staff', () => {
    const p1 = new Player('p1', 'John', 'male', 'England', 28);
    const p2 = new Player('p2', 'Rob', 'male', 'Scotland', 26);
    const career = new CareerManager([p1, p2]);

    // Customize Player 1 gear & finances
    p1.bankBalance = 420;
    const customBarrel = getEquipmentItemById('barrel-oche-sniper-90-23')!;
    p1.buyEquipmentItem(customBarrel, 0);
    p1.equipItem(customBarrel);

    SponsorshipManager.signContract(p1, 'sponsor-red-lion', p1.activeSponsorships);
    StaffManager.hireStaff(p1, 'coach-dave', p1.hiredStaffIds);

    // Customize Player 2 gear & finances
    p2.bankBalance = 750;
    const tourSet = getEquipmentItemById('set-apex-predator-24')!;
    p2.buyEquipmentItem(tourSet, 0);
    p2.equipItem(tourSet);
    StaffManager.hireStaff(p2, 'physio-sarah', p2.hiredStaffIds);

    // Save to Slot 3
    SaveManager.saveGame(3, career);

    // Reload from Slot 3
    const loadedCareer = SaveManager.loadGame(3);
    expect(loadedCareer).not.toBeNull();

    const loadedP1 = loadedCareer!.players[0];
    const loadedP2 = loadedCareer!.players[1];

    // Verify Player 1 state
    expect(loadedP1.bankBalance).toBe(420 - customBarrel.price);
    expect(loadedP1.ownedEquipmentIds).toContain(customBarrel.id);
    expect(loadedP1.equippedLoadout.barrelId).toBe(customBarrel.id);
    expect(loadedP1.activeSponsorships.length).toBe(1);
    expect(loadedP1.activeSponsorships[0].id).toBe('sponsor-red-lion');
    expect(loadedP1.hiredStaffIds).toContain('coach-dave');

    // Verify Player 2 state
    expect(loadedP2.bankBalance).toBe(750 - tourSet.price);
    expect(loadedP2.ownedEquipmentIds).toContain(tourSet.id);
    expect(loadedP2.equipment.completeSetId).toBe(tourSet.id);
    expect(loadedP2.hiredStaffIds).toContain('physio-sarah');
  });
});
