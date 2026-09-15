/**
 * Rolling Prize Money Ledger
 * Tracks dated tournament prize earnings over a 2-year (104-week) rolling window,
 * matching official PDC Order of Merit rules where players defend prize money won 24 months prior.
 */

export interface PrizeMoneyEntry {
  id: string;
  playerId: string;
  tournamentId: string;
  tournamentName: string;
  year: number;
  week: number;
  prizeMoney: number;
  isMajor: boolean;
}

export class RollingPrizeMoneyLedger {
  private entriesByPlayer: Map<string, PrizeMoneyEntry[]> = new Map();

  /**
   * Records prize money won at a specific tournament event
   */
  public addPrize(
    playerId: string,
    tournamentId: string,
    tournamentName: string,
    year: number,
    week: number,
    prizeMoney: number,
    isMajor: boolean = false
  ): PrizeMoneyEntry {
    const entry: PrizeMoneyEntry = {
      id: `${playerId}-${tournamentId}-${year}-w${week}`,
      playerId,
      tournamentId,
      tournamentName,
      year,
      week,
      prizeMoney,
      isMajor
    };

    const playerEntries = this.entriesByPlayer.get(playerId) || [];
    // Avoid exact duplicate additions
    const existingIdx = playerEntries.findIndex(e => e.id === entry.id);
    if (existingIdx >= 0) {
      playerEntries[existingIdx] = entry;
    } else {
      playerEntries.push(entry);
    }

    this.entriesByPlayer.set(playerId, playerEntries);
    return entry;
  }

  /**
   * Returns lifetime total prize money logged in the ledger for a player
   */
  public getTotalRecordedPrizeMoney(playerId: string): number {
    const entries = this.entriesByPlayer.get(playerId);
    if (!entries || entries.length === 0) return 0;
    return entries.reduce((total, entry) => total + entry.prizeMoney, 0);
  }

  /**
   * Calculates rolling prize money earned by a player over the last 104 weeks (2 seasons)
   */
  public getRollingPrizeMoney(
    playerId: string,
    currentYear: number,
    currentWeek: number,
    windowWeeks: number = 104
  ): number {
    const entries = this.entriesByPlayer.get(playerId);
    if (!entries || entries.length === 0) return 0;

    const currentAbsWeek = currentYear * 52 + currentWeek;

    return entries.reduce((total, entry) => {
      const entryAbsWeek = entry.year * 52 + entry.week;
      const ageInWeeks = currentAbsWeek - entryAbsWeek;

      // Must be in the past/present and within the rolling 104-week window
      if (ageInWeeks >= 0 && ageInWeeks < windowWeeks) {
        return total + entry.prizeMoney;
      }
      return total;
    }, 0);
  }

  /**
   * Calculates prize money won ~2 years ago that will expire / must be defended in the upcoming N weeks
   */
  public getDefendingPrizeMoney(
    playerId: string,
    currentYear: number,
    currentWeek: number,
    upcomingWeeks: number = 12
  ): number {
    const entries = this.entriesByPlayer.get(playerId);
    if (!entries || entries.length === 0) return 0;

    const currentAbsWeek = currentYear * 52 + currentWeek;

    return entries.reduce((total, entry) => {
      const entryAbsWeek = entry.year * 52 + entry.week;
      // When does this prize money drop off? At entryAbsWeek + 104
      const dropOffAbsWeek = entryAbsWeek + 104;
      const weeksUntilDropOff = dropOffAbsWeek - currentAbsWeek;

      if (weeksUntilDropOff >= 0 && weeksUntilDropOff <= upcomingWeeks) {
        return total + entry.prizeMoney;
      }
      return total;
    }, 0);
  }

  /**
   * Returns all active prize entries within the rolling 2-year window for a player
   */
  public getActiveEntriesForPlayer(
    playerId: string,
    currentYear: number,
    currentWeek: number
  ): PrizeMoneyEntry[] {
    const entries = this.entriesByPlayer.get(playerId);
    if (!entries) return [];

    const currentAbsWeek = currentYear * 52 + currentWeek;
    return entries.filter(entry => {
      const entryAbsWeek = entry.year * 52 + entry.week;
      const ageInWeeks = currentAbsWeek - entryAbsWeek;
      return ageInWeeks >= 0 && ageInWeeks < 104;
    }).sort((a, b) => (b.year * 52 + b.week) - (a.year * 52 + a.week));
  }

  /**
   * Initializes baseline rolling prize money for players when starting a new career
   */
  public seedBaselineEarnings(
    playerId: string,
    totalBaseMoney: number,
    currentYear: number,
    currentWeek: number
  ): void {
    if (totalBaseMoney <= 0) return;

    // Distribute baseline earnings across the past 2 years (past 8 quarters)
    const quarters = 8;
    const amountPerQuarter = Math.round(totalBaseMoney / quarters);

    for (let q = 1; q <= quarters; q++) {
      const weeksAgo = q * 12;
      let targetYear = currentYear;
      let targetWeek = currentWeek - weeksAgo;

      while (targetWeek <= 0) {
        targetWeek += 52;
        targetYear -= 1;
      }

      this.addPrize(
        playerId,
        `seed-quarter-${q}`,
        `PDC Tour Historical Event (Q${q})`,
        targetYear,
        targetWeek,
        amountPerQuarter,
        q % 2 === 0
      );
    }
  }

  /**
   * Serialization
   */
  public serialize(): Record<string, PrizeMoneyEntry[]> {
    const result: Record<string, PrizeMoneyEntry[]> = {};
    for (const [playerId, list] of this.entriesByPlayer.entries()) {
      result[playerId] = list;
    }
    return result;
  }

  /**
   * Deserialization
   */
  public deserialize(data: Record<string, PrizeMoneyEntry[]> | undefined): void {
    this.entriesByPlayer.clear();
    if (!data) return;

    for (const [playerId, list] of Object.entries(data)) {
      if (Array.isArray(list)) {
        this.entriesByPlayer.set(playerId, list);
      }
    }
  }
}
