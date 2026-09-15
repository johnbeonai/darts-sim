import { Player } from '../player/Player';

export type RivalryStatus =
  | 'friendly'    // 1 match played
  | 'developing'  // 2-3 matches played
  | 'heated'      // High tension, close matches or deciding legs
  | 'nemesis'     // Rival has won >= 65% of encounters (min 3 matches)
  | 'dominated'   // Player has won >= 65% of encounters (min 3 matches)
  | 'classic';    // 5+ matches with neck-and-neck parity

export interface HeadToHeadRecord {
  opponentId: string;
  opponentName: string;
  opponentTier: string;
  matchesPlayed: number;
  playerWins: number;
  opponentWins: number;
  legsWon: number;
  legsLost: number;
  highestCheckoutInH2H: number;
  bestAverageInH2H: number;
  decidingLegMatches: number;
  lastEncounterWeek: number;
  lastEncounterYear: number;
  lastTournamentName: string;
  lastResult: 'won' | 'lost';
  status: RivalryStatus;
  recentResults: ('W' | 'L')[];
}

export class RivalryManager {
  /**
   * Computes dynamic rivalry status based on match count, win rates, and close games
   */
  public static calculateRivalryStatus(record: HeadToHeadRecord): RivalryStatus {
    const total = record.matchesPlayed;
    if (total <= 1) return 'friendly';

    const playerWinRate = record.playerWins / total;
    const opponentWinRate = record.opponentWins / total;

    // Dominated or Nemesis thresholds (minimum 3 matches)
    if (total >= 3) {
      if (opponentWinRate >= 0.65) return 'nemesis';
      if (playerWinRate >= 0.65) return 'dominated';
    }

    // Classic rivalry: 5+ matches with close parity (40% - 60% win rate)
    if (total >= 5 && playerWinRate >= 0.4 && playerWinRate <= 0.6) {
      return 'classic';
    }

    // Heated: multiple deciding-leg battles or 4+ encounters
    if (record.decidingLegMatches >= 2 || total >= 4) {
      return 'heated';
    }

    return 'developing';
  }

  /**
   * Updates head-to-head record for a player against an opponent
   */
  public static updateH2HRecord(
    ledger: Record<string, Record<string, HeadToHeadRecord>>,
    playerId: string,
    opponent: { id: string; name: string; tier: string },
    matchData: {
      playerLegsWon: number;
      opponentLegsWon: number;
      playerAverage: number;
      playerHighestCheckout: number;
      isWinner: boolean;
      isDecidingLeg: boolean;
    },
    week: number,
    year: number,
    tournamentName: string
  ): HeadToHeadRecord {
    if (!ledger[playerId]) {
      ledger[playerId] = {};
    }

    let record = ledger[playerId][opponent.id];
    if (!record) {
      record = {
        opponentId: opponent.id,
        opponentName: opponent.name,
        opponentTier: opponent.tier || 'amateur',
        matchesPlayed: 0,
        playerWins: 0,
        opponentWins: 0,
        legsWon: 0,
        legsLost: 0,
        highestCheckoutInH2H: 0,
        bestAverageInH2H: 0,
        decidingLegMatches: 0,
        lastEncounterWeek: week,
        lastEncounterYear: year,
        lastTournamentName: tournamentName,
        lastResult: matchData.isWinner ? 'won' : 'lost',
        status: 'friendly',
        recentResults: []
      };
      ledger[playerId][opponent.id] = record;
    }

    // Update cumulative counts
    record.matchesPlayed += 1;
    if (matchData.isWinner) {
      record.playerWins += 1;
    } else {
      record.opponentWins += 1;
    }

    record.legsWon += matchData.playerLegsWon;
    record.legsLost += matchData.opponentLegsWon;

    // Checkout (strictly capped at 170)
    const safeCo = (matchData.playerHighestCheckout > 0 && matchData.playerHighestCheckout <= 170)
      ? matchData.playerHighestCheckout
      : 0;
    if (safeCo > record.highestCheckoutInH2H) {
      record.highestCheckoutInH2H = safeCo;
    }

    // Best average
    if (matchData.playerAverage > record.bestAverageInH2H) {
      record.bestAverageInH2H = Math.round(matchData.playerAverage * 100) / 100;
    }

    if (matchData.isDecidingLeg) {
      record.decidingLegMatches += 1;
    }

    // Last encounter metadata
    record.lastEncounterWeek = week;
    record.lastEncounterYear = year;
    record.lastTournamentName = tournamentName;
    record.lastResult = matchData.isWinner ? 'won' : 'lost';

    // Recent form (last 5 results)
    record.recentResults.push(matchData.isWinner ? 'W' : 'L');
    if (record.recentResults.length > 5) {
      record.recentResults = record.recentResults.slice(-5);
    }

    // Recalculate status
    record.status = this.calculateRivalryStatus(record);

    return record;
  }
}
