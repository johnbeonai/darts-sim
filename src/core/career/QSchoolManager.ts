import { Player } from '../player/Player';

export interface QSchoolStageResult {
  day: number; // 1 to 4
  winnerId: string;
  winnerName: string;
  runnerUpId?: string;
  runnerUpName?: string;
  isCompleted: boolean;
}

export interface QSchoolLeaderboardEntry {
  playerId: string;
  playerName: string;
  nationality: string;
  points: number;
  stageWins: number;
  hasEarnedTourCard: boolean;
  isHuman: boolean;
}

export class QSchoolManager {
  public static readonly TOTAL_DAYS = 4;
  public static readonly CARDS_FROM_STANDINGS = 2;

  public static getPointsForFinish(finish: 'winner' | 'runnerUp' | 'semiFinalist' | 'quarterFinalist' | 'round16'): number {
    switch (finish) {
      case 'winner': return 10;
      case 'runnerUp': return 5;
      case 'semiFinalist': return 3;
      case 'quarterFinalist': return 2;
      case 'round16': return 1;
      default: return 0;
    }
  }

  /**
   * Processes a player's performance in a Q-School daily stage
   */
  public static processStagePerformance(
    player: Player,
    finish: 'winner' | 'runnerUp' | 'semiFinalist' | 'quarterFinalist' | 'round16',
    currentYear: number,
    stage: 'stage1' | 'final' = 'final'
  ): { tourCardEarned: boolean; finalStageQualified?: boolean; pointsEarned: number; message: string } {
    const points = this.getPointsForFinish(finish);
    player.qSchoolPoints = (player.qSchoolPoints || 0) + points;
    player.hasEnteredQSchool = true;
    if (player.tier === 'casual' || player.tier === 'pub' || player.tier === 'amateur') {
      player.tier = 'semi_pro';
    }

    if (stage === 'stage1') {
      // In Stage 1: Winner, runnerUp, semiFinalists, or cumulative points >= 3 qualify for Final Stage!
      const qualifies = finish === 'winner' || finish === 'runnerUp' || finish === 'semiFinalist' || (player.qSchoolPoints || 0) >= 3;
      if (qualifies) {
        player.qSchoolFinalQualified = true;
      }

      if (finish === 'winner') {
        return {
          tourCardEarned: false,
          finalStageQualified: true,
          pointsEarned: points,
          message: `🏆 Q-School First Stage Day Winner! ${player.name} has qualified directly for the Q-School Final Stage next week!`
        };
      } else if (qualifies) {
        return {
          tourCardEarned: false,
          finalStageQualified: true,
          pointsEarned: points,
          message: `🎯 Qualified for Final Stage! ${player.name} finished as ${finish} and advanced to the Q-School Final Stage.`
        };
      } else {
        return {
          tourCardEarned: false,
          finalStageQualified: false,
          pointsEarned: points,
          message: `${player.name} finished as ${finish} (+${points} pts), but did not reach the cutoff to qualify for the Final Stage.`
        };
      }
    }

    // Final Stage
    if (finish === 'winner') {
      player.awardTourCard(currentYear, 2);
      return {
        tourCardEarned: true,
        finalStageQualified: true,
        pointsEarned: points,
        message: `🏆 Q-School Final Stage Winner! ${player.name} has earned an official 2-Year PDC Tour Card!`
      };
    }

    return {
      tourCardEarned: false,
      finalStageQualified: true,
      pointsEarned: points,
      message: `${player.name} finished as ${finish} and earned ${points} Q-School Order of Merit points.`
    };
  }

  /**
   * Evaluates final Q-School leaderboard after Day 4 and awards Tour Cards to top qualifiers
   */
  public static finalizeQSchool(
    candidates: Player[],
    currentYear: number
  ): { awardedPlayers: Player[]; leaderboard: QSchoolLeaderboardEntry[] } {
    const sorted = [...candidates].sort((a, b) => {
      const ptsA = a.qSchoolPoints || 0;
      const ptsB = b.qSchoolPoints || 0;
      if (ptsB !== ptsA) return ptsB - ptsA;
      return b.attributes.scoring - a.attributes.scoring;
    });

    const awardedPlayers: Player[] = [];

    // Award Tour Cards to top non-card holders
    for (const p of sorted) {
      if (!p.hasTourCard && awardedPlayers.length < this.CARDS_FROM_STANDINGS) {
        if ((p.qSchoolPoints || 0) > 0) {
          p.awardTourCard(currentYear, 2);
          awardedPlayers.push(p);
        }
      }
    }

    const leaderboard: QSchoolLeaderboardEntry[] = sorted.map(p => ({
      playerId: p.id,
      playerName: p.name,
      nationality: p.nationality,
      points: p.qSchoolPoints || 0,
      stageWins: p.hasTourCard && !awardedPlayers.includes(p) ? 1 : 0,
      hasEarnedTourCard: p.hasTourCard,
      isHuman: false
    }));

    return { awardedPlayers, leaderboard };
  }
}
