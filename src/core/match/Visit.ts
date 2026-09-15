import { DartResult } from './DartResult';
import { CheckoutTable } from './CheckoutTable';

/**
 * Visit Model & Bust Evaluation
 * In accordance with Technical Blueprint Section 18 & 19.
 * Handles official 501 bust rules and double-out detection.
 */

export type BustReason = 'exceeded' | 'left_one' | 'no_double';

export interface IVisit {
  readonly playerId: string;
  readonly darts: DartResult[];
  readonly scoreBefore: number;
  readonly scoreAfter: number;
  readonly visitScore: number;
  readonly isBust: boolean;
  readonly bustReason?: BustReason;
  readonly isLegWinning: boolean;
  readonly isCompleted: boolean;
  readonly checkoutAttempt: boolean;
}

export class Visit implements IVisit {
  public readonly darts: DartResult[] = [];
  public scoreBefore: number;
  public scoreAfter: number;
  public visitScore: number = 0;
  public isBust: boolean = false;
  public bustReason?: BustReason;
  public isLegWinning: boolean = false;
  public isCompleted: boolean = false;
  public checkoutAttempt: boolean = false;
  public hasDoubledIn: boolean;

  constructor(
    public readonly playerId: string,
    scoreBefore: number,
    initialDarts: DartResult[] = [],
    public readonly doubleOutRequired: boolean = true,
    public readonly doubleInRequired: boolean = false,
    hasDoubledIn?: boolean
  ) {
    this.scoreBefore = scoreBefore;
    this.scoreAfter = scoreBefore;
    this.hasDoubledIn = hasDoubledIn !== undefined ? hasDoubledIn : !doubleInRequired;

    for (const dart of initialDarts) {
      this.addDart(dart);
      if (this.isCompleted) break;
    }
  }

  /**
   * Evaluates and adds a dart sequentially to the visit.
   * Returns true if dart was processed, false if visit was already finished/busted.
   */
  public addDart(dart: DartResult): boolean {
    if (this.isCompleted) {
      return false;
    }

    this.darts.push(dart);

    // Double-In Requirement Check (e.g. World Grand Prix)
    if (this.doubleInRequired && !this.hasDoubledIn) {
      if (dart.isDouble) {
        this.hasDoubledIn = true;
        this.scoreAfter = this.scoreBefore - dart.score;
        this.visitScore += dart.score;
      }

      if (this.darts.length === 3) {
        this.isCompleted = true;
      }
      return true;
    }

    const currentRemaining = this.scoreAfter;
    const newRemaining = currentRemaining - dart.score;

    // Check if player had a double checkout opportunity
    if (currentRemaining <= 50 && (currentRemaining % 2 === 0 || currentRemaining === 50)) {
      if (dart.isDouble) {
        this.checkoutAttempt = true;
      }
    }

    // Rule 1: Exceeded remaining score (leaves < 0)
    if (newRemaining < 0) {
      this.isBust = true;
      this.bustReason = 'exceeded';
      this.scoreAfter = this.scoreBefore;
      this.visitScore = 0;
      this.isCompleted = true;
      return true;
    }

    // Rule 2: Left 1 with double-out required (cannot finish 1 on a double)
    if (this.doubleOutRequired && newRemaining === 1) {
      this.isBust = true;
      this.bustReason = 'left_one';
      this.scoreAfter = this.scoreBefore;
      this.visitScore = 0;
      this.isCompleted = true;
      return true;
    }

    // Rule 3: Reached 0 (Leg completion check)
    if (newRemaining === 0) {
      if (this.doubleOutRequired) {
        if (dart.isDouble) {
          // Valid checkout!
          this.isLegWinning = true;
          this.scoreAfter = 0;
          this.visitScore = this.scoreBefore;
          this.checkoutAttempt = true;
          this.isCompleted = true;
          return true;
        } else {
          // Hit 0 on a single or treble -> BUST
          this.isBust = true;
          this.bustReason = 'no_double';
          this.scoreAfter = this.scoreBefore;
          this.visitScore = 0;
          this.isCompleted = true;
          return true;
        }
      } else {
        // Single-out format allows any segment
        this.isLegWinning = true;
        this.scoreAfter = 0;
        this.visitScore = this.scoreBefore;
        this.isCompleted = true;
        return true;
      }
    }

    // Normal valid dart
    this.scoreAfter = newRemaining;
    this.visitScore += dart.score;

    if (this.darts.length >= 3) {
      this.isCompleted = true;
    }

    return true;
  }

  /**
   * Helper to construct a visit from total score if entered as a single number (Manual mode)
   */
  public static fromTotal(
    playerId: string,
    scoreBefore: number,
    total: number,
    dartCount: number = 3,
    doubleOutRequired: boolean = true,
    doubleInRequired: boolean = false,
    hasDoubledIn: boolean = true
  ): Visit {
    if (total < 0 || total > 180) {
      throw new Error(`Invalid visit total: ${total}. Max possible is 180.`);
    }

    const isInitiallyDoubledIn = hasDoubledIn || !doubleInRequired;
    const visit = new Visit(
      playerId,
      scoreBefore,
      [],
      doubleOutRequired,
      doubleInRequired,
      isInitiallyDoubledIn
    );

    if (doubleInRequired && !isInitiallyDoubledIn) {
      if (total === 0) {
        visit.hasDoubledIn = false;
        visit.scoreAfter = scoreBefore;
        visit.visitScore = 0;
        visit.isCompleted = true;
        return visit;
      } else {
        visit.hasDoubledIn = true;
      }
    }

    const newScore = scoreBefore - total;

    if (newScore < 0) {
      visit.isBust = true;
      visit.bustReason = 'exceeded';
      visit.scoreAfter = scoreBefore;
      visit.visitScore = 0;
      visit.isCompleted = true;
      return visit;
    }

    if (newScore === 1) {
      visit.isBust = true;
      visit.bustReason = 'left_one';
      visit.scoreAfter = scoreBefore;
      visit.visitScore = 0;
      visit.isCompleted = true;
      return visit;
    }

    if (newScore === 0) {
      // Must be a legitimate double out (cannot finish from > 170 or on bogey numbers)
      if (doubleOutRequired && !CheckoutTable.isCheckoutPossible(scoreBefore)) {
        visit.isBust = true;
        visit.bustReason = 'no_double';
        visit.scoreAfter = scoreBefore;
        visit.visitScore = 0;
        visit.isCompleted = true;
        return visit;
      }

      visit.isLegWinning = true;
      visit.scoreAfter = 0;
      visit.visitScore = total;
      visit.checkoutAttempt = true;
      visit.isCompleted = true;
      return visit;
    }

    visit.scoreAfter = newScore;
    visit.visitScore = total;
    visit.isCompleted = true;
    return visit;
  }
}
