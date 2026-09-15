import { Player } from '../player/Player';

export interface LifestyleUpgrade {
  id: string;
  name: string;
  description: string;
  weeklyUpkeep: number;
  fatigueRecoveryBonus: number; // Applied at end of week
  formBonus: number;            // Applied at end of week
  requiredRank?: number;
}

export const LIFESTYLE_UPGRADES: LifestyleUpgrade[] = [
  {
    id: 'gym_membership',
    name: 'Elite Gym Membership',
    description: 'Improves weekly stamina recovery (+5%).',
    weeklyUpkeep: 50,
    fatigueRecoveryBonus: 5,
    formBonus: 0
  },
  {
    id: 'sports_psychologist',
    name: 'Sports Psychologist',
    description: 'Maintains mental form (+2 Form).',
    weeklyUpkeep: 150,
    fatigueRecoveryBonus: 0,
    formBonus: 2
  },
  {
    id: 'home_practice_studio',
    name: 'Home Practice Studio',
    description: 'Improves focus and form consistency (+3 Form, +2% Fatigue Recovery).',
    weeklyUpkeep: 400,
    fatigueRecoveryBonus: 2,
    formBonus: 3
  },
  {
    id: 'private_nutritionist',
    name: 'Private Nutritionist & Chef',
    description: 'Massive stamina recovery boost (+10%).',
    weeklyUpkeep: 800,
    fatigueRecoveryBonus: 10,
    formBonus: 0,
    requiredRank: 64
  },
  {
    id: 'private_jet_membership',
    name: 'Private Jet Membership',
    description: 'Arrive in style and peak physical condition (+15% Recovery, +5 Form).',
    weeklyUpkeep: 3000,
    fatigueRecoveryBonus: 15,
    formBonus: 5,
    requiredRank: 16
  }
];

export class LifestyleManager {
  public static processWeeklyUpkeep(player: Player): { totalCost: number; messages: string[] } {
    if (!player.activeLifestyleUpgrades) {
      player.activeLifestyleUpgrades = [];
    }

    let totalCost = 0;
    const messages: string[] = [];

    const toRemove: string[] = [];

    for (const upgradeId of player.activeLifestyleUpgrades) {
      const def = LIFESTYLE_UPGRADES.find(u => u.id === upgradeId);
      if (def) {
        if (player.bankBalance >= def.weeklyUpkeep) {
          player.bankBalance -= def.weeklyUpkeep;
          totalCost += def.weeklyUpkeep;
          
          if (player.state) {
            player.state.fatigue = Math.max(0, player.state.fatigue - def.fatigueRecoveryBonus);
            player.state.form = Math.min(100, player.state.form + def.formBonus);
          }
        } else {
          // Cannot afford, remove upgrade
          toRemove.push(upgradeId);
          messages.push(`Could not afford upkeep for ${def.name}. It has been canceled.`);
        }
      }
    }

    if (toRemove.length > 0) {
      player.activeLifestyleUpgrades = player.activeLifestyleUpgrades.filter(id => !toRemove.includes(id));
    }

    return { totalCost, messages };
  }

  public static purchaseUpgrade(player: Player, upgradeId: string): { success: boolean; message: string } {
    if (!player.activeLifestyleUpgrades) {
      player.activeLifestyleUpgrades = [];
    }

    if (player.activeLifestyleUpgrades.includes(upgradeId)) {
      return { success: false, message: 'You already own this upgrade.' };
    }

    const def = LIFESTYLE_UPGRADES.find(u => u.id === upgradeId);
    if (!def) return { success: false, message: 'Upgrade not found.' };

    if (def.requiredRank && (player.ranking === 0 || player.ranking > def.requiredRank)) {
      return { success: false, message: `Requires Order of Merit rank Top ${def.requiredRank}.` };
    }

    player.activeLifestyleUpgrades.push(upgradeId);
    return { success: true, message: `Successfully purchased ${def.name}. Weekly upkeep is £${def.weeklyUpkeep}.` };
  }

  public static cancelUpgrade(player: Player, upgradeId: string): { success: boolean; message: string } {
    if (!player.activeLifestyleUpgrades) {
      return { success: false, message: 'No active upgrades.' };
    }

    const initialLength = player.activeLifestyleUpgrades.length;
    player.activeLifestyleUpgrades = player.activeLifestyleUpgrades.filter(id => id !== upgradeId);

    if (player.activeLifestyleUpgrades.length < initialLength) {
      return { success: true, message: `Canceled upgrade subscription.` };
    }
    return { success: false, message: 'Upgrade not found.' };
  }
}
