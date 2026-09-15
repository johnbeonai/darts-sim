import { Player, CareerTier } from '../player/Player';
import { RollingPrizeMoneyLedger } from './RollingPrizeMoneyLedger';

export interface RankingEntry {
  playerId: string;
  playerName: string;
  nationality: string;
  tier: CareerTier;
  currentRank: number;
  previousRank: number;
  rankChange: number; // positive = moved up, negative = dropped, 0 = unchanged
  prizeMoney: number; // Rolling 2-year prize money (PDC standard)
  rollingPrizeMoney: number;
  defendingPrizeMoney: number;
  rankingPoints: number;
  form: number;
  confidence: number;
  archetype?: string;
  isHuman: boolean;
}

export interface SerializedRankingData {
  entries: {
    playerId: string;
    currentRank: number;
    previousRank: number;
    rankChange: number;
    rollingPrizeMoney?: number;
    defendingPrizeMoney?: number;
  }[];
  rollingLedger?: Record<string, any>;
}

export class RankingManager {
  private entries: Map<string, RankingEntry> = new Map();
  public rollingLedger: RollingPrizeMoneyLedger = new RollingPrizeMoneyLedger();

  constructor(allPlayers: Player[] = []) {
    if (allPlayers.length > 0) {
      this.initialize(allPlayers);
    }
  }

  /**
   * Initializes or refreshes all registered players in the ranking system
   */
  public initialize(allPlayers: Player[], currentYear: number = 2026, currentWeek: number = 1): void {
    const previousRanks = new Map<string, number>();
    for (const [id, entry] of this.entries.entries()) {
      previousRanks.set(id, entry.currentRank);
    }

    this.entries.clear();
    for (const p of allPlayers) {
      const prev = previousRanks.get(p.id) ?? 0;
      this.entries.set(p.id, {
        playerId: p.id,
        playerName: p.name,
        nationality: p.nationality,
        tier: p.tier,
        currentRank: prev || 0,
        previousRank: prev || 0,
        rankChange: 0,
        prizeMoney: p.prizeMoneyTotal,
        rollingPrizeMoney: p.prizeMoneyTotal,
        defendingPrizeMoney: 0,
        rankingPoints: p.rankingPoints,
        form: p.state.form,
        confidence: p.state.confidence,
        isHuman: false
      });
    }

    this.recalculateRankings(allPlayers, currentYear, currentWeek);
  }

  /**
   * Recalculates official Order of Merit based on rolling 2-year prize money (primary) and ranking points (secondary)
   */
  public recalculateRankings(players: Player[], currentYear: number = 2026, currentWeek: number = 1): void {
    // Sync current values from player objects and rolling ledger
    for (const p of players) {
      let entry = this.entries.get(p.id);
      if (!entry) {
        entry = {
          playerId: p.id,
          playerName: p.name,
          nationality: p.nationality,
          tier: p.tier,
          currentRank: 0,
          previousRank: 0,
          rankChange: 0,
          prizeMoney: p.prizeMoneyTotal,
          rollingPrizeMoney: p.prizeMoneyTotal,
          defendingPrizeMoney: 0,
          rankingPoints: p.rankingPoints,
          form: p.state.form,
          confidence: p.state.confidence,
          isHuman: false
        };
        this.entries.set(p.id, entry);
      }

      // Query rolling ledger
      let rolling = this.rollingLedger.getRollingPrizeMoney(p.id, currentYear, currentWeek);
      const totalRecorded = this.rollingLedger.getTotalRecordedPrizeMoney(p.id);

      // Baseline seeding if player has total prize money but no rolling entries yet
      if (totalRecorded === 0 && p.prizeMoneyTotal > 0) {
        this.rollingLedger.seedBaselineEarnings(p.id, p.prizeMoneyTotal, currentYear, currentWeek);
        rolling = this.rollingLedger.getRollingPrizeMoney(p.id, currentYear, currentWeek);
      } else if (p.prizeMoneyTotal > totalRecorded) {
        // Record newly earned prize money delta into rolling ledger
        const delta = p.prizeMoneyTotal - totalRecorded;
        this.rollingLedger.addPrize(
          p.id,
          `sync-${currentYear}-w${currentWeek}`,
          'PDC Circuit Winnings',
          currentYear,
          currentWeek,
          delta,
          true
        );
        rolling = this.rollingLedger.getRollingPrizeMoney(p.id, currentYear, currentWeek);
      }
      const defending = this.rollingLedger.getDefendingPrizeMoney(p.id, currentYear, currentWeek, 12);

      entry.playerName = p.name;
      entry.nationality = p.nationality;
      entry.tier = p.tier;
      entry.rollingPrizeMoney = rolling;
      entry.defendingPrizeMoney = defending;
      entry.prizeMoney = rolling; // Official PDC Order of Merit uses 2-year rolling prize money
      entry.rankingPoints = p.rankingPoints;
      entry.form = p.state.form;
      entry.confidence = p.state.confidence;
    }

    // Sort order:
    // 1. Rolling 2-Year Prize Money (PDC Order of Merit standard)
    // 2. Total Ranking Points
    // 3. Name (deterministic tiebreaker)
    const sortedList = Array.from(this.entries.values()).sort((a, b) => {
      if (b.prizeMoney !== a.prizeMoney) {
        return b.prizeMoney - a.prizeMoney;
      }
      if (b.rankingPoints !== a.rankingPoints) {
        return b.rankingPoints - a.rankingPoints;
      }
      return a.playerName.localeCompare(b.playerName);
    });

    // Assign new ranks and calculate movements
    sortedList.forEach((entry, idx) => {
      const newRank = idx + 1;
      const oldRank = entry.currentRank || newRank;
      entry.previousRank = oldRank;
      entry.currentRank = newRank;
      // In rankings, moving from rank 10 to rank 5 is +5 improvement (up)
      entry.rankChange = oldRank - newRank;

      // Sync back to player object
      const playerObj = players.find(p => p.id === entry.playerId);
      if (playerObj) {
        playerObj.ranking = newRank;
      }
    });
  }

  /**
   * Top 16 players (Automatic Televised Major Qualification)
   */
  public getTop16(): RankingEntry[] {
    return this.getRankings({ limit: 16 });
  }

  /**
   * Top 32 players (Seeded Tournament Status)
   */
  public getTop32(): RankingEntry[] {
    return this.getRankings({ limit: 32 });
  }

  /**
   * Top 64 players (Tour Card Retention Line)
   */
  public getTop64(): RankingEntry[] {
    return this.getRankings({ limit: 64 });
  }

  /**
   * Relegation Zone (Ranks 65–128 facing Q-School return)
   */
  public getRelegationZone(): RankingEntry[] {
    const list = this.getRankings();
    return list.slice(64, 128);
  }

  /**
   * Returns financial boundaries at the key ranking cutoffs
   */
  public getCutoffBoundaries(): {
    top16CutoffMoney: number;
    top32CutoffMoney: number;
    top64CutoffMoney: number;
  } {
    const list = this.getRankings();
    return {
      top16CutoffMoney: list[15]?.prizeMoney ?? 0,
      top32CutoffMoney: list[31]?.prizeMoney ?? 0,
      top64CutoffMoney: list[63]?.prizeMoney ?? 0,
    };
  }

  /**
   * Returns a player's current ranking entry
   */
  public getPlayerRank(playerId: string): RankingEntry | undefined {
    return this.entries.get(playerId);
  }

  /**
   * Queries ranking list with optional filtering and limits
   */
  public getRankings(filter?: {
    tier?: CareerTier;
    limit?: number;
    search?: string;
  }): RankingEntry[] {
    let list = Array.from(this.entries.values()).sort((a, b) => a.currentRank - b.currentRank);

    if (filter?.tier) {
      list = list.filter(e => e.tier === filter.tier);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(e =>
        e.playerName.toLowerCase().includes(q) ||
        e.nationality.toLowerCase().includes(q)
      );
    }

    if (filter?.limit && filter.limit > 0) {
      list = list.slice(0, filter.limit);
    }

    return list;
  }

  /**
   * Marks specific players as human for UI highlighting
   */
  public markHumanPlayers(humanPlayerIds: string[]): void {
    for (const [id, entry] of this.entries.entries()) {
      entry.isHuman = humanPlayerIds.includes(id);
    }
  }

  /**
   * Total number of ranked players in the system
   */
  public get totalRankedPlayers(): number {
    return this.entries.size;
  }

  public serialize(): SerializedRankingData {
    const list: SerializedRankingData['entries'] = [];
    for (const entry of this.entries.values()) {
      list.push({
        playerId: entry.playerId,
        currentRank: entry.currentRank,
        previousRank: entry.previousRank,
        rankChange: entry.rankChange,
        rollingPrizeMoney: entry.rollingPrizeMoney,
        defendingPrizeMoney: entry.defendingPrizeMoney
      });
    }
    return {
      entries: list,
      rollingLedger: this.rollingLedger.serialize()
    };
  }

  public deserialize(data: SerializedRankingData, players: Player[], currentYear: number = 2026, currentWeek: number = 1): void {
    if (data?.rollingLedger) {
      this.rollingLedger.deserialize(data.rollingLedger);
    }
    this.initialize(players, currentYear, currentWeek);
    if (!data?.entries) return;

    for (const item of data.entries) {
      const entry = this.entries.get(item.playerId);
      if (entry) {
        entry.currentRank = item.currentRank;
        entry.previousRank = item.previousRank;
        entry.rankChange = item.rankChange;
        if (item.rollingPrizeMoney !== undefined) entry.rollingPrizeMoney = item.rollingPrizeMoney;
        if (item.defendingPrizeMoney !== undefined) entry.defendingPrizeMoney = item.defendingPrizeMoney;
      }
    }
  }
}
