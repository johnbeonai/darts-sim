import { IInputProvider, MatchContext } from './InputProvider';
import { DartResult } from '../core/match/DartResult';
import { Visit } from '../core/match/Visit';

export interface PendingVisitSubmission {
  darts: DartResult[];
  visitTotal?: number;
}

/**
 * Manual Input Provider for Real-Dart Hybrid Play (V1)
 * Awaits user input from the physical dartboard entry UI.
 */
export class ManualInputProvider implements IInputProvider {
  public readonly type = 'manual';

  private dartResolver: ((dart: DartResult) => void) | null = null;
  private visitResolver: ((visit: Visit) => void) | null = null;
  private currentContext: MatchContext | null = null;

  public async getNextDart(context: MatchContext): Promise<DartResult> {
    this.currentContext = context;
    return new Promise<DartResult>((resolve) => {
      this.dartResolver = resolve;
    });
  }

  public async getNextVisit(context: MatchContext): Promise<Visit> {
    this.currentContext = context;
    return new Promise<Visit>((resolve) => {
      this.visitResolver = resolve;
    });
  }

  /**
   * Called by the UI when the player inputs and confirms a single dart
   */
  public submitDart(dart: DartResult): void {
    if (this.dartResolver) {
      const resolver = this.dartResolver;
      this.dartResolver = null;
      resolver(dart);
    }
  }

  /**
   * Called by the UI when the player confirms a 3-dart visit
   */
  public submitVisit(visit: Visit): void {
    if (this.visitResolver) {
      const resolver = this.visitResolver;
      this.visitResolver = null;
      resolver(visit);
    }
  }

  /**
   * Called by the UI when quick total score is entered
   */
  public submitQuickTotal(scoreBefore: number, total: number): void {
    if (this.visitResolver && this.currentContext) {
      const visit = Visit.fromTotal(this.currentContext.playerId, scoreBefore, total);
      this.submitVisit(visit);
    }
  }
}
