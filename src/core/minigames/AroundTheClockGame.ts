import { DartResult } from '../match/DartResult';

export type ATCMode = 'standard' | 'doubles_only';

export interface ATCDartRecord {
  readonly dart: DartResult;
  readonly targetNumber: number;
  readonly wasHit: boolean;
  readonly advancedSteps: number;
}

export interface ATCSummary {
  readonly mode: ATCMode;
  readonly isCompleted: boolean;
  readonly dartsThrown: number;
  readonly hits: number;
  readonly misses: number;
  readonly hitRatePercent: number;
  readonly currentTarget: number;
  readonly currentTargetLabel: string;
  readonly progressPercent: number;
  readonly visitsCount: number;
}

export class AroundTheClockGame {
  // Target sequence: 1..20, followed by Outer Bull (25) and Bullseye (50)
  public static readonly STANDARD_SEQUENCE: number[] = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 50,
  ];

  // Doubles Only sequence: D1..D20 followed by Bullseye (50)
  public static readonly DOUBLES_SEQUENCE: number[] = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 50,
  ];

  public readonly mode: ATCMode;
  public readonly allowMultipliersBonus: boolean;
  private readonly targetSequence: number[];

  private currentTargetIndex: number = 0;
  private history: ATCDartRecord[] = [];
  private currentVisitDarts: DartResult[] = [];
  private isCompleted: boolean = false;

  constructor(mode: ATCMode = 'standard', allowMultipliersBonus: boolean = true) {
    this.mode = mode;
    this.allowMultipliersBonus = allowMultipliersBonus;
    this.targetSequence =
      mode === 'doubles_only'
        ? [...AroundTheClockGame.DOUBLES_SEQUENCE]
        : [...AroundTheClockGame.STANDARD_SEQUENCE];
  }

  public getTargetSequence(): number[] {
    return [...this.targetSequence];
  }

  public getCurrentTargetIndex(): number {
    return this.currentTargetIndex;
  }

  public getCurrentTarget(): number {
    if (this.isCompleted) return 0;
    return this.targetSequence[this.currentTargetIndex];
  }

  public getCurrentTargetLabel(): string {
    if (this.isCompleted) return 'FINISHED!';
    const t = this.getCurrentTarget();
    if (this.mode === 'doubles_only') {
      return t === 50 ? 'D-BULL' : `D${t}`;
    }
    if (t === 25) return 'BULL';
    if (t === 50) return 'D-BULL';
    return `${t}`;
  }

  public getIsCompleted(): boolean {
    return this.isCompleted;
  }

  public getHistory(): readonly ATCDartRecord[] {
    return this.history;
  }

  public getCurrentVisitDarts(): readonly DartResult[] {
    return this.currentVisitDarts;
  }

  public getDartsThrown(): number {
    return this.history.length;
  }

  public getHitsCount(): number {
    return this.history.filter(h => h.wasHit).length;
  }

  public getMissesCount(): number {
    return this.history.filter(h => !h.wasHit).length;
  }

  public getHitRate(): number {
    if (this.history.length === 0) return 0;
    return Math.round((this.getHitsCount() / this.history.length) * 1000) / 10;
  }

  public getProgressPercent(): number {
    if (this.isCompleted) return 100;
    return Math.round((this.currentTargetIndex / this.targetSequence.length) * 100);
  }

  /**
   * Throw a dart at the board
   */
  public recordDart(segment: number, multiplier: 1 | 2 | 3 = 1): ATCDartRecord {
    if (this.isCompleted) {
      throw new Error('Game is already completed.');
    }

    const dart = new DartResult('player', segment, multiplier, 'manual', true);
    const target = this.getCurrentTarget();

    let wasHit = false;
    let steps = 0;

    if (this.mode === 'doubles_only') {
      if (target === 50) {
        wasHit = segment === 25 && multiplier === 2;
      } else {
        wasHit = segment === target && multiplier === 2;
      }
      if (wasHit) {
        steps = 1;
      }
    } else {
      if (target === 25) {
        wasHit = segment === 25;
        if (wasHit) {
          steps = this.allowMultipliersBonus && multiplier === 2 ? 2 : 1;
        }
      } else if (target === 50) {
        wasHit = segment === 25 && multiplier === 2;
        if (wasHit) {
          steps = 1;
        }
      } else {
        wasHit = segment === target;
        if (wasHit) {
          if (this.allowMultipliersBonus) {
            steps = multiplier;
          } else {
            steps = 1;
          }
        }
      }
    }

    const record: ATCDartRecord = {
      dart,
      targetNumber: target,
      wasHit,
      advancedSteps: steps,
    };

    this.history.push(record);
    this.currentVisitDarts.push(dart);
    if (this.currentVisitDarts.length === 3) {
      this.currentVisitDarts = [];
    }

    if (wasHit) {
      this.currentTargetIndex += steps;
      if (this.currentTargetIndex >= this.targetSequence.length) {
        this.currentTargetIndex = this.targetSequence.length;
        this.isCompleted = true;
      }
    }

    return record;
  }

  public undoLastDart(): boolean {
    if (this.history.length === 0) return false;

    const last = this.history.pop()!;
    if (last.wasHit) {
      this.currentTargetIndex = Math.max(0, this.currentTargetIndex - last.advancedSteps);
      this.isCompleted = false;
    }

    const visitRemainder = this.history.length % 3;
    if (visitRemainder === 0) {
      this.currentVisitDarts = [];
    } else {
      this.currentVisitDarts = this.history.slice(-visitRemainder).map(h => h.dart);
    }

    return true;
  }

  public reset(): void {
    this.currentTargetIndex = 0;
    this.history = [];
    this.currentVisitDarts = [];
    this.isCompleted = false;
  }

  public getSummary(): ATCSummary {
    return {
      mode: this.mode,
      isCompleted: this.isCompleted,
      dartsThrown: this.getDartsThrown(),
      hits: this.getHitsCount(),
      misses: this.getMissesCount(),
      hitRatePercent: this.getHitRate(),
      currentTarget: this.getCurrentTarget(),
      currentTargetLabel: this.getCurrentTargetLabel(),
      progressPercent: this.getProgressPercent(),
      visitsCount: Math.ceil(this.history.length / 3),
    };
  }
}
