import { DartResult } from './DartResult';
import { Visit } from './Visit';

/**
 * Leg Model
 * Coordinates visits, scoring, player turns, and winner determination.
 */

export interface LegStatistics {
  readonly playerId: string;
  readonly dartsThrown: number;
  readonly totalScored: number;
  readonly average: number; // 3-dart average
  readonly highestVisit: number;
  readonly highestCheckout: number;
  readonly checkoutPercentage: number; // doubles hit / doubles attempted
  readonly scores100Plus: number;
  readonly scores140Plus: number;
  readonly scores180: number;
}

export class Leg {
  public readonly visits: Visit[] = [];
  public readonly scoresRemaining: Map<string, number> = new Map();
  public readonly dartsThrown: Map<string, number> = new Map();
  public readonly totalScored: Map<string, number> = new Map();
  public readonly doublesAttempted: Map<string, number> = new Map();
  public readonly doublesHit: Map<string, number> = new Map();
  public readonly hasDoubledIn: Map<string, boolean> = new Map();

  public currentTurnPlayerId: string;
  public winnerId: string | null = null;
  public status: 'in_progress' | 'finished' = 'in_progress';
  public currentVisitInProgress: Visit | null = null;

  constructor(
    public readonly id: string,
    public readonly playerIds: [string, string],
    public readonly starterPlayerId: string,
    public readonly startingScore: number = 501,
    public readonly doubleOutRequired: boolean = true,
    public readonly doubleInRequired: boolean = false
  ) {
    if (!playerIds.includes(starterPlayerId)) {
      throw new Error(`Starter player ${starterPlayerId} must be one of [${playerIds.join(', ')}]`);
    }

    this.currentTurnPlayerId = starterPlayerId;
    for (const pid of playerIds) {
      this.scoresRemaining.set(pid, startingScore);
      this.dartsThrown.set(pid, 0);
      this.totalScored.set(pid, 0);
      this.doublesAttempted.set(pid, 0);
      this.doublesHit.set(pid, 0);
      this.hasDoubledIn.set(pid, !doubleInRequired);
    }
  }

  public getRemainingScore(playerId: string): number {
    return this.scoresRemaining.get(playerId) ?? this.startingScore;
  }

  /**
   * Applies an entire completed visit (e.g. from statistical engine or quick manual total)
   */
  public addVisit(visit: Visit): { legWon: boolean; isBust: boolean } {
    if (this.status === 'finished') {
      throw new Error('Cannot add visit to an already finished leg.');
    }

    if (visit.playerId !== this.currentTurnPlayerId) {
      throw new Error(`Not player ${visit.playerId}'s turn. Current turn is ${this.currentTurnPlayerId}.`);
    }

    this.visits.push(visit);

    // Update statistics
    const thrown = this.dartsThrown.get(visit.playerId) || 0;
    this.dartsThrown.set(visit.playerId, thrown + (visit.darts.length || 3));

    const scored = this.totalScored.get(visit.playerId) || 0;
    this.totalScored.set(visit.playerId, scored + visit.visitScore);

    this.scoresRemaining.set(visit.playerId, visit.scoreAfter);

    if (visit.hasDoubledIn) {
      this.hasDoubledIn.set(visit.playerId, true);
    }

    if (visit.checkoutAttempt) {
      const attempts = this.doublesAttempted.get(visit.playerId) || 0;
      this.doublesAttempted.set(visit.playerId, attempts + 1);
    }

    if (visit.isLegWinning) {
      this.winnerId = visit.playerId;
      this.status = 'finished';
      const hits = this.doublesHit.get(visit.playerId) || 0;
      this.doublesHit.set(visit.playerId, hits + 1);
      return { legWon: true, isBust: false };
    }

    // Switch turn to the other player
    this.switchTurn();
    return { legWon: false, isBust: visit.isBust };
  }

  /**
   * Applies a single dart sequentially (supports live dart-by-dart entry mode)
   */
  public applyDart(dart: DartResult): {
    visit: Visit;
    legWon: boolean;
    isBust: boolean;
    turnEnded: boolean;
  } {
    if (this.status === 'finished') {
      throw new Error('Cannot throw dart in finished leg.');
    }

    if (dart.playerId !== this.currentTurnPlayerId) {
      throw new Error(`Not player ${dart.playerId}'s turn.`);
    }

    if (!this.currentVisitInProgress) {
      const scoreBefore = this.getRemainingScore(dart.playerId);
      const isDoubledIn = this.hasDoubledIn.get(dart.playerId) ?? !this.doubleInRequired;
      this.currentVisitInProgress = new Visit(
        dart.playerId,
        scoreBefore,
        [],
        this.doubleOutRequired,
        this.doubleInRequired,
        isDoubledIn
      );
    }

    this.currentVisitInProgress.addDart(dart);
    const visit = this.currentVisitInProgress;

    if (visit.isCompleted) {
      // Finalize completed visit into leg history
      if (visit.hasDoubledIn) {
        this.hasDoubledIn.set(dart.playerId, true);
      }
      this.currentVisitInProgress = null;
      const res = this.addVisit(visit);
      return {
        visit,
        legWon: res.legWon,
        isBust: res.isBust,
        turnEnded: true
      };
    }

    return {
      visit,
      legWon: false,
      isBust: false,
      turnEnded: false
    };
  }

  private switchTurn(): void {
    const nextPlayer = this.playerIds.find(id => id !== this.currentTurnPlayerId);
    if (nextPlayer) {
      this.currentTurnPlayerId = nextPlayer;
    }
  }

  public getPlayerStats(playerId: string): LegStatistics {
    const darts = this.dartsThrown.get(playerId) || 0;
    const scored = this.totalScored.get(playerId) || 0;
    const average = darts > 0 ? (scored / darts) * 3 : 0;

    const playerVisits = this.visits.filter(v => v.playerId === playerId);
    let highestVisit = 0;
    let highestCheckout = 0;
    let s100 = 0;
    let s140 = 0;
    let s180 = 0;

    for (const v of playerVisits) {
      if (!v.isBust) {
        if (v.visitScore > highestVisit) highestVisit = v.visitScore;
        if (v.visitScore === 180) s180++;
        else if (v.visitScore >= 140) s140++;
        else if (v.visitScore >= 100) s100++;

        // Legitimate checkouts strictly require leg-winning visit and score <= 170
        if (v.isLegWinning && v.scoreBefore <= 170) {
          if (v.scoreBefore > highestCheckout) {
            highestCheckout = v.scoreBefore;
          }
        }
      }
    }

    const attempts = this.doublesAttempted.get(playerId) || 0;
    const hits = this.doublesHit.get(playerId) || 0;
    const checkoutPercentage = attempts > 0 ? (hits / attempts) * 100 : 0;

    return {
      playerId,
      dartsThrown: darts,
      totalScored: scored,
      average: Math.round(average * 100) / 100,
      highestVisit,
      highestCheckout,
      checkoutPercentage: Math.round(checkoutPercentage * 10) / 10,
      scores100Plus: s100,
      scores140Plus: s140,
      scores180: s180
    };
  }
}
