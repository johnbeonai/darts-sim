import { DartResult } from '../match/DartResult';

export interface Checkout121Attempt {
  readonly target: number;
  readonly startingScore: number;
  readonly checkoutsCompleted: number;
  readonly dartsUsed: number;
  readonly successful: boolean;
  readonly dartHistory: DartResult[];
}

export class Checkout121Game {
  public static readonly STARTING_TARGET: number = 121;
  public static readonly MAX_DARTS_PER_TARGET: number = 9;

  private currentTarget: number = Checkout121Game.STARTING_TARGET;
  private currentRemainingScore: number = Checkout121Game.STARTING_TARGET;
  private visitStartingScore: number = Checkout121Game.STARTING_TARGET;

  private dartsThrownThisTarget: number = 0;
  private currentVisitDarts: DartResult[] = [];
  private completedAttempts: Checkout121Attempt[] = [];

  private totalCheckoutsCompleted: number = 0;
  private currentStreak: number = 0;
  private bestStreak: number = 0;
  private highestTargetAchieved: number = Checkout121Game.STARTING_TARGET;
  private isBustThisVisit: boolean = false;

  constructor(initialTarget: number = Checkout121Game.STARTING_TARGET) {
    this.currentTarget = initialTarget;
    this.currentRemainingScore = initialTarget;
    this.visitStartingScore = initialTarget;
  }

  public getCurrentTarget(): number {
    return this.currentTarget;
  }

  public getCurrentRemainingScore(): number {
    return this.currentRemainingScore;
  }

  public getDartsRemainingThisTarget(): number {
    return Math.max(0, Checkout121Game.MAX_DARTS_PER_TARGET - this.dartsThrownThisTarget);
  }

  public getDartsThrownThisTarget(): number {
    return this.dartsThrownThisTarget;
  }

  public getCurrentVisitDarts(): readonly DartResult[] {
    return this.currentVisitDarts;
  }

  public getTotalCheckouts(): number {
    return this.totalCheckoutsCompleted;
  }

  public getCurrentStreak(): number {
    return this.currentStreak;
  }

  public getBestStreak(): number {
    return this.bestStreak;
  }

  public getHighestTargetAchieved(): number {
    return this.highestTargetAchieved;
  }

  public getCompletedAttempts(): readonly Checkout121Attempt[] {
    return this.completedAttempts;
  }

  /**
   * Throw a dart in the 121 Checkout Challenge
   */
  public recordDart(segment: number, multiplier: 1 | 2 | 3 = 1): {
    dart: DartResult;
    status: 'continue' | 'checkout' | 'bust' | 'failed';
    newRemaining: number;
    newTarget: number;
  } {
    const dart = new DartResult('player', segment, multiplier, 'manual', true);
    this.dartsThrownThisTarget += 1;
    this.currentVisitDarts.push(dart);

    const dartScore = dart.score;
    const remainder = this.currentRemainingScore - dartScore;

    // Check Checkout (Score reaches 0 on a double / inner bull)
    const isFinishingDouble = dart.isDouble || (dart.segment === 25 && dart.multiplier === 2);

    if (remainder === 0 && isFinishingDouble) {
      // SUCCESSFUL CHECKOUT!
      this.totalCheckoutsCompleted += 1;
      this.currentStreak += 1;
      if (this.currentStreak > this.bestStreak) {
        this.bestStreak = this.currentStreak;
      }
      if (this.currentTarget > this.highestTargetAchieved) {
        this.highestTargetAchieved = this.currentTarget;
      }

      const prevTarget = this.currentTarget;
      const nextTarget = this.currentTarget + 1;

      this.completedAttempts.push({
        target: prevTarget,
        startingScore: prevTarget,
        checkoutsCompleted: this.totalCheckoutsCompleted,
        dartsUsed: this.dartsThrownThisTarget,
        successful: true,
        dartHistory: [...this.currentVisitDarts],
      });

      // Advance to next target and reset 9 darts
      this.currentTarget = nextTarget;
      this.currentRemainingScore = nextTarget;
      this.visitStartingScore = nextTarget;
      this.dartsThrownThisTarget = 0;
      this.currentVisitDarts = [];
      this.isBustThisVisit = false;

      return {
        dart,
        status: 'checkout',
        newRemaining: nextTarget,
        newTarget: nextTarget,
      };
    }

    // Check Bust: remainder < 0 OR remainder === 1 OR (remainder === 0 && !isFinishingDouble)
    if (remainder < 0 || remainder === 1 || (remainder === 0 && !isFinishingDouble)) {
      // Bust! Revert remaining score to visit start
      this.currentRemainingScore = this.visitStartingScore;
      this.isBustThisVisit = true;

      // In authentic 501 / 121 practice, bust concludes the 3-dart visit
      // Darts remaining in the visit are forfeited
      const dartsToAdvance = 3 - this.currentVisitDarts.length;
      this.dartsThrownThisTarget += dartsToAdvance;
      this.currentVisitDarts = [];

      // Check if 9-dart limit exceeded
      if (this.dartsThrownThisTarget >= Checkout121Game.MAX_DARTS_PER_TARGET) {
        // FAILED TARGET - Reset to 121!
        const prevTarget = this.currentTarget;
        this.completedAttempts.push({
          target: prevTarget,
          startingScore: prevTarget,
          checkoutsCompleted: this.totalCheckoutsCompleted,
          dartsUsed: Checkout121Game.MAX_DARTS_PER_TARGET,
          successful: false,
          dartHistory: [],
        });

        this.currentStreak = 0;
        this.currentTarget = Checkout121Game.STARTING_TARGET;
        this.currentRemainingScore = Checkout121Game.STARTING_TARGET;
        this.visitStartingScore = Checkout121Game.STARTING_TARGET;
        this.dartsThrownThisTarget = 0;
        this.currentVisitDarts = [];

        return {
          dart,
          status: 'failed',
          newRemaining: Checkout121Game.STARTING_TARGET,
          newTarget: Checkout121Game.STARTING_TARGET,
        };
      }

      this.visitStartingScore = this.currentRemainingScore;

      return {
        dart,
        status: 'bust',
        newRemaining: this.currentRemainingScore,
        newTarget: this.currentTarget,
      };
    }

    // Valid dart without finishing
    this.currentRemainingScore = remainder;

    // Visit ended normally after 3 darts?
    if (this.currentVisitDarts.length === 3) {
      this.currentVisitDarts = [];
      this.visitStartingScore = this.currentRemainingScore;
    }

    // Check if 9 darts run out
    if (this.dartsThrownThisTarget >= Checkout121Game.MAX_DARTS_PER_TARGET) {
      const prevTarget = this.currentTarget;
      this.completedAttempts.push({
        target: prevTarget,
        startingScore: prevTarget,
        checkoutsCompleted: this.totalCheckoutsCompleted,
        dartsUsed: Checkout121Game.MAX_DARTS_PER_TARGET,
        successful: false,
        dartHistory: [],
      });

      this.currentStreak = 0;
      this.currentTarget = Checkout121Game.STARTING_TARGET;
      this.currentRemainingScore = Checkout121Game.STARTING_TARGET;
      this.visitStartingScore = Checkout121Game.STARTING_TARGET;
      this.dartsThrownThisTarget = 0;
      this.currentVisitDarts = [];

      return {
        dart,
        status: 'failed',
        newRemaining: Checkout121Game.STARTING_TARGET,
        newTarget: Checkout121Game.STARTING_TARGET,
      };
    }

    return {
      dart,
      status: 'continue',
      newRemaining: this.currentRemainingScore,
      newTarget: this.currentTarget,
    };
  }

  /**
   * Helper suggestions for checkouts
   */
  public getSuggestedRoutes(): string[] {
    const rem = this.currentRemainingScore;
    if (rem > 170 || rem <= 1) return [];

    const routes: Record<number, string[]> = {
      121: ['T20 - T11 - D14', 'T20 - 25 - D18', 'T17 - T20 - D5'],
      122: ['T18 - T20 - D4', 'T18 - 18 - Bull', 'T20 - 22 - D20'],
      123: ['T19 - T16 - D9', 'T19 - 16 - Bull', 'T20 - T13 - D12'],
      124: ['T20 - T16 - D8', 'T20 - 14 - Bull', 'T20 - D16 - D16'],
      125: ['25 - T20 - D20', 'Bull - 25 - Bull', 'T20 - 15 - Bull'],
      126: ['T19 - 19 - Bull', 'T19 - T19 - D6'],
      127: ['T20 - T17 - D8', 'T20 - 17 - Bull'],
      128: ['T18 - T14 - D16', 'T18 - 24 - Bull'],
      129: ['T19 - T16 - D12', 'T19 - 22 - Bull'],
      130: ['T20 - T20 - D5', 'T20 - 20 - Bull'],
      40: ['D20'],
      36: ['D18'],
      32: ['D16'],
      24: ['D12'],
      16: ['D8'],
      8: ['D4'],
      4: ['D2'],
      2: ['D1'],
      50: ['Bull (50)'],
    };

    if (routes[rem]) {
      return routes[rem];
    }

    // Generic double finish
    if (rem <= 40 && rem % 2 === 0) {
      return [`D${rem / 2}`];
    }

    return ['Reduce to an even double!'];
  }

  public reset(): void {
    this.currentTarget = Checkout121Game.STARTING_TARGET;
    this.currentRemainingScore = Checkout121Game.STARTING_TARGET;
    this.visitStartingScore = Checkout121Game.STARTING_TARGET;
    this.dartsThrownThisTarget = 0;
    this.currentVisitDarts = [];
    this.completedAttempts = [];
    this.totalCheckoutsCompleted = 0;
    this.currentStreak = 0;
    this.bestStreak = 0;
    this.highestTargetAchieved = Checkout121Game.STARTING_TARGET;
  }
}
