import { Leg } from './Leg';

export type MatchFormatType = 'legs' | 'sets';

export interface MatchFormat {
  readonly type: MatchFormatType;
  readonly bestOfLegs?: number; // e.g. 3, 5, 7
  readonly bestOfSets?: number; // e.g. 3, 5
  readonly legsPerSet?: number; // e.g. 3 (first to 3 legs wins set)
  readonly startingScore?: number; // default 501
  readonly doubleOutRequired?: boolean; // default true
  readonly doubleInRequired?: boolean; // default false
  readonly winByTwoClearLegs?: boolean; // Matchplay format: must win by 2 clear legs
  readonly maxTieBreakLegs?: number; // max extra legs beyond standard target before sudden death (e.g. 6)
}

export class Match {
  public readonly legs: Leg[] = [];
  public currentLeg: Leg;
  public readonly legsWon: Map<string, number> = new Map();
  public readonly setsWon: Map<string, number> = new Map();
  public winnerId: string | null = null;
  public status: 'in_progress' | 'finished' = 'in_progress';

  private starterIndex: number = 0;

  constructor(
    public readonly id: string,
    public readonly playerIds: [string, string],
    public readonly format: MatchFormat = { type: 'legs', bestOfLegs: 5, startingScore: 501, doubleOutRequired: true }
  ) {
    for (const pid of playerIds) {
      this.legsWon.set(pid, 0);
      this.setsWon.set(pid, 0);
    }

    this.currentLeg = this.createNewLeg();
  }

  private createNewLeg(): Leg {
    const starterId = this.playerIds[this.starterIndex % 2];
    this.starterIndex++;

    const leg = new Leg(
      `${this.id}-leg-${this.legs.length + 1}`,
      this.playerIds,
      starterId,
      this.format.startingScore ?? 501,
      this.format.doubleOutRequired ?? true,
      this.format.doubleInRequired ?? false
    );
    this.legs.push(leg);
    return leg;
  }

  public isTieBreakActive(): boolean {
    if (!this.format.winByTwoClearLegs || this.format.type !== 'legs') return false;
    const legsNeeded = Math.ceil((this.format.bestOfLegs ?? 5) / 2);
    const p0Wins = this.legsWon.get(this.playerIds[0]) || 0;
    const p1Wins = this.legsWon.get(this.playerIds[1]) || 0;
    return (p0Wins >= legsNeeded - 1 && p1Wins >= legsNeeded - 1);
  }

  public getRequiredLegsToWin(): { [playerId: string]: number } {
    const legsNeeded = Math.ceil((this.format.bestOfLegs ?? 5) / 2);
    if (!this.format.winByTwoClearLegs || this.format.type !== 'legs') {
      return {
        [this.playerIds[0]]: legsNeeded,
        [this.playerIds[1]]: legsNeeded
      };
    }
    const maxExtra = this.format.maxTieBreakLegs ?? 6;
    const suddenDeathTarget = legsNeeded + Math.floor(maxExtra / 2);
    const p0Wins = this.legsWon.get(this.playerIds[0]) || 0;
    const p1Wins = this.legsWon.get(this.playerIds[1]) || 0;

    return {
      [this.playerIds[0]]: Math.min(suddenDeathTarget, Math.max(legsNeeded, p1Wins + 2)),
      [this.playerIds[1]]: Math.min(suddenDeathTarget, Math.max(legsNeeded, p0Wins + 2))
    };
  }

  public onLegCompleted(legWinnerId: string): { matchWon: boolean; matchWinnerId: string | null; isNineDarter: boolean; legWinnerId: string } {
    const legStats = this.currentLeg.getPlayerStats(legWinnerId);
    const isNineDarter = legStats.dartsThrown === 9 && (this.currentLeg.startingScore === 501);

    if (this.status === 'finished') {
      return { matchWon: true, matchWinnerId: this.winnerId, isNineDarter, legWinnerId };
    }

    const currentWins = (this.legsWon.get(legWinnerId) || 0) + 1;
    this.legsWon.set(legWinnerId, currentWins);

    if (this.format.type === 'legs') {
      const legsNeeded = Math.ceil((this.format.bestOfLegs ?? 5) / 2);

      if (this.format.winByTwoClearLegs) {
        const otherId = this.playerIds.find(id => id !== legWinnerId)!;
        const otherWins = this.legsWon.get(otherId) || 0;
        const maxExtra = this.format.maxTieBreakLegs ?? 6;
        const suddenDeathTarget = legsNeeded + Math.floor(maxExtra / 2); // e.g. 10 + 3 = 13

        // Win by 2 clear legs (once target is reached), or sudden death decider target
        if ((currentWins >= legsNeeded && currentWins - otherWins >= 2) || currentWins >= suddenDeathTarget) {
          this.status = 'finished';
          this.winnerId = legWinnerId;
          return { matchWon: true, matchWinnerId: legWinnerId, isNineDarter, legWinnerId };
        }
      } else {
        if (currentWins >= legsNeeded) {
          this.status = 'finished';
          this.winnerId = legWinnerId;
          return { matchWon: true, matchWinnerId: legWinnerId, isNineDarter, legWinnerId };
        }
      }
    } else {
      // Sets format
      const legsPerSet = this.format.legsPerSet ?? 3;
      if (currentWins >= legsPerSet) {
        const setWins = (this.setsWon.get(legWinnerId) || 0) + 1;
        this.setsWon.set(legWinnerId, setWins);

        // Reset legs for next set
        for (const pid of this.playerIds) {
          this.legsWon.set(pid, 0);
        }

        const setsNeeded = Math.ceil((this.format.bestOfSets ?? 3) / 2);
        if (setWins >= setsNeeded) {
          this.status = 'finished';
          this.winnerId = legWinnerId;
          return { matchWon: true, matchWinnerId: legWinnerId, isNineDarter, legWinnerId };
        }
      }
    }

    // Advance to next leg
    this.currentLeg = this.createNewLeg();
    return { matchWon: false, matchWinnerId: null, isNineDarter, legWinnerId };
  }

  public getOverallStats(playerId: string) {
    let totalDarts = 0;
    let totalScored = 0;
    let s100 = 0;
    let s140 = 0;
    let s180 = 0;
    let highestVisit = 0;
    let highestCheckout = 0;
    let totalDoublesAttempted = 0;
    let totalDoublesHit = 0;

    for (const leg of this.legs) {
      const stats = leg.getPlayerStats(playerId);
      totalDarts += stats.dartsThrown;
      totalScored += stats.totalScored;
      s100 += stats.scores100Plus;
      s140 += stats.scores140Plus;
      s180 += stats.scores180;
      if (stats.highestVisit > highestVisit) highestVisit = stats.highestVisit;
      if (stats.highestCheckout > highestCheckout && stats.highestCheckout <= 170) {
        highestCheckout = stats.highestCheckout;
      }
      totalDoublesAttempted += leg.doublesAttempted.get(playerId) || 0;
      totalDoublesHit += leg.doublesHit.get(playerId) || 0;
    }

    const average = totalDarts > 0 ? (totalScored / totalDarts) * 3 : 0;
    const checkoutPercentage = totalDoublesAttempted > 0
      ? Math.round((totalDoublesHit / totalDoublesAttempted) * 1000) / 10
      : 0;

    return {
      playerId,
      legsWon: this.legsWon.get(playerId) || 0,
      setsWon: this.setsWon.get(playerId) || 0,
      dartsThrown: totalDarts,
      totalScored,
      average: Math.round(average * 100) / 100,
      highestVisit,
      highestCheckout,
      doublesHit: totalDoublesHit,
      doublesAttempted: totalDoublesAttempted,
      checkoutPercentage,
      scores100Plus: s100,
      scores140Plus: s140,
      scores180: s180
    };
  }
}
