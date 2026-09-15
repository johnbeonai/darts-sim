import { Player } from '../player/Player';
import { StaffManager } from '../finance/StaffManager';

export type TrainingType = 'scoring' | 'doubling' | 'consistency' | 'stamina' | 'rest';

export interface TrainingResult {
  trainingType: TrainingType;
  attributeTrained?: string;
  gain: number;
  fatigueChange: number;
  message: string;
}

export class TrainingManager {
  /**
   * Executes weekly training routine on player, modified by hired coaches and physiotherapists
   */
  public static executeTraining(player: Player, type: TrainingType): TrainingResult {
    const hired = player.hiredStaffIds || [];

    if (type === 'rest') {
      const physioBonus = StaffManager.getRestFatigueBonus(hired);
      const fatigueReduced = Math.min(player.state.fatigue, 35 + physioBonus);
      player.rest(fatigueReduced);
      player.adjustConfidence(5);
      return {
        trainingType: 'rest',
        gain: 0,
        fatigueChange: -fatigueReduced,
        message: physioBonus > 0
          ? `Physio-guided recovery week (-${fatigueReduced}% fatigue). Body recuperated and mind refreshed.`
          : 'Took a restful week off the oche. Fatigue fully recovered and mind refreshed.'
      };
    }

    // High fatigue dampens training effectiveness and adds risk
    const isExhausted = player.state.fatigue >= 70;
    const efficiency = isExhausted ? 0.35 : 1.0;

    // Growth is scaled by Work Ethic, distance to Potential ceiling, and hired coach multiplier
    const coachMod = StaffManager.getTrainingMultiplier(hired);
    const workModifier = (player.attributes.workEthic / 100) * coachMod;

    let gain = 0;
    let fatigueAdded = 20;
    let attrName = '';

    switch (type) {
      case 'scoring': {
        attrName = 'Scoring';
        const headroom = Math.max(0, player.attributes.potential - player.attributes.scoring);
        gain = Math.round((headroom * 0.05 * workModifier * efficiency) * 10) / 10;
        player.attributes.scoring = Math.min(player.attributes.potential, player.attributes.scoring + gain);
        fatigueAdded = 22;
        break;
      }
      case 'doubling': {
        attrName = 'Doubling';
        const headroom = Math.max(0, player.attributes.potential - player.attributes.doubling);
        gain = Math.round((headroom * 0.05 * workModifier * efficiency) * 10) / 10;
        player.attributes.doubling = Math.min(player.attributes.potential, player.attributes.doubling + gain);
        fatigueAdded = 20;
        break;
      }
      case 'consistency': {
        attrName = 'Consistency';
        const headroom = Math.max(0, player.attributes.potential - player.attributes.consistency);
        gain = Math.round((headroom * 0.04 * workModifier * efficiency) * 10) / 10;
        player.attributes.consistency = Math.min(player.attributes.potential, player.attributes.consistency + gain);
        fatigueAdded = 18;
        break;
      }
      case 'stamina': {
        attrName = 'Stamina';
        gain = Math.round((1.0 * workModifier * efficiency) * 10) / 10;
        player.attributes.stamina = Math.min(100, player.attributes.stamina + gain);
        fatigueAdded = 28;
        break;
      }
    }

    player.addFatigue(fatigueAdded);

    const message = isExhausted
      ? `Trained ${attrName} while exhausted! Low gains (+${gain}) and accumulated heavy fatigue.`
      : `Completed focused ${attrName} drills (+${gain} ${attrName}).`;

    return {
      trainingType: type,
      attributeTrained: attrName,
      gain,
      fatigueChange: fatigueAdded,
      message
    };
  }
}
