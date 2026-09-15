import { Player } from '../player/Player';
import { Match, MatchFormat } from '../match/Match';
import { PerformancePipeline } from '../simulation/PerformancePipeline';
import { IRandomProvider, DefaultRandomProvider } from '../random/RandomProvider';

export type TournamentCategory = 'pub' | 'amateur' | 'challenge_tour' | 'pro_tour' | 'major' | 'q_school';

export interface TournamentRequirement {
  tourCardRequired?: boolean;
  maxRank?: number; // e.g. 32 for Top 32 cutoffs on PDC Order of Merit
  minTier?: 'pub' | 'amateur' | 'semi_pro' | 'pro' | 'elite';
  nonCardHoldersOnly?: boolean; // Q-School and Challenge Tour are for non-card holders
  requiresQSchoolFinal?: boolean; // Q-School Final Stage requires qualification from First Stage
  requiresQSchoolParticipation?: boolean; // Challenge Tour requires attending Q-School / PDPA associate status
  description?: string;
}

export interface TournamentConfig {
  id: string;
  name: string;
  location: string;
  locationId?: string; // References CITIES in Geography.ts
  tier: 'pub' | 'amateur' | 'semi_pro' | 'pro' | 'elite';
  category?: TournamentCategory;
  entryFee: number;
  prizePool: {
    winner: number;
    runnerUp: number;
    semiFinalist: number;
    quarterFinalist: number;
  };
  rankingPoints: {
    winner: number;
    runnerUp: number;
    semiFinalist: number;
    quarterFinalist: number;
  };
  format: MatchFormat;
  requirements?: TournamentRequirement;
  isMajor?: boolean;
  isQSchool?: boolean;
  tvBroadcastName?: string;
}

export interface BracketMatch {
  id: string;
  roundName: 'Quarter-Final' | 'Semi-Final' | 'Final';
  roundIndex: number;
  player1: Player;
  player2: Player;
  winner: Player | null;
  match: Match | null;
  isCompleted: boolean;
}

export class Tournament {
  public rounds: BracketMatch[][] = [];
  public currentRoundIndex: number = 0;
  public isCompleted: boolean = false;
  public isFinalized: boolean = false;
  public winner: Player | null = null;
  public runnerUp: Player | null = null;

  constructor(
    public readonly config: TournamentConfig,
    public readonly participants: Player[], // 4 or 8 players
    private rng: IRandomProvider = new DefaultRandomProvider()
  ) {
    if (participants.length !== 8 && participants.length !== 4) {
      throw new Error(`Tournament requires 4 or 8 participants. Received ${participants.length}.`);
    }
    this.generateBracket();
  }

  private generateBracket(): void {
    if (this.participants.length === 4) {
      const sfMatches: BracketMatch[] = [
        {
          id: `${this.config.id}-sf-1`,
          roundName: 'Semi-Final',
          roundIndex: 0,
          player1: this.participants[0],
          player2: this.participants[1],
          winner: null,
          match: null,
          isCompleted: false
        },
        {
          id: `${this.config.id}-sf-2`,
          roundName: 'Semi-Final',
          roundIndex: 0,
          player1: this.participants[2],
          player2: this.participants[3],
          winner: null,
          match: null,
          isCompleted: false
        }
      ];
      this.rounds.push(sfMatches);
      return;
    }

    const qfMatches: BracketMatch[] = [];
    for (let i = 0; i < 4; i++) {
      qfMatches.push({
        id: `${this.config.id}-qf-${i + 1}`,
        roundName: 'Quarter-Final',
        roundIndex: 0,
        player1: this.participants[i * 2],
        player2: this.participants[i * 2 + 1],
        winner: null,
        match: null,
        isCompleted: false
      });
    }
    this.rounds.push(qfMatches);
  }

  public getCurrentRoundMatches(): BracketMatch[] {
    return this.rounds[this.currentRoundIndex] || [];
  }

  /**
   * Finds the active match involving the human player in the current round
   */
  public getPlayerMatch(playerId: string): BracketMatch | null {
    const currentMatches = this.getCurrentRoundMatches();
    return currentMatches.find(m => m.player1.id === playerId || m.player2.id === playerId) || null;
  }

  /**
   * Simulates all AI vs AI matches in the current round (skipping any human player matches)
   */
  public simulateAIMatches(humanPlayerIds: string[] | string): void {
    const ids = Array.isArray(humanPlayerIds) ? humanPlayerIds : [humanPlayerIds];
    const pipeline = new PerformancePipeline(this.rng);
    const matches = this.getCurrentRoundMatches();

    for (const m of matches) {
      if (m.isCompleted) continue;
      // Skip if this match involves any human player
      if (ids.includes(m.player1.id) || ids.includes(m.player2.id)) continue;

      this.resolveMatchStatistically(m, pipeline);
    }
  }

  /**
   * Checks if a match is a head-to-head clash between two human players
   */
  public isHeadToHead(match: BracketMatch, humanPlayerIds: string[]): boolean {
    return humanPlayerIds.includes(match.player1.id) && humanPlayerIds.includes(match.player2.id);
  }

  /**
   * Gets all pending matches for given human players in the current round
   */
  public getPendingHumanMatches(humanPlayerIds: string[]): BracketMatch[] {
    const currentMatches = this.getCurrentRoundMatches();
    return currentMatches.filter(
      m => !m.isCompleted && (humanPlayerIds.includes(m.player1.id) || humanPlayerIds.includes(m.player2.id))
    );
  }

  /**
   * Resolves a match between two players statistically to completion
   */
  public resolveMatchStatistically(m: BracketMatch, pipeline: PerformancePipeline): Player {
    const match = new Match(m.id, [m.player1.id, m.player2.id], this.config.format);
    m.match = match;

    while (match.status !== 'finished') {
      const leg = match.currentLeg;
      const turnPid = leg.currentTurnPlayerId;
      const activePlayer = turnPid === m.player1.id ? m.player1 : m.player2;
      const opponentPlayer = turnPid === m.player1.id ? m.player2 : m.player1;

      const visit = pipeline.simulateVisit(
        activePlayer,
        {
          remainingScore: leg.getRemainingScore(activePlayer.id),
          opponentRemaining: leg.getRemainingScore(opponentPlayer.id)
        },
        leg.doubleOutRequired,
        leg.doubleInRequired,
        leg.hasDoubledIn.get(activePlayer.id) ?? !leg.doubleInRequired
      );

      const res = leg.addVisit(visit);
      if (res.legWon) {
        match.onLegCompleted(activePlayer.id);
      }
    }

    m.isCompleted = true;
    m.winner = match.winnerId === m.player1.id ? m.player1 : m.player2;
    return m.winner;
  }

  /**
   * Called when a human match completes
   */
  public completeHumanMatch(matchId: string, winnerId: string): void {
    const matches = this.getCurrentRoundMatches();
    const m = matches.find(item => item.id === matchId);
    if (!m) return;

    m.isCompleted = true;
    m.winner = winnerId === m.player1.id ? m.player1 : m.player2;
  }

  /**
   * Advances to next round if all matches in current round are completed
   */
  public advanceRound(): boolean {
    const currentMatches = this.getCurrentRoundMatches();
    if (currentMatches.some(m => !m.isCompleted)) {
      return false; // Still pending matches
    }

    if (this.participants.length === 4) {
      if (this.currentRoundIndex === 0) {
        // Advance SF winners to Final
        const winners = currentMatches.map(m => m.winner!);
        const finalMatch: BracketMatch[] = [
          {
            id: `${this.config.id}-final`,
            roundName: 'Final',
            roundIndex: 1,
            player1: winners[0],
            player2: winners[1],
            winner: null,
            match: null,
            isCompleted: false
          }
        ];
        this.rounds.push(finalMatch);
        this.currentRoundIndex = 1;
        return true;
      } else if (this.currentRoundIndex === 1) {
        // Final completed!
        const finalMatch = currentMatches[0];
        this.winner = finalMatch.winner;
        this.runnerUp = finalMatch.winner?.id === finalMatch.player1.id ? finalMatch.player2 : finalMatch.player1;
        this.isCompleted = true;
        return false;
      }
      return false;
    }

    if (this.currentRoundIndex === 0) {
      // Advance QF winners to Semi-Finals
      const winners = currentMatches.map(m => m.winner!);
      const sfMatches: BracketMatch[] = [
        {
          id: `${this.config.id}-sf-1`,
          roundName: 'Semi-Final',
          roundIndex: 1,
          player1: winners[0],
          player2: winners[1],
          winner: null,
          match: null,
          isCompleted: false
        },
        {
          id: `${this.config.id}-sf-2`,
          roundName: 'Semi-Final',
          roundIndex: 1,
          player1: winners[2],
          player2: winners[3],
          winner: null,
          match: null,
          isCompleted: false
        }
      ];
      this.rounds.push(sfMatches);
      this.currentRoundIndex = 1;
      return true;
    } else if (this.currentRoundIndex === 1) {
      // Advance SF winners to Final
      const winners = currentMatches.map(m => m.winner!);
      const finalMatch: BracketMatch[] = [
        {
          id: `${this.config.id}-final`,
          roundName: 'Final',
          roundIndex: 2,
          player1: winners[0],
          player2: winners[1],
          winner: null,
          match: null,
          isCompleted: false
        }
      ];
      this.rounds.push(finalMatch);
      this.currentRoundIndex = 2;
      return true;
    } else if (this.currentRoundIndex === 2) {
      // Final completed!
      const finalMatch = currentMatches[0];
      this.winner = finalMatch.winner;
      this.runnerUp = finalMatch.winner?.id === finalMatch.player1.id ? finalMatch.player2 : finalMatch.player1;
      this.isCompleted = true;
      return false;
    }

    return false;
  }

  /**
   * Simulates all remaining matches in the tournament to conclusion
   */
  public simulateRestOfTournament(): void {
    const pipeline = new PerformancePipeline(this.rng);
    while (!this.isCompleted) {
      const currentMatches = this.getCurrentRoundMatches();
      for (const m of currentMatches) {
        if (!m.isCompleted) {
          this.resolveMatchStatistically(m, pipeline);
        }
      }
      this.advanceRound();
    }
  }
}

