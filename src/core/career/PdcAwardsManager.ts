/**
 * PDC Annual Awards & Honours Gala
 * Evaluates official end-of-season accolades: Player of the Year, Young Player of the Year,
 * ProTour Rookie of the Year, and Televised Performance of the Year.
 */

import { Player } from '../player/Player';

export interface PdcAnnualAward {
  id: 'player_of_the_year' | 'young_player_of_the_year' | 'rookie_of_the_year' | 'performance_of_the_year';
  title: string;
  category: string;
  winnerPlayerId: string;
  winnerPlayerName: string;
  winnerNationality: string;
  isHuman: boolean;
  citation: string;
  year: number;
  trophyIcon: string;
}

export interface SeasonAwardsGala {
  year: number;
  awards: PdcAnnualAward[];
  humanAwardsCount: number;
}

export class PdcAwardsManager {
  /**
   * Evaluates all PDC season awards based on Order of Merit performance, age, and records
   */
  public static evaluateSeasonAwards(
    allPlayers: Player[],
    humanPlayerIds: string[],
    year: number,
    televisedHighlight?: { player: Player; avg: number; matchName: string }
  ): SeasonAwardsGala {
    const awards: PdcAnnualAward[] = [];

    // Sort players by ranking (primary) and prize money
    const sorted = [...allPlayers].sort((a, b) => {
      if (a.ranking > 0 && b.ranking > 0) return a.ranking - b.ranking;
      if (a.ranking > 0) return -1;
      if (b.ranking > 0) return 1;
      return b.prizeMoneyTotal - a.prizeMoneyTotal;
    });

    // 1. PDC PLAYER OF THE YEAR (Rank #1 or highest prize money)
    const poty = sorted[0];
    if (poty) {
      awards.push({
        id: 'player_of_the_year',
        title: 'PDC Player of the Year',
        category: 'Premier Circuit Honour',
        winnerPlayerId: poty.id,
        winnerPlayerName: poty.name,
        winnerNationality: poty.nationality,
        isHuman: humanPlayerIds.includes(poty.id),
        citation: `Finished season ranked #${poty.ranking || 1} in the PDC Order of Merit with £${poty.prizeMoneyTotal.toLocaleString()} career earnings.`,
        year,
        trophyIcon: '🏆'
      });
    }

    // 2. YOUNG PLAYER OF THE YEAR (Age <= 25)
    const youngPlayers = sorted.filter(p => p.age <= 25);
    const ypoty = youngPlayers[0] || poty;
    if (ypoty) {
      awards.push({
        id: 'young_player_of_the_year',
        title: 'PDC Young Player of the Year',
        category: 'Next-Gen Prodigy Honour',
        winnerPlayerId: ypoty.id,
        winnerPlayerName: ypoty.name,
        winnerNationality: ypoty.nationality,
        isHuman: humanPlayerIds.includes(ypoty.id),
        citation: `At age ${ypoty.age}, finished ranked #${ypoty.ranking || 1} as the standout young talent on the professional tour.`,
        year,
        trophyIcon: '⭐'
      });
    }

    // 3. TOUR CARD ROOKIE OF THE YEAR
    // First year card holders or players with lowest matches played in tier
    const rookies = sorted.filter(p => p.hasTourCard && p.age <= 28);
    const roty = rookies.length > 0 ? rookies[0] : (sorted[1] || poty);
    if (roty) {
      awards.push({
        id: 'rookie_of_the_year',
        title: 'PDC Pro Tour Rookie of the Year',
        category: 'Breakthrough Performance',
        winnerPlayerId: roty.id,
        winnerPlayerName: roty.name,
        winnerNationality: roty.nationality,
        isHuman: humanPlayerIds.includes(roty.id),
        citation: `Seamlessly transitioned into the pro ranks, breaking into the world ranking top flight in their debut PDC campaign.`,
        year,
        trophyIcon: '🎖️'
      });
    }

    // 4. TELEVISED PERFORMANCE OF THE YEAR
    if (televisedHighlight) {
      awards.push({
        id: 'performance_of_the_year',
        title: 'Televised Performance of the Year',
        category: 'Oche Broadcast Masterclass',
        winnerPlayerId: televisedHighlight.player.id,
        winnerPlayerName: televisedHighlight.player.name,
        winnerNationality: televisedHighlight.player.nationality,
        isHuman: humanPlayerIds.includes(televisedHighlight.player.id),
        citation: `Electrified the crowd at ${televisedHighlight.matchName} averaging an astounding ${televisedHighlight.avg.toFixed(2)} on live television!`,
        year,
        trophyIcon: '⚡'
      });
    } else {
      // Pick highest scoring player
      const bestScorer = [...allPlayers].sort((a, b) => b.attributes.scoring - a.attributes.scoring)[0] || poty;
      awards.push({
        id: 'performance_of_the_year',
        title: 'Televised Performance of the Year',
        category: 'Oche Broadcast Masterclass',
        winnerPlayerId: bestScorer.id,
        winnerPlayerName: bestScorer.name,
        winnerNationality: bestScorer.nationality,
        isHuman: humanPlayerIds.includes(bestScorer.id),
        citation: `Blistering scoring exhibition with laser treble consistency on the main broadcast stage.`,
        year,
        trophyIcon: '⚡'
      });
    }

    const humanAwardsCount = awards.filter(a => a.isHuman).length;

    return {
      year,
      awards,
      humanAwardsCount
    };
  }
}
