import { DartResult } from '../match/DartResult';

export type CricketMode = 'solo' | 'vs_cpu' | 'two_player';

export interface CricketPlayerState {
  readonly name: string;
  readonly marks: Record<number, number>; // key: target number (15..20, 25 for bull) -> mark count (0..3+)
  readonly score: number;
  readonly dartsThrown: number;
}

export interface CricketDartRecord {
  readonly playerIndex: number;
  readonly dart: DartResult;
  readonly marksAdded: number;
  readonly pointsAdded: number;
  readonly targetNumber: number;
}

export class CricketGame {
  public static readonly TARGETS: number[] = [20, 19, 18, 17, 16, 15, 25];

  public readonly mode: CricketMode;
  public readonly playerNames: [string, string];

  private playerMarks: [Record<number, number>, Record<number, number>];
  private playerScores: [number, number] = [0, 0];
  private dartsThrown: [number, number] = [0, 0];
  private activePlayerIndex: 0 | 1 = 0;
  private currentVisitDarts: DartResult[] = [];
  private history: CricketDartRecord[] = [];
  private isCompleted: boolean = false;
  private winnerIndex: 0 | 1 | null = null;

  constructor(
    mode: CricketMode = 'solo',
    player1Name: string = 'Player 1',
    player2Name: string = 'CPU'
  ) {
    this.mode = mode;
    this.playerNames = [player1Name, player2Name];

    this.playerMarks = [
      { 20: 0, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 },
      { 20: 0, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 },
    ];
  }

  public getActivePlayerIndex(): 0 | 1 {
    return this.activePlayerIndex;
  }

  public getPlayerMarks(pIdx: 0 | 1): Record<number, number> {
    return { ...this.playerMarks[pIdx] };
  }

  public getPlayerScores(): [number, number] {
    return [...this.playerScores];
  }

  public getDartsThrown(): [number, number] {
    return [...this.dartsThrown];
  }

  public getCurrentVisitDarts(): readonly DartResult[] {
    return this.currentVisitDarts;
  }

  public getIsCompleted(): boolean {
    return this.isCompleted;
  }

  public getWinnerIndex(): 0 | 1 | null {
    return this.winnerIndex;
  }

  public getHistory(): readonly CricketDartRecord[] {
    return this.history;
  }

  public isTargetClosed(pIdx: 0 | 1, target: number): boolean {
    return (this.playerMarks[pIdx][target] || 0) >= 3;
  }

  public isTargetDead(target: number): boolean {
    if (this.mode === 'solo') {
      return this.isTargetClosed(0, target);
    }
    return this.isTargetClosed(0, target) && this.isTargetClosed(1, target);
  }

  public allTargetsClosed(pIdx: 0 | 1): boolean {
    return CricketGame.TARGETS.every(t => (this.playerMarks[pIdx][t] || 0) >= 3);
  }

  /**
   * Throw a dart in Cricket
   */
  public recordDart(segment: number, multiplier: 1 | 2 | 3 = 1): CricketDartRecord {
    if (this.isCompleted) {
      throw new Error('Game is already complete.');
    }

    const pIdx = this.activePlayerIndex;
    const oppIdx: 0 | 1 = pIdx === 0 ? 1 : 0;
    const dart = new DartResult(this.playerNames[pIdx], segment, multiplier, 'manual', true);

    const isCricketTarget = CricketGame.TARGETS.includes(segment);
    let marksToAdd = 0;
    let pointsToAdd = 0;

    if (isCricketTarget) {
      if (segment === 25) {
        // Bull: mult 1 = 1 mark, mult 2 = 2 marks
        marksToAdd = multiplier;
      } else {
        marksToAdd = multiplier;
      }

      const currentMarks = this.playerMarks[pIdx][segment] || 0;
      const opponentMarks = this.playerMarks[oppIdx][segment] || 0;
      const oppClosed = this.mode !== 'solo' && opponentMarks >= 3;

      const marksNeededToClose = Math.max(0, 3 - currentMarks);
      const marksApplyingToClose = Math.min(marksToAdd, marksNeededToClose);
      const excessMarks = marksToAdd - marksApplyingToClose;

      // Update marks
      this.playerMarks[pIdx][segment] = currentMarks + marksToAdd;

      // Score points for excess marks IF opponent has NOT closed the number
      if (excessMarks > 0 && !oppClosed) {
        pointsToAdd = excessMarks * segment;
        this.playerScores[pIdx] += pointsToAdd;
      }
    }

    this.dartsThrown[pIdx] += 1;

    const record: CricketDartRecord = {
      playerIndex: pIdx,
      dart,
      marksAdded: marksToAdd,
      pointsAdded: pointsToAdd,
      targetNumber: isCricketTarget ? segment : 0,
    };

    this.history.push(record);
    this.currentVisitDarts.push(dart);

    // Check Win Condition
    if (this.mode === 'solo') {
      if (this.allTargetsClosed(0)) {
        this.isCompleted = true;
        this.winnerIndex = 0;
      }
    } else {
      if (this.allTargetsClosed(pIdx) && this.playerScores[pIdx] >= this.playerScores[oppIdx]) {
        this.isCompleted = true;
        this.winnerIndex = pIdx;
      }
    }

    // Turn alternation after 3 darts if game not complete
    if (!this.isCompleted && this.currentVisitDarts.length === 3) {
      this.currentVisitDarts = [];
      if (this.mode !== 'solo') {
        this.activePlayerIndex = oppIdx;
      }
    }

    return record;
  }

  /**
   * Undo the last dart thrown
   */
  public undoLastDart(): boolean {
    if (this.history.length === 0) return false;

    const last = this.history.pop()!;
    const pIdx = last.playerIndex as 0 | 1;

    if (last.targetNumber > 0) {
      this.playerMarks[pIdx][last.targetNumber] = Math.max(
        0,
        this.playerMarks[pIdx][last.targetNumber] - last.marksAdded
      );
      this.playerScores[pIdx] = Math.max(0, this.playerScores[pIdx] - last.pointsAdded);
    }

    this.dartsThrown[pIdx] = Math.max(0, this.dartsThrown[pIdx] - 1);
    this.isCompleted = false;
    this.winnerIndex = null;

    // Reset visit & active player to state of that dart
    this.activePlayerIndex = pIdx;

    const activeHistory = this.history.filter(h => h.playerIndex === pIdx);
    const visitRemainder = activeHistory.length % 3;
    if (visitRemainder === 0) {
      this.currentVisitDarts = [];
    } else {
      this.currentVisitDarts = activeHistory.slice(-visitRemainder).map(h => h.dart);
    }

    return true;
  }

  /**
   * AI move logic for CPU in vs_cpu mode
   */
  public generateCpuDart(cpuAccuracy: number = 70): { segment: number; multiplier: 1 | 2 | 3 } {
    const oppMarks = this.playerMarks[0];
    const cpuMarks = this.playerMarks[1];
    const oppScore = this.playerScores[0];
    const cpuScore = this.playerScores[1];

    // Priority 1: If CPU is behind in score, target highest open scoring target
    let preferredTarget: number | null = null;

    if (cpuScore < oppScore) {
      // Find open numbers CPU has closed that opponent has not
      for (const t of CricketGame.TARGETS) {
        if ((cpuMarks[t] || 0) >= 3 && (oppMarks[t] || 0) < 3) {
          preferredTarget = t;
          break;
        }
      }
    }

    // Priority 2: Close unclosed target with highest value
    if (preferredTarget === null) {
      for (const t of CricketGame.TARGETS) {
        if ((cpuMarks[t] || 0) < 3) {
          preferredTarget = t;
          break;
        }
      }
    }

    // Priority 3: Fallback to Bull
    if (preferredTarget === null) {
      preferredTarget = 25;
    }

    // Determine hit chance based on cpuAccuracy (0..100)
    const roll = Math.random() * 100;
    if (roll > cpuAccuracy) {
      // Missed dart (either neighboring number or complete miss)
      const missRoll = Math.random();
      if (missRoll < 0.4) {
        return { segment: 0, multiplier: 1 };
      } else {
        // hit single 1 or 5
        return { segment: 1, multiplier: 1 };
      }
    }

    // Dart hits target
    if (preferredTarget === 25) {
      const bullRoll = Math.random();
      return { segment: 25, multiplier: bullRoll > 0.65 ? 2 : 1 };
    }

    const multRoll = Math.random();
    if (multRoll < 0.5) {
      return { segment: preferredTarget, multiplier: 3 }; // Treble
    } else if (multRoll < 0.75) {
      return { segment: preferredTarget, multiplier: 1 }; // Single
    } else {
      return { segment: preferredTarget, multiplier: 2 }; // Double
    }
  }

  public reset(): void {
    this.playerMarks = [
      { 20: 0, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 },
      { 20: 0, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 },
    ];
    this.playerScores = [0, 0];
    this.dartsThrown = [0, 0];
    this.activePlayerIndex = 0;
    this.currentVisitDarts = [];
    this.history = [];
    this.isCompleted = false;
    this.winnerIndex = null;
  }
}
