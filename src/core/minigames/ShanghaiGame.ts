import { DartResult } from '../match/DartResult';

export type ShanghaiMode = 'solo' | 'vs_cpu' | 'two_player';

export interface ShanghaiDartRecord {
  readonly playerIndex: number;
  readonly round: number;
  readonly dart: DartResult;
  readonly pointsScored: number;
  readonly isShanghaiHit: boolean;
}

export interface ShanghaiRoundSummary {
  readonly round: number;
  readonly p1Darts: DartResult[];
  readonly p1RoundScore: number;
  readonly p1CumulativeTotal: number;
  readonly p2Darts: DartResult[];
  readonly p2RoundScore: number;
  readonly p2CumulativeTotal: number;
  readonly shanghaiHitBy?: 0 | 1 | null;
}

export class ShanghaiGame {
  public readonly mode: ShanghaiMode;
  public readonly maxRounds: number; // 7 or 20
  public readonly playerNames: [string, string];

  private currentRound: number = 1;
  private activePlayerIndex: 0 | 1 = 0;
  private playerScores: [number, number] = [0, 0];
  private currentVisitDarts: DartResult[] = [];
  private history: ShanghaiDartRecord[] = [];
  private isCompleted: boolean = false;
  private winnerIndex: 0 | 1 | null = null;
  private shanghaiAchievedBy: 0 | 1 | null = null;

  constructor(
    maxRounds: number = 7,
    mode: ShanghaiMode = 'solo',
    player1Name: string = 'Player 1',
    player2Name: string = 'CPU',
    startingPlayerIndex: 0 | 1 = 0
  ) {
    this.maxRounds = maxRounds;
    this.mode = mode;
    this.playerNames = [player1Name, player2Name];
    this.activePlayerIndex = startingPlayerIndex;
  }

  public getCurrentRound(): number {
    return this.currentRound;
  }

  public getActivePlayerIndex(): 0 | 1 {
    return this.activePlayerIndex;
  }

  public setStartingPlayer(index: 0 | 1): void {
    if (this.history.length === 0) {
      this.activePlayerIndex = index;
    }
  }

  public performCoinToss(): 0 | 1 {
    const winner = (Math.random() < 0.5 ? 0 : 1) as 0 | 1;
    this.setStartingPlayer(winner);
    return winner;
  }

  public getPlayerScores(): [number, number] {
    return [...this.playerScores];
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

  public getShanghaiAchievedBy(): 0 | 1 | null {
    return this.shanghaiAchievedBy;
  }

  public getHistory(): readonly ShanghaiDartRecord[] {
    return this.history;
  }

  /**
   * Generates a complete round-by-round scorecard summary across all rounds up to maxRounds.
   */
  public getRoundSummaries(): ShanghaiRoundSummary[] {
    const summaries: ShanghaiRoundSummary[] = [];
    let p1Running = 0;
    let p2Running = 0;

    for (let r = 1; r <= this.maxRounds; r++) {
      const p1Records = this.history.filter(h => h.round === r && h.playerIndex === 0);
      const p2Records = this.history.filter(h => h.round === r && h.playerIndex === 1);

      const p1RoundScore = p1Records.reduce((sum, h) => sum + h.pointsScored, 0);
      const p2RoundScore = p2Records.reduce((sum, h) => sum + h.pointsScored, 0);

      p1Running += p1RoundScore;
      p2Running += p2RoundScore;

      const shanghaiRecord = this.history.find(h => h.round === r && h.isShanghaiHit);

      summaries.push({
        round: r,
        p1Darts: p1Records.map(h => h.dart),
        p1RoundScore,
        p1CumulativeTotal: p1Running,
        p2Darts: p2Records.map(h => h.dart),
        p2RoundScore,
        p2CumulativeTotal: p2Running,
        shanghaiHitBy: shanghaiRecord ? (shanghaiRecord.playerIndex as 0 | 1) : null,
      });
    }

    return summaries;
  }

  /**
   * Throw a dart in Shanghai.
   * Round 1 targets 1, Round 2 targets 2, up to Round 20.
   * Only darts hitting current round segment score points:
   * - Singles: 1x segment
   * - Doubles: 2x segment
   * - Trebles: 3x segment
   * Any other segment: 0 points.
   * Hitting Single, Double, and Treble of active target in a single 3-dart visit awards an instant Shanghai win!
   */
  public recordDart(segment: number, multiplier: 1 | 2 | 3 = 1): ShanghaiDartRecord {
    if (this.isCompleted) {
      throw new Error('Game is already complete.');
    }

    const pIdx = this.activePlayerIndex;
    const round = this.currentRound;
    const dart = new DartResult(this.playerNames[pIdx], segment, multiplier, 'manual', true);

    // Only darts hitting current round segment score points!
    const isTargetHit = segment === round;
    let points = 0;

    if (isTargetHit) {
      points = round * multiplier;
      this.playerScores[pIdx] += points;
    }

    this.currentVisitDarts.push(dart);

    // Check Shanghai Instant Win Condition:
    // If visit has 3 darts on round target AND includes a Single, Double, and Treble (any order)!
    let shanghaiHit = false;
    if (this.currentVisitDarts.length === 3) {
      const allOnTarget = this.currentVisitDarts.every(d => d.segment === round);
      if (allOnTarget) {
        const multipliers = this.currentVisitDarts.map(d => d.multiplier).sort();
        if (multipliers[0] === 1 && multipliers[1] === 2 && multipliers[2] === 3) {
          shanghaiHit = true;
          this.shanghaiAchievedBy = pIdx;
          this.winnerIndex = pIdx;
          this.isCompleted = true;
        }
      }
    }

    const record: ShanghaiDartRecord = {
      playerIndex: pIdx,
      round,
      dart,
      pointsScored: points,
      isShanghaiHit: shanghaiHit,
    };

    this.history.push(record);

    // Turn alternation or Round Progression
    if (!this.isCompleted && this.currentVisitDarts.length === 3) {
      this.currentVisitDarts = [];

      if (this.mode === 'solo') {
        if (this.currentRound >= this.maxRounds) {
          this.isCompleted = true;
          this.winnerIndex = 0;
        } else {
          this.currentRound += 1;
        }
      } else {
        // Multi-player (vs_cpu or two_player)
        if (this.activePlayerIndex === 0) {
          this.activePlayerIndex = 1;
        } else {
          // Both finished round
          this.activePlayerIndex = 0;
          if (this.currentRound >= this.maxRounds) {
            this.isCompleted = true;
            if (this.playerScores[0] > this.playerScores[1]) {
              this.winnerIndex = 0;
            } else if (this.playerScores[1] > this.playerScores[0]) {
              this.winnerIndex = 1;
            } else {
              this.winnerIndex = null; // Draw
            }
          } else {
            this.currentRound += 1;
          }
        }
      }
    }

    return record;
  }

  public undoLastDart(): boolean {
    if (this.history.length === 0) return false;

    const last = this.history.pop()!;
    const pIdx = last.playerIndex as 0 | 1;

    this.playerScores[pIdx] = Math.max(0, this.playerScores[pIdx] - last.pointsScored);
    this.isCompleted = false;
    this.winnerIndex = null;
    this.shanghaiAchievedBy = null;
    this.currentRound = last.round;
    this.activePlayerIndex = pIdx;

    const activeHistory = this.history.filter(h => h.playerIndex === pIdx && h.round === last.round);
    this.currentVisitDarts = activeHistory.map(h => h.dart);

    return true;
  }

  /**
   * Tactical AI dart for CPU opponent:
   * Aims for Singles for safe points, or pivots to Double/Treble if first dart hits for Shanghai attempt!
   */
  public generateCpuDart(cpuAccuracy: number = 70): { segment: number; multiplier: 1 | 2 | 3 } {
    const target = this.currentRound;
    const roll = Math.random() * 100;
    if (roll > cpuAccuracy) {
      return Math.random() < 0.5 ? { segment: 0, multiplier: 1 } : { segment: (target % 20) + 1, multiplier: 1 };
    }

    // Check tactical Shanghai opportunity in current visit
    const currentMults = this.currentVisitDarts.map(d => d.multiplier);
    if (!currentMults.includes(3)) {
      return { segment: target, multiplier: 3 };
    } else if (!currentMults.includes(2)) {
      return { segment: target, multiplier: 2 };
    } else {
      return { segment: target, multiplier: 1 };
    }
  }

  public reset(): void {
    this.currentRound = 1;
    this.activePlayerIndex = 0;
    this.playerScores = [0, 0];
    this.currentVisitDarts = [];
    this.history = [];
    this.isCompleted = false;
    this.winnerIndex = null;
    this.shanghaiAchievedBy = null;
  }
}
