import { DartResult } from '../core/match/DartResult';
import { Visit } from '../core/match/Visit';
import { MatchSituation } from '../core/simulation/PerformancePipeline';

export interface MatchContext {
  playerId: string;
  remainingScore: number;
  opponentRemaining: number;
  dartNumberInVisit: number; // 1, 2, 3
  situation: MatchSituation;
  doubleInRequired?: boolean;
  doubleOutRequired?: boolean;
  hasDoubledIn?: boolean;
}

/**
 * Common interface for all dart input sources.
 * In accordance with Technical Blueprint Section 21 & 364.
 */
export interface IInputProvider {
  readonly type: 'statistical' | 'manual' | 'camera';
  getNextDart(context: MatchContext): Promise<DartResult>;
  getNextVisit(context: MatchContext): Promise<Visit>;
}
