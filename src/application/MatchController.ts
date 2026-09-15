import { Match, MatchFormat } from '../core/match/Match';
import { Player } from '../core/player/Player';
import { IInputProvider, MatchContext } from '../input/InputProvider';
import { Visit } from '../core/match/Visit';
import { DartResult } from '../core/match/DartResult';
import { AudioManager } from '../core/audio/AudioManager';
import { SettingsManager } from '../core/config/SettingsManager';

export type TurnStatus = 'awaiting_player_input' | 'cpu_thinking' | 'leg_completed' | 'match_completed';

export interface MatchStateEvent {
  currentTurnPlayerId: string;
  isPlayerTurn: boolean;
  scoreRemaining: number;
  opponentRemaining: number;
  legsWon: Record<string, number>;
  setsWon: Record<string, number>;
  lastVisit?: Visit;
  status: TurnStatus;
  winnerId: string | null;
  message?: string;
  doubleInRequired?: boolean;
  hasDoubledIn?: Record<string, boolean>;
  isTieBreakActive?: boolean;
  isNineDarter?: boolean;
  nineDarterPlayerName?: string;
}

export class MatchController {
  public match: Match;
  public status: TurnStatus = 'awaiting_player_input';
  public lastVisit?: Visit;
  private listeners: ((event: MatchStateEvent) => void)[] = [];

  constructor(
    public readonly player: Player,
    public readonly opponent: Player,
    public readonly playerProvider: IInputProvider,
    public readonly opponentProvider: IInputProvider,
    format: MatchFormat = { type: 'legs', bestOfLegs: 5, startingScore: 501, doubleOutRequired: true },
    public cpuDelayMs?: number
  ) {
    this.match = new Match(`match-${Date.now()}`, [player.id, opponent.id], format);
  }

  public subscribe(listener: (event: MatchStateEvent) => void): () => void {
    this.listeners.push(listener);
    this.notify();
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(message?: string, isNineDarter: boolean = false, nineDarterPlayerName?: string): void {
    const currentLeg = this.match.currentLeg;
    const isPlayerTurn = currentLeg.currentTurnPlayerId === this.player.id;

    const event: MatchStateEvent = {
      currentTurnPlayerId: currentLeg.currentTurnPlayerId,
      isPlayerTurn,
      scoreRemaining: currentLeg.getRemainingScore(this.player.id),
      opponentRemaining: currentLeg.getRemainingScore(this.opponent.id),
      legsWon: {
        [this.player.id]: this.match.legsWon.get(this.player.id) || 0,
        [this.opponent.id]: this.match.legsWon.get(this.opponent.id) || 0,
      },
      setsWon: {
        [this.player.id]: this.match.setsWon.get(this.player.id) || 0,
        [this.opponent.id]: this.match.setsWon.get(this.opponent.id) || 0,
      },
      lastVisit: this.lastVisit,
      status: this.status,
      winnerId: this.match.winnerId,
      message,
      doubleInRequired: currentLeg.doubleInRequired,
      hasDoubledIn: {
        [this.player.id]: currentLeg.hasDoubledIn.get(this.player.id) ?? !currentLeg.doubleInRequired,
        [this.opponent.id]: currentLeg.hasDoubledIn.get(this.opponent.id) ?? !currentLeg.doubleInRequired
      },
      isTieBreakActive: this.match.isTieBreakActive(),
      isNineDarter,
      nineDarterPlayerName
    };

    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public async startMatch(): Promise<void> {
    AudioManager.playGameOn();
    await this.executeNextTurn();
  }

  public async processPlayerVisit(visit: Visit): Promise<void> {
    if (this.match.status === 'finished') return;

    this.lastVisit = visit;
    const leg = this.match.currentLeg;
    const turnPlayerId = leg.currentTurnPlayerId;

    const res = leg.addVisit(visit);

    if (res.legWon) {
      await this.handleLegFinished(turnPlayerId);
      return;
    }

    // Referee Audio Announcements for Visit Outcome
    if (visit.isBust) {
      AudioManager.playBust();
    } else if (visit.visitScore === 180) {
      AudioManager.play180();
    } else {
      AudioManager.speakScore(visit.visitScore);
    }

    this.notify(visit.isBust ? 'Bust!' : `${visit.visitScore}!`);
    await this.executeNextTurn();
  }

  public async processPlayerDart(dart: DartResult): Promise<{ turnEnded: boolean; legWon: boolean }> {
    if (this.match.status === 'finished') return { turnEnded: true, legWon: false };

    AudioManager.playDartThud();
    const leg = this.match.currentLeg;
    const turnPlayerId = leg.currentTurnPlayerId;
    const res = leg.applyDart(dart);
    this.lastVisit = res.visit;

    if (res.legWon) {
      await this.handleLegFinished(turnPlayerId);
      return { turnEnded: true, legWon: true };
    }

    if (res.turnEnded) {
      if (res.visit.isBust) {
        AudioManager.playBust();
      } else if (res.visit.visitScore === 180) {
        AudioManager.play180();
      } else {
        AudioManager.speakScore(res.visit.visitScore);
      }
      this.notify(res.isBust ? 'Bust!' : `${res.visit.visitScore}!`);
      await this.executeNextTurn();
      return { turnEnded: true, legWon: false };
    }

    this.notify();
    return { turnEnded: false, legWon: false };
  }

  private async executeNextTurn(): Promise<void> {
    if (this.match.status === 'finished') {
      this.status = 'match_completed';
      this.notify('Match finished!');
      return;
    }

    const currentLeg = this.match.currentLeg;
    const turnPlayerId = currentLeg.currentTurnPlayerId;
    const remaining = currentLeg.getRemainingScore(turnPlayerId);

    // Audio Announcement: when score is in checkout territory (<= 170), announce required score
    if (remaining <= 170 && remaining > 1) {
      AudioManager.playRequires(remaining, turnPlayerId === this.player.id ? undefined : this.opponent.name);
    }

    if (turnPlayerId === this.player.id) {
      this.status = 'awaiting_player_input';
      this.notify('Your turn');
    } else {
      this.status = 'cpu_thinking';
      this.notify(`${this.opponent.name} is throwing...`);

      const delay = this.cpuDelayMs ?? SettingsManager.getCpuDelayMs();
      if (delay > 0) {
        await new Promise(r => setTimeout(r, delay));
      }

      const context: MatchContext = {
        playerId: this.opponent.id,
        remainingScore: currentLeg.getRemainingScore(this.opponent.id),
        opponentRemaining: currentLeg.getRemainingScore(this.player.id),
        dartNumberInVisit: 1,
        situation: {
          remainingScore: currentLeg.getRemainingScore(this.opponent.id),
          opponentRemaining: currentLeg.getRemainingScore(this.player.id),
          isDecidingLeg: false
        },
        doubleInRequired: currentLeg.doubleInRequired,
        doubleOutRequired: currentLeg.doubleOutRequired,
        hasDoubledIn: currentLeg.hasDoubledIn.get(this.opponent.id) ?? !currentLeg.doubleInRequired
      };

      const cpuVisit = await this.opponentProvider.getNextVisit(context);
      this.lastVisit = cpuVisit;

      const res = currentLeg.addVisit(cpuVisit);
      if (res.legWon) {
        await this.handleLegFinished(this.opponent.id);
      } else {
        if (cpuVisit.isBust) {
          AudioManager.playBust();
        } else if (cpuVisit.visitScore === 180) {
          AudioManager.play180();
        } else {
          AudioManager.speakScore(cpuVisit.visitScore);
        }
        this.notify(cpuVisit.isBust ? `${this.opponent.name} Bust!` : `${this.opponent.name} scored ${cpuVisit.visitScore}`);
        await this.executeNextTurn();
      }
    }
  }

  private async handleLegFinished(winnerId: string): Promise<void> {
    const winnerName = winnerId === this.player.id ? this.player.name : this.opponent.name;
    const winningPlayer = winnerId === this.player.id ? this.player : this.opponent;
    const matchRes = this.match.onLegCompleted(winnerId);

    if (matchRes.isNineDarter) {
      winningPlayer.stats.nineDarters = (winningPlayer.stats.nineDarters || 0) + 1;
      AudioManager.playNineDartCelebration(winnerName);
    }

    if (matchRes.matchWon) {
      this.status = 'match_completed';
      AudioManager.playMatchWon(winnerName);
      this.notify(`${winnerName} wins!`, matchRes.isNineDarter, winnerName);
    } else {
      if (!matchRes.isNineDarter) {
        AudioManager.playGameShot(winnerName);
      }
      this.status = 'leg_completed';
      this.notify(`Game shot, ${winnerName}!`, matchRes.isNineDarter, winnerName);
      setTimeout(async () => {
        await this.executeNextTurn();
      }, matchRes.isNineDarter ? 4000 : 1200);
    }
  }
}
